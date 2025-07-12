const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'jpeg', 'jpg', 'png']
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: function() {
      const days = parseInt(process.env.CERTIFICATE_EXPIRY_DAYS) || 7;
      return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries (excluding _id as it's automatically indexed)
certificateSchema.index({ uploadDate: -1 });
certificateSchema.index({ expiryDate: 1 });
certificateSchema.index({ fileType: 1 });
certificateSchema.index({ isActive: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);