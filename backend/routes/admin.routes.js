const express = require('express');
const router  = express.Router();
const {
  getPendingNotes,
  approveNote,
  rejectNote,
  getAllNotes,
  getAllUsers,
  deleteUser,
  disableUser,
  enableUser,
  getStats,
} = require('../controllers/admin.controller');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const adminMiddleware     = require('../middleware/admin.middleware');

// all admin routes need both middlewares
router.use(verifyFirebaseToken, adminMiddleware);

// specific named routes FIRST
router.get('/stats',              getStats);
router.get('/pending',            getPendingNotes);
router.get('/notes',              getAllNotes);
router.get('/users',              getAllUsers);
router.delete('/users/:id',       deleteUser);
router.put('/users/:id/disable',  disableUser);
router.put('/users/:id/enable',   enableUser);

// dynamic routes LAST
router.put('/:id/approve',        approveNote);
router.put('/:id/reject',         rejectNote);

module.exports = router;