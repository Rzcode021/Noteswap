const Notification = require('../models/Notification')

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate('sender', 'name profilePicture')
      .populate('note', 'title')
      .sort({ createdAt: -1 })
      .limit(20)

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    })

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true })
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    )
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id)
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE /api/notifications/clear-all
const clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id })
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE /api/notifications/clear-all
// const clearAll = async (req, res) => {
//   try {
//     console.log("🧹 Clear All triggered for user:", req.user._id); // Check if ID exists

//     const result = await Notification.deleteMany({ recipient: req.user._id });

//     console.log("🗑️ Documents actually deleted from DB:", result.deletedCount); // Check if Mongo found them

//     return res.status(200).json({ success: true, deletedCount: result.deletedCount });
//   } catch (error) {
//     console.error("❌ Clear All Error:", error.message);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// }

// ✅ Helper — create notification (used internally)
const createNotification = async ({ recipient, sender, type, note, message, rejectionReason }, req) => {
  try {
    // Don't notify yourself
    if (recipient?.toString() === sender?.toString()) return

    // ✅ Save to MongoDB
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      note,
      message,
      rejectionReason: rejectionReason || null,
    })

    // ✅ Populate sender info for real-time event
    const populated = await Notification.findById(notification._id)
      .populate('sender', 'name profilePicture')
      .populate('note', 'title')

    // ✅ Emit real-time event via Socket.io
    if (req?.app) {
      const io = req.app.get('io')
      if (io) {
        io.to(`user_${recipient}`).emit('new_notification', populated)
        console.log(`📡 Notification sent to user_${recipient}`)
      }
    }

    return populated
  } catch (error) {
    console.error('Create notification error:', error.message)
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
  createNotification,
}