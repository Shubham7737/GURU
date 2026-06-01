const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'GuruEdu'} <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message,
      text: options.text || options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Email sending error:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;
