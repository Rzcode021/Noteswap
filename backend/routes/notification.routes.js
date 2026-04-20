const express = require('express')
const router  = express.Router()
const  verifyFirebaseToken  = require('../middleware/verifyFirebaseToken')
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
} = require('../controllers/notification.controller')

router.get('/',               verifyFirebaseToken, getNotifications)
router.put('/read-all',       verifyFirebaseToken, markAllAsRead)
router.put('/:id/read',       verifyFirebaseToken, markAsRead)
router.delete('/clear-all',   verifyFirebaseToken, clearAll)
router.delete('/:id',         verifyFirebaseToken, deleteNotification)

module.exports = router