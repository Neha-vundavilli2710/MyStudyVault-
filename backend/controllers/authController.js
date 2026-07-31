import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';
import crypto from 'crypto';

// @desc   Register a new user (student or faculty)
// @route  POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, collegeId, branch, semester, facultyId, department } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      collegeId,
      branch,
      semester,
      facultyId,
      department,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// @desc   Login user
// @route  POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔑 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    console.log('👤 User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('❌ No user with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('🔐 User password hash exists:', user.password ? 'YES' : 'NO');
    
    const isMatch = await user.matchPassword(password);
    console.log('✅ Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.role === 'faculty' && !user.isApproved) {
      console.log('⏳ Faculty not approved:', email);
      return res.status(403).json({ message: 'Your faculty account is pending admin approval' });
    }

    console.log('✔️ Login successful for:', email);
    res.status(200).json({
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('🚨 Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// ... existing loginUser and registerUser functions ...

// @desc   Forgot password - send reset link
// @route  POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiry (30 minutes from now)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    // Create reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetLink);
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Clear tokens if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    res.status(200).json({
      message: 'Password reset link sent to your email. It will expire in 30 minutes.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing forgot password request' });
  }
};

// @desc   Reset password with token
// @route  POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: 'Password fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash token and find user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('✔️ Password reset successful for:', user.email);

    res.status(200).json({
      message: 'Password has been reset successfully. Please login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};