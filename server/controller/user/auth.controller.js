const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../utils/jwt');
const nodemailer = require('nodemailer');

// STUDENT REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    // Check if user already exists
    const [existing] = await pool.query(
      "SELECT id FROM tbl_users WHERE email = $1",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      "INSERT INTO tbl_users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
      [name, email, hashedPassword, 'student']
    );

    const newUserId = result[0]?.id;

    // Generate token
    const token = generateToken({
      id: newUserId,
      name,
      email,
      role: 'student'
    });

    // Send Welcome Email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        const mailOptions = {
          from: `${process.env.EMAIL_FROM_NAME || 'GuruEdu'} <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Welcome to GuruEdu!',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h1 style="color: #4f46e5;">Welcome to GuruEdu, ${name}!</h1>
              <p>We are thrilled to have you join our learning platform.</p>
              <p>Explore our wide range of professional courses and start your learning journey today.</p>
              <p>Best regards,<br/>The GuruEdu Team</p>
            </div>
          `,
        };
        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error('Welcome email failed to send:', emailError);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: {
        token,
        user: {
          id: newUserId,
          name,
          email,
          role: 'student'
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

// STUDENT LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user
    const [users] = await pool.query(
      "SELECT * FROM tbl_users WHERE email = $1",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
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

// STUDENT LOGOUT
exports.logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GOOGLE SIGN-IN / SIGN-UP
exports.googleAuth = async (req, res) => {
  try {
    const { id_token } = req.body;
    if (!id_token) return res.status(400).json({ success: false, message: 'Missing id_token' });

    // Verify token with Google
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
    if (!verifyRes.ok) return res.status(401).json({ success: false, message: 'Invalid Google token' });
    const gUser = await verifyRes.json();

    // Optional: check audience
    if (process.env.GOOGLE_CLIENT_ID && gUser.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ success: false, message: 'Token audience mismatch' });
    }

    const email = gUser.email;
    const name = gUser.name || gUser.email.split('@')[0];

    // Check if user exists
    const [existing] = await pool.query('SELECT * FROM tbl_users WHERE email = $1', [email]);
    let userId;
    let isNew = false;

    if (existing.length > 0) {
      userId = existing[0].id;
    } else {
      // Create a random password for OAuth-created users
      const randomPass = Math.random().toString(36).slice(-10);
      const hashed = await bcrypt.hash(randomPass, 10);
      const [result] = await pool.query(
        'INSERT INTO tbl_users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, email, hashed, 'student']
      );
      userId = result[0]?.id;
      isNew = true;

      // Send welcome email to newly created user
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          });
          const mailOptions = {
            from: `${process.env.EMAIL_FROM_NAME || 'GuruEdu'} <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to GuruEdu!',
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h1 style="color: #4f46e5;">Welcome to GuruEdu, ${name}!</h1>
                <p>Your account was created using Google Sign-In. Use your Google account to login anytime.</p>
                <p>Best regards,<br/>The GuruEdu Team</p>
              </div>
            `,
          };
          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          console.error('Welcome email failed to send (google):', emailError);
        }
      }
    }

    // Generate token and return user
    const token = generateToken({ id: userId, name, email, role: 'student' });

    return res.status(200).json({
      success: true,
      message: isNew ? 'User created via Google' : 'Login successful',
      data: { token, user: { id: userId, name, email, role: 'student' } }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

