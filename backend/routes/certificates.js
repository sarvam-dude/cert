const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Certificate = require('../models/Certificate');
const upload = require('../middleware/upload');
const emailService = require('../utils/emailService');
const qrGenerator = require('../utils/qrGenerator');

const router = express.Router();

// CORS is handled in server.js

// POST /upload - Upload certificate
router.post('/upload', upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { originalname, filename, path: filePath, mimetype, size } = req.file;
    const certificateId = req.certificateId;

    // Determine file type
    const fileExtension = path.extname(originalname).toLowerCase().substring(1);
    
    // Create certificate record in database
    const certificate = new Certificate({
      _id: certificateId,
      fileName: filename,
      originalName: originalname,
      filePath: filePath,
      fileType: fileExtension,
      fileSize: size
    });

    await certificate.save();

    // Generate view URL
    const viewUrl = `${process.env.FRONTEND_URL}/view/${certificateId}`;

    // Generate QR code (optional)
    let qrCode = null;
    try {
      qrCode = await qrGenerator.generateQR(viewUrl);
    } catch (qrError) {
      console.error('QR generation failed:', qrError);
    }

    // Send email if requested
    if (req.body.email) {
      try {
        await emailService.sendCertificateLink(req.body.email, certificateId, originalname);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the upload if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: {
        id: certificateId,
        fileName: originalname,
        fileSize: size,
        fileType: fileExtension,
        uploadDate: certificate.uploadDate,
        expiryDate: certificate.expiryDate,
        viewUrl: viewUrl,
        qrCode: qrCode
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if database save fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload certificate'
    });
  }
});

// GET /certificate/:id - Get certificate file
router.get('/certificate/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find certificate in database
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check if certificate is active and not expired
    if (!certificate.isActive || new Date() > certificate.expiryDate) {
      return res.status(410).json({
        success: false,
        message: 'Certificate has expired or is no longer available'
      });
    }

    // Check if file exists
    if (!fs.existsSync(certificate.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found'
      });
    }

    // Set appropriate headers
    const fileExtension = certificate.fileType.toLowerCase();
    let contentType = 'application/octet-stream';

    switch (fileExtension) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${certificate.originalName}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Stream the file
    const fileStream = fs.createReadStream(certificate.filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Certificate retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve certificate'
    });
  }
});

// GET /certificate/:id/info - Get certificate metadata
router.get('/certificate/:id/info', async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check if certificate is active and not expired
    if (!certificate.isActive || new Date() > certificate.expiryDate) {
      return res.status(410).json({
        success: false,
        message: 'Certificate has expired or is no longer available'
      });
    }

    res.json({
      success: true,
      data: {
        id: certificate._id,
        fileName: certificate.originalName,
        fileType: certificate.fileType,
        fileSize: certificate.fileSize,
        uploadDate: certificate.uploadDate,
        expiryDate: certificate.expiryDate
      }
    });

  } catch (error) {
    console.error('Certificate info retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve certificate information'
    });
  }
});

// GET /certificate/:id/qr - Generate QR code for certificate
router.get('/certificate/:id/qr', async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (!certificate.isActive || new Date() > certificate.expiryDate) {
      return res.status(410).json({
        success: false,
        message: 'Certificate has expired or is no longer available'
      });
    }

    const viewUrl = `${process.env.FRONTEND_URL}/view/${id}`;
    const qrCodeBuffer = await qrGenerator.generateQRBuffer(viewUrl);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="certificate-${id}-qr.png"`);
    res.send(qrCodeBuffer);

  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code'
    });
  }
});

module.exports = router;