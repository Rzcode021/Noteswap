const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    // Content
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },

    // File info
    fileUrl: {
      type: String,
      required: true,
    },
    filePublicId: {       
     type: String,
     required: true,
     },
    fileType: {
      type: String,
      enum: ['pdf', 'image', 'docx', 'pptx'],
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    // Add after fileSize field
originalName: {
  type: String,
  default: null,
},
    pageCount: {
      type: Number,
      default: null,
    },

    // Classification
    
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
   unit: {
  type: String,
  required: true,
  trim: true,
  default: 'General',
},
    semester: {
      type: String,
      required: true,
    },
    year: {
  type: String,
  required: true,
  default: 'Not specified',
},
    college: {
      type: String,
      required: true,
      trim: true,
    },
    // Classification
branch: {
  type: String,
  enum: [
    'CSE',    // Computer Science Engineering
    'IT',     // Information Technology
    'ECE',    // Electronics & Communication
    'EE',     // Electrical Engineering
    'ME',     // Mechanical Engineering
    'CE',     // Civil Engineering
    'MCA',    // Master of Computer Applications
    'MBA',    // Master of Business Administration
    'Other',  // Other branches
  ],
  default: 'Other',
},

    // Uploader
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Admin approval
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
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
    downloadsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// index for fast search by subject, status, semester
noteSchema.index({ subject: 1, status: 1 });
noteSchema.index({ status: 1, createdAt: -1 });
noteSchema.index({ uploadedBy: 1 });
// Add to existing indexes
noteSchema.index({ branch: 1, status: 1 })

module.exports = mongoose.model('Note', noteSchema);