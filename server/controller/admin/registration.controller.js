const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
require('dotenv').config();

const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    // Fixed credentials check
    if (email === 'admin@gmail.com' && password === 'admin') {
        const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.status(200).json({ token });
    }

    res.status(401).json({ message: 'Invalid admin credentials' });
};

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'student',
        });

        // Send welcome email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Welcome to GuruEdu',
                message: 'Welcome to GuruEdu platform. Start learning today!',
            });
        } catch (emailError) {
            console.error('Email could not be sent:', emailError);
            // Don't fail the signup if email fails
        }

        res.status(201).json({ message: 'Student registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            return res.status(200).json({ name: 'System Admin', email: 'admin@gmail.com', role: 'admin' });
        }
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { adminLogin, signup, login, getProfile };
