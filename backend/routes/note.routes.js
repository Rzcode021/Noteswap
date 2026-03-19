const express = require('express');
const router  = express.Router();
const {
  getNotes,
  getNoteById,
  uploadNote,
  likeNote,
  downloadNote,
  getMyNotes,
  deleteNote,
} = require('../controllers/note.controller');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const { handleUpload }    = require('../middleware/upload.middleware');

// public routes
router.get('/', getNotes);

// specific named routes MUST come before /:id
router.get('/user/my',          verifyFirebaseToken, getMyNotes);
router.post('/upload',          verifyFirebaseToken, handleUpload, uploadNote);

// dynamic routes come LAST
router.get('/:id',              getNoteById);
router.post('/:id/like',        verifyFirebaseToken, likeNote);
router.post('/:id/download',    verifyFirebaseToken, downloadNote);
router.delete('/:id',           verifyFirebaseToken, deleteNote);

module.exports = router;