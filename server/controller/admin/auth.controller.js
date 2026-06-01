const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../utils/jwt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ADMIN LOGIN using tbl_admin_registration
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username and password",
      });
    }

    const [admins] = await pool.query(
      "SELECT * FROM tbl_admin_registration WHERE username = $1",
      [username]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin username or password",
      });
    }

    const admin = admins[0];
    let isMatch = false;

    if (typeof admin.password === 'string' && admin.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, admin.password);
    } else {
      isMatch = password === admin.password;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin username or password",
      });
    }

    const token = generateToken({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: 'admin',
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        token,
        user: {
          id: admin.id,
          username: admin.username,
          name: admin.name || admin.username,
          profile_pic: admin.profile_pic,
          role: 'admin'
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADMIN PROFILE (protected)
exports.getProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const [rows] = await pool.query('SELECT id, username, name, profile_pic FROM tbl_admin_registration WHERE id = $1', [adminId]);
    
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    
    const admin = rows[0];
    return res.status(200).json({ success: true, data: admin });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE ADMIN PROFILE (Profile Pic & Password)
exports.updateProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { password, name } = req.body;
    let profile_pic = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;

    let updateQuery = 'UPDATE tbl_admin_registration SET updatedAt = CURRENT_TIMESTAMP';
    let queryParams = [];
    let paramIndex = 1;

    if (name) {
      updateQuery += `, name = $${paramIndex++}`;
      queryParams.push(name);
    }

    if (password) {
      const pwdHash = await bcrypt.hash(password, 10);
      updateQuery += `, password = $${paramIndex++}`;
      queryParams.push(pwdHash);
    }

    if (profile_pic) {
      updateQuery += `, profile_pic = $${paramIndex++}`;
      queryParams.push(profile_pic);
    }

    updateQuery += ` WHERE id = $${paramIndex}`;
    queryParams.push(adminId);

    await pool.query(updateQuery, queryParams);

    const [updatedAdmin] = await pool.query('SELECT id, username, name, profile_pic FROM tbl_admin_registration WHERE id = $1', [adminId]);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedAdmin[0]
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// REQUEST OTP FOR PASSWORD RESET
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    
    // Find admin by email (assuming username is email format)
    const [admins] = await pool.query('SELECT * FROM tbl_admin_registration WHERE username = $1', [email]);
    if (!admins.length) return res.status(404).json({ success: false, message: 'Admin not found with this email' });

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in temporary table
    await pool.query(
      `INSERT INTO tbl_admin_otp (email, otp_hash, expires_at) VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO UPDATE SET otp_hash = EXCLUDED.otp_hash, expires_at = EXCLUDED.expires_at`, 
      [email, otpHash, expires]
    );

    // Send email via nodemailer (using .env config)
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'GuruEdu'} <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'GuruEdu Admin OTP for Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP for resetting your admin password is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
      `,
    };
    
    let emailSent = false;
    let localOtpMessage = '';
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try { 
        await transporter.sendMail(mailOptions); 
        emailSent = true;
      } catch (e) { 
        console.error('Email send error', e); 
        // Fallback to dev mode if email config is wrong
      }
    }

    if (!emailSent) {
      console.log('--- DEV MODE OTP ---');
      console.log('OTP for ' + email + ' is: ' + otp);
      console.log('--------------------');
      localOtpMessage = ' (Dev Mode: OTP logged to backend console)';
    }

    return res.status(200).json({ success: true, message: 'OTP sent successfully' + localOtpMessage });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// RESET PASSWORD USING OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: 'All fields required' });

    const [rows] = await pool.query('SELECT * FROM tbl_admin_otp WHERE email = $1', [email]);
    if (!rows.length) return res.status(400).json({ success: false, message: 'OTP not requested or expired' });
    
    const record = rows[0];
    if (new Date(record.expires_at) < new Date()) return res.status(400).json({ success: false, message: 'OTP has expired' });
    
    const match = await bcrypt.compare(otp, record.otp_hash);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    // Update admin password
    const pwdHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE tbl_admin_registration SET password = $1 WHERE username = $2', [pwdHash, email]);

    // Delete used OTP
    await pool.query('DELETE FROM tbl_admin_otp WHERE email = $1', [email]);

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

