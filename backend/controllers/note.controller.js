const { cloudinary } = require('../config/cloudinary');
const Note = require('../models/Note');
const Subject = require('../models/Subject');
const User = require('../models/User');
const mongoose = require('mongoose')

// GET /api/notes
// Get all approved notes — with filters
const getNotes = async (req, res) => {
  try {
    const { subject, unit, semester, year, college, search, page = 1, limit = 12 } = req.query;

    // build filter object
    const filter = { status: 'approved' };

    if (subject)   filter.subject  = subject;
    if (unit)      filter.unit     = unit;
    if (semester)  filter.semester = semester;
    if (year)      filter.year     = year;
    if (college)   filter.college  = new RegExp(college, 'i');
    if (search)    filter.title    = new RegExp(search, 'i');

    const skip = (page - 1) * limit;

    const notes = await Note.find(filter)
      .populate('subject', 'name slug color icon')
      .populate('uploadedBy', 'name profilePicture college')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Note.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: notes.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: notes,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/notes/:id
// Get single note by ID
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('subject', 'name slug color icon')
      .populate('uploadedBy', 'name profilePicture college semester totalUploads totalDownloads');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // only show approved notes to public
    if (note.status !== 'approved') {
      return res.status(403).json({ message: 'This note is not available' });
    }

    // increment views
    note.viewsCount += 1;
    await note.save();

    return res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/notes/upload
// Upload a new note — protected
const uploadNote = async (req, res) => {
  console.log('📦 Upload body:', req.body)
  console.log('📦 Upload file:', req.file?.originalname)
  console.log('📦 Full file object:', req.file)

  try {
    const { title, description, subject, unit, semester, year, college, tags } = req.body

    // validate required fields — unit is optional
  if (!title || !subject || !semester || !college) {
  return res.status(400).json({ message: 'Please fill all required fields' })
}

    // check file exists
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' })
    }

    // ✅ resolve subject — handle both ObjectId and custom string
    let subjectDoc = null

    if (mongoose.Types.ObjectId.isValid(subject)) {
      subjectDoc = await Subject.findById(subject)
    }

    if (!subjectDoc) {
      subjectDoc = await Subject.findOne({
        name: { $regex: new RegExp(`^${subject.trim()}$`, 'i') }
      })
      if (!subjectDoc) {
  // Generate slug from subject name
  const slug = subject.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // replace spaces/special chars with -
    .replace(/^-+|-+$/g, '')       // remove leading/trailing dashes

  subjectDoc = await Subject.create({
    name: subject.trim(),
    slug: slug,
  })
  console.log('✅ New subject created:', subjectDoc.name, 'slug:', slug)
}
    }

    console.log('✅ Subject resolved:', subjectDoc.name, subjectDoc._id)

    // ✅ Cloudinary file fields — .path and .filename are correct for multer-cloudinary
    // but fileSize could be .bytes OR .size depending on version
    const fileUrl      = req.file.path
    const filePublicId = req.file.filename
    const fileSize     = req.file.bytes || req.file.size || 0

    console.log('✅ File URL:', fileUrl)
    console.log('✅ File Public ID:', filePublicId)
    console.log('✅ File Size:', fileSize)

    // ✅ determine file type from mimetype
    let fileType = 'pdf'
    if (req.file.mimetype.startsWith('image/'))             fileType = 'image'
    else if (req.file.mimetype.includes('wordprocessingml')) fileType = 'docx'
    else if (req.file.mimetype.includes('presentationml'))   fileType = 'pptx'

    console.log('✅ File type:', fileType)

    // ✅ create note
    const noteData = {
      title:        title.trim(),
      description:  description?.trim() || '',
      tags:         tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      fileUrl,
      filePublicId,
      fileType,
       fileSize:     req.file.bytes || req.file.size || 0,
        originalName: req.file.originalname,
      subject:      subjectDoc._id,
      unit:         unit?.trim() || 'General',
      semester,
      year:         year?.trim() || 'Not specified',
      college:      college.trim(),
      uploadedBy:   req.user._id,
      status:       'pending',
    }

    console.log('✅ Creating note with data:', JSON.stringify(noteData, null, 2))

    const note = await Note.create(noteData)

    console.log('✅ Note created:', note._id)

    // increment user's total uploads
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalUploads: 1 } })

    return res.status(201).json({
      success: true,
      message: 'Note uploaded successfully — pending admin approval',
      data: note,
    })

  } catch (error) {
    console.error('❌ Upload error message:', error.message)
    console.error('❌ Upload error stack:', error.stack)
    console.error('❌ Validation errors:', error.errors)

    // ✅ cleanup Cloudinary if DB save failed
    if (req.file?.filename) {
      try {
        const resourceType = req.file.mimetype?.startsWith('image/') ? 'image' : 'raw'
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: resourceType })
        console.log('🗑️ Cleaned up Cloudinary file:', req.file.filename)
      } catch (cleanupErr) {
        console.error('🗑️ Cloudinary cleanup failed:', cleanupErr.message)
      }
    }

    return res.status(500).json({
      message: 'Server error',
      error: error.message,
      validationErrors: error.errors
    })
  }
}
// POST /api/notes/:id/like
// Like or unlike a note — protected
const likeNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const userId = req.user._id;
    const alreadyLiked = note.likes.includes(userId);

    if (alreadyLiked) {
      // unlike — remove userId from likes array
      note.likes     = note.likes.filter(id => id.toString() !== userId.toString());
      note.likesCount = Math.max(0, note.likesCount - 1);
    } else {
      // like — add userId to likes array
      note.likes.push(userId);
      note.likesCount += 1;
    }

    await note.save();

    return res.status(200).json({
      success: true,
      message: alreadyLiked ? 'Note unliked' : 'Note liked',
      liked: !alreadyLiked,
      likesCount: note.likesCount,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/notes/:id/download
// Increment download count — protected
const downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    note.downloadsCount += 1
    await note.save()

    await User.findByIdAndUpdate(note.uploadedBy, { $inc: { totalDownloads: 1 } })

    // ✅ Build proper filename with correct extension
    const originalName = note.originalName || `${note.title}.${note.fileType}`
    const safeName = encodeURIComponent(
      originalName.replace(/[^a-zA-Z0-9._-]/g, '_')
    )

    // ✅ Use fl_attachment with correct filename to force proper download
    let downloadUrl = note.fileUrl
    if (note.fileUrl.includes('cloudinary.com')) {
      downloadUrl = note.fileUrl.replace(
        '/upload/',
        `/upload/fl_attachment:${safeName}/`
      )
    }

    return res.status(200).json({
      success: true,
      message: 'Download count updated',
      fileUrl: downloadUrl,
      originalName,
      downloadsCount: note.downloadsCount,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}
// GET /api/notes/my
// Get logged in user's uploaded notes — protected
const getMyNotes = async (req, res) => {
  try {
    const notes = await Note.find({ uploadedBy: req.user._id })
      .populate('subject', 'name slug color icon')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/notes/:id
// Delete a note — owner or admin only
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const isOwner = note.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }

    // delete file from Cloudinary
    if (note.filePublicId) {
      try {
        const resourceType = note.fileType === 'image' ? 'image' : 'raw';
        await cloudinary.uploader.destroy(note.filePublicId, {
          resource_type: resourceType,
        });
        console.log(`Deleted from Cloudinary: ${note.filePublicId}`);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError.message);
      }
    }

    await note.deleteOne();

    // decrement user's total uploads
    await User.findByIdAndUpdate(note.uploadedBy, { $inc: { totalUploads: -1 } });

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getNotes,
  getNoteById,
  uploadNote,
  likeNote,
  downloadNote,
  getMyNotes,
  deleteNote,
};