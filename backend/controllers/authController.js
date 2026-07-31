import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

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