const Note    = require('../models/Note');
const User    = require('../models/User');
const Subject = require('../models/Subject');
const { cloudinary } = require('../config/cloudinary');
const admin   = require('../config/firebase');

// GET /api/admin/pending
const getPendingNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const notes = await Note.find({ status: 'pending' })
      .populate('subject', 'name slug color icon')
      .populate('uploadedBy', 'name email profilePicture college')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Note.countDocuments({ status: 'pending' });

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

// PUT /api/admin/:id/approve
const approveNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.status === 'approved') {
      return res.status(400).json({ message: 'Note is already approved' });
    }

    note.status          = 'approved';
    note.approvedAt      = new Date();
    note.rejectionReason = null;
    await note.save();

    // increment subject notes count
    await Subject.findByIdAndUpdate(note.subject, { $inc: { notesCount: 1 } });

    return res.status(200).json({
      success: true,
      message: 'Note approved successfully',
      data: note,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/:id/reject
const rejectNote = async (req, res) => {
  try {
    const { reason } = req.body;

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.status === 'rejected') {
      return res.status(400).json({ message: 'Note is already rejected' });
    }

    // if note was previously approved decrement subject count
    if (note.status === 'approved') {
      await Subject.findByIdAndUpdate(note.subject, { $inc: { notesCount: -1 } });
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

    // delete note from MongoDB completely
    await note.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Note rejected and file deleted from cloud',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/notes
const getAllNotes = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const notes = await Note.find(filter)
      .populate('subject', 'name slug color')
      .populate('uploadedBy', 'name email college')
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

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments();

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: users,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/users/:id/disable
const disableUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // prevent admin from disabling themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot disable your own account' });
    }

    // prevent disabling another admin
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'You cannot disable an admin account' });
    }

    await admin.auth().revokeRefreshTokens(user.firebaseUid);
    await admin.auth().updateUser(user.firebaseUid, { disabled: true });

    user.isDisabled = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User disabled and all sessions revoked',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/users/:id/enable
const enableUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await admin.auth().updateUser(user.firebaseUid, { disabled: false });

    user.isDisabled = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User enabled successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalUsers    = await User.countDocuments();
    const totalNotes    = await Note.countDocuments({ status: 'approved' });
    const pendingNotes  = await Note.countDocuments({ status: 'pending' });
    const rejectedNotes = await Note.countDocuments({ status: 'rejected' });
    const allNotesCount = await Note.countDocuments();
    const totalSubjects = await Subject.countDocuments({ isActive: true });

    // total downloads across all notes
    const downloadsResult = await Note.aggregate([
      { $group: { _id: null, total: { $sum: '$downloadsCount' } } }
    ]);
    const totalDownloads = downloadsResult[0]?.total || 0;

    // total likes across all notes
    const likesResult = await Note.aggregate([
      { $group: { _id: null, total: { $sum: '$likesCount' } } }
    ]);
    const totalLikes = likesResult[0]?.total || 0;

    // notes per subject — all subjects even with 0 notes
    const notesBySubject = await Subject.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'notes',
          let: { subjectId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$subject', '$$subjectId'] },
                status: 'approved',
              },
            },
          ],
          as: 'notes',
        },
      },
      {
        $project: {
          name: 1,
          color: 1,
          icon: 1,
          count: { $size: '$notes' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // recent 5 users who joined
    const recentUsers = await User.find()
      .select('name email profilePicture college createdAt loginProvider')
      .sort({ createdAt: -1 })
      .limit(5);

    // recent 5 approved notes
    const recentNotes = await Note.find({ status: 'approved' })
      .populate('subject', 'name color')
      .populate('uploadedBy', 'name')
      .sort({ approvedAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalNotes,
        allNotesCount,
        pendingNotes,
        rejectedNotes,
        totalSubjects,
        totalDownloads,
        totalLikes,
        notesBySubject,
        recentUsers,
        recentNotes,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPendingNotes,
  approveNote,
  rejectNote,
  getAllNotes,
  getAllUsers,
  deleteUser,
  disableUser,
  enableUser,
  getStats,
};