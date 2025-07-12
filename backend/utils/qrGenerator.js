const QRCode = require('qrcode');

class QRGenerator {
  async generateQR(url) {
    try {
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('QR Code generation failed:', error);
      throw error;
    }
  }

  async generateQRBuffer(url) {
    try {
      // Generate QR code as buffer
      const qrCodeBuffer = await QRCode.toBuffer(url, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });

      return qrCodeBuffer;
    } catch (error) {
      console.error('QR Code buffer generation failed:', error);
      throw error;
    }
  }
}

module.exports = new QRGenerator();