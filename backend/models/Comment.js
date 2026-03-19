const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    // Content
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // References
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Engagement
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },

  },
  { timestamps: true }
);

// index for fast fetch of comments by note
commentSchema.index({ note: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);