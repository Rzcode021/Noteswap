const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Who triggered this notification
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Type of notification
    type: {
      type: String,
      enum: [
        'note_liked',
        'note_downloaded',
        'note_approved',
        'note_rejected',
        'note_commented',
      ],
      required: true,
    },

    // Related note
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      default: null,
    },

    // Message to show
    message: {
      type: String,
      required: true,
    },

    // Extra data
    rejectionReason: {
      type: String,
      default: null,
    },

    // Read status
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// ===== INDEXES FOR PERFORMANCE & MEMORY =====

// 1. Fast sorting for the notification dropdown (Newest first)
notificationSchema.index({ recipient: 1, createdAt: -1 })

// 2. Lightning-fast counting for the unread red dot badge
notificationSchema.index({ recipient: 1, isRead: 1 })

// 3. THE MEMORY SAVER (TTL Index) 
// MongoDB will automatically delete documents 30 days (2,592,000 seconds) after createdAt
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 })

module.exports = mongoose.model('Notification', notificationSchema)