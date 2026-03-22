const express = require('express');
const router  = express.Router();
const {
  getComments,
  addComment,
  deleteComment,
  likeComment,
  editComment,
} = require('../controllers/comment.controller');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

// get comments for a note — protected
router.get('/:noteId',   getComments);

// add comment to a note — protected
router.post('/:noteId',      verifyFirebaseToken, addComment);

// edit a comment — protected
router.put('/:id',           verifyFirebaseToken, editComment);

// delete a comment — protected
router.delete('/:id',        verifyFirebaseToken, deleteComment);

// like or unlike a comment — protected
router.post('/:id/like',     verifyFirebaseToken, likeComment);

module.exports = router;