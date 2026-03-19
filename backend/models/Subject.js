const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: '#7F77DD', // default violet
    },
    icon: {
      type: String,
      default: '📚',
    },

    // units array — e.g. ["Unit 1 — Intro", "Unit 2 — SDLC"]
    units: {
      type: [String],
      default: [],
    },

    // stats
    notesCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);