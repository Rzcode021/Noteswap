const User = require('../models/User');
const Note = require('../models/Note');

// GET /api/users/profile
// Get logged in user's profile — protected
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-__v')
      .populate('bookmarks', 'title fileType subject unit semester status likesCount downloadsCount');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/users/profile
// Update logged in user's profile — protected
const updateProfile = async (req, res) => {
  try {
    const { name, college, semester, year, bio, profilePicture, phone } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name)             user.name           = name;
    if (college)          user.college        = college;
    if (semester)         user.semester       = semester;
    if (year)             user.year           = year;
    if (bio)              user.bio            = bio;
    if (profilePicture)   user.profilePicture = profilePicture;
    if (phone)          user.phone          = phone;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/users/profile/:id
// Get any user's public profile by id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name profilePicture college semester year bio totalUploads totalDownloads createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // get their approved uploaded notes
    const notes = await Note.find({ uploadedBy: req.params.id, status: 'approved' })
      .populate('subject', 'name slug color icon')
      .sort({ createdAt: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      data: { user, notes },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/users/bookmarks/:noteId
// Add or remove bookmark — protected
const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const noteId = req.params.noteId;

    // check note exists
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const alreadyBookmarked = user.bookmarks.includes(noteId);

    if (alreadyBookmarked) {
      // remove bookmark
      user.bookmarks = user.bookmarks.filter(
        id => id.toString() !== noteId.toString()
      );
    } else {
      // add bookmark
      user.bookmarks.push(noteId);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: alreadyBookmarked ? 'Bookmark removed' : 'Note bookmarked',
      bookmarked: !alreadyBookmarked,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/users/bookmarks
// Get all bookmarked notes — protected
const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'bookmarks',
        populate: { path: 'subject', select: 'name slug color icon' },
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      count: user.bookmarks.length,
      data: user.bookmarks,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/users/liked
// Get all liked notes — protected
const getLikedNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      likes: req.user._id,
      status: 'approved',
    })
      .populate('subject', 'name slug color icon')
      .populate('uploadedBy', 'name profilePicture')
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

module.exports = {
  getProfile,
  updateProfile,
  getUserById,
  toggleBookmark,
  getBookmarks,
  getLikedNotes,
};