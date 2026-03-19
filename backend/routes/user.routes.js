const express = require('express');
const router  = express.Router();
const {
  getProfile,
  updateProfile,
  getUserById,
  toggleBookmark,
  getBookmarks,
  getLikedNotes,
} = require('../controllers/user.controller');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

// protected routes — must be logged in
router.get('/profile',                  verifyFirebaseToken, getProfile);
router.put('/profile',                  verifyFirebaseToken, updateProfile);
router.get('/bookmarks',                verifyFirebaseToken, getBookmarks);
router.get('/liked',                    verifyFirebaseToken, getLikedNotes);
router.post('/bookmarks/:noteId',       verifyFirebaseToken, toggleBookmark);

// public route — view anyone's profile
router.get('/profile/:id',  getUserById);

module.exports = router;
