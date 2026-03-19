const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Firebase identity
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    loginProvider: {
      type: String,
      enum: ['email', 'google', 'phone'],
      default: 'email',
    },

    // Academic info
    college: {
      type: String,
      trim: true,
      default: null,
    },
    semester: {
      type: String,
      default: null,
    },
    year: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 300,
      default: null,
    },

    // Role
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Activity
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
      },
    ],
    totalUploads: {
      type: Number,
      default: 0,
    },
    totalDownloads: {
      type: Number,
      default: 0,
    },

    // Session info
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastActiveAt: {
      type: Date,
      default: null,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);