const mongoose = require('mongoose')

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: null,
    },
    logo: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
    courses: {
      type: [String],
      default: ['B.Tech', 'MCA', 'MBA', 'B.Sc', 'BCA', 'B.Com'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('University', universitySchema)