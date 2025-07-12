const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email configuration not found. Email service disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendCertificateLink(email, certificateId, fileName) {
    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    const viewUrl = `${process.env.FRONTEND_URL}/view/${certificateId}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Certificate Link - TS Techy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Certificate Link</h2>
          <p>Hello,</p>
          <p>Your certificate "<strong>${fileName}</strong>" has been uploaded successfully.</p>
          <p>You can view it using the link below:</p>
          <p style="margin: 20px 0;">
            <a href="${viewUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Certificate
            </a>
          </p>
          <p>Direct link: <a href="${viewUrl}">${viewUrl}</a></p>
          <p style="color: #666; font-size: 12px;">
            This link will expire in ${process.env.CERTIFICATE_EXPIRY_DAYS || 7} days.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            This is an automated message from TS Techy Certificate Management System.
          </p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();