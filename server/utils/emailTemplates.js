// Email templates

const getWelcomeEmailTemplate = (name) => {
  return {
    subject: 'Welcome to GuruEdu - Get Started Learning Today!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
            .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to GuruEdu! 🎓</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>Congratulations on successfully registering with GuruEdu! We're excited to have you join our learning community.</p>
              <p>🎯 <strong>Your account is now active and ready to use!</strong></p>
              <p>You can now:</p>
              <ul>
                <li>Access all course materials</li>
                <li>Join live classes</li>
                <li>Track your learning progress</li>
                <li>Connect with other learners</li>
              </ul>
              <p>Get started by exploring our courses or join our community. Happy learning!</p>
              <center>
                <a href="http://localhost:3000/dashboard" class="button">Go to Dashboard</a>
              </center>
            </div>
            <div class="footer">
              <p>© 2024 GuruEdu. All rights reserved.</p>
              <p>If you didn't create this account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Welcome to GuruEdu! Your account has been successfully created. Start learning today!`,
  };
};

const getLoginAlertTemplate = (name, timestamp, ipAddress) => {
  return {
    subject: 'New Login Activity - GuruEdu Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin: 20px 0; }
            .alert-box { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Login Alert 🔐</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${name}</strong>,</p>
              <p>We detected a new login to your GuruEdu account.</p>
              <div class="alert-box">
                <div class="info-row">
                  <strong>Date & Time:</strong>
                  <span>${timestamp}</span>
                </div>
                <div class="info-row">
                  <strong>IP Address:</strong>
                  <span>${ipAddress}</span>
                </div>
              </div>
              <p><strong>⚠️ If this wasn't you:</strong></p>
              <p>Please secure your account immediately by changing your password. If you have any concerns about unauthorized access, please contact our support team.</p>
              <p>Your account security is important to us!</p>
            </div>
            <div class="footer">
              <p>© 2024 GuruEdu. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `New login detected on your GuruEdu account at ${timestamp}. If this wasn't you, change your password immediately.`,
  };
};

const getForgotPasswordTemplate = (name, otp) => {
  return {
    subject: 'Reset Your GuruEdu Password - OTP Inside',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin: 20px 0; }
            .otp-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .warning { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request 🔐</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>We received a request to reset your GuruEdu password. Use the OTP below to proceed.</p>
              <div class="otp-box">
                <p style="margin: 0; color: #999; font-size: 14px;">Your OTP is:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Valid for 10 minutes</p>
              </div>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p style="margin: 10px 0 0 0;">
                  Never share this OTP with anyone. GuruEdu staff will never ask for your OTP. If you didn't request this, ignore this email.
                </p>
              </div>
              <p><strong>Steps to reset your password:</strong></p>
              <ol>
                <li>Go to the password reset page</li>
                <li>Enter your email address</li>
                <li>Enter the OTP: <strong>${otp}</strong></li>
                <li>Create a new password</li>
                <li>Confirm your password</li>
              </ol>
            </div>
            <div class="footer">
              <p>© 2024 GuruEdu. All rights reserved.</p>
              <p>If you have any questions, contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Your OTP to reset password is: ${otp}. Valid for 10 minutes. Do not share this OTP.`,
  };
};

const getEmailVerificationTemplate = (name, otp) => {
  return {
    subject: 'Verify Your Email - GuruEdu Account Confirmation',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin: 20px 0; }
            .otp-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
            .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email ✓</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>Thank you for registering with GuruEdu! To complete your registration, please verify your email address using the OTP below.</p>
              <div class="otp-box">
                <p style="margin: 0; color: #999; font-size: 14px;">Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Valid for 10 minutes</p>
              </div>
              <p>Enter this code in the verification page to confirm your email address.</p>
              <center>
                <a href="http://localhost:3000/verify-email" class="button">Go to Verification Page</a>
              </center>
            </div>
            <div class="footer">
              <p>© 2024 GuruEdu. All rights reserved.</p>
              <p>If you didn't create this account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Your email verification code is: ${otp}. Valid for 10 minutes.`,
  };
};

const getPasswordChangedTemplate = (name, timestamp) => {
  return {
    subject: 'Password Changed Successfully - GuruEdu',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin: 20px 0; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Changed Successfully ✓</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <div class="success-box">
                <p style="margin: 0;"><strong>Your password was successfully changed on ${timestamp}</strong></p>
              </div>
              <p>If you didn't make this change, please secure your account immediately by contacting our support team.</p>
              <p>For security reasons:</p>
              <ul>
                <li>Never share your password with anyone</li>
                <li>Use a strong, unique password</li>
                <li>Change your password regularly</li>
                <li>Sign out of shared devices</li>
              </ul>
            </div>
            <div class="footer">
              <p>© 2024 GuruEdu. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Your password was successfully changed on ${timestamp}.`,
  };
};

module.exports = {
  getWelcomeEmailTemplate,
  getLoginAlertTemplate,
  getForgotPasswordTemplate,
  getEmailVerificationTemplate,
  getPasswordChangedTemplate,
};
