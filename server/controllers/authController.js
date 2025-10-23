// controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google OAuth token and authenticate user
 */
exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { googleId: googleId },
        { email: email }
      ]
    });

    if (user) {
      // Update user with Google ID if they don't have it
      if (!user.googleId) {
        user.googleId = googleId;
        user.authMethod = 'google';
        user.profilePicture = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        googleId: googleId,
        email: email,
        name: name,
        profilePicture: picture,
        authMethod: 'google',
        resumes: []
      });
      await user.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        authMethod: user.authMethod
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Authentication successful',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        authMethod: user.authMethod
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      message: 'Authentication failed', 
      error: error.message 
    });
  }
};

/**
 * Register a new user with email and password
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      authMethod: 'local',
      resumes: []
    });

    await user.save();

    // Generate JWT token
    const jwtToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        authMethod: user.authMethod
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authMethod: user.authMethod
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
};

/**
 * Login user with email and password
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user has password (not OAuth only)
    if (!user.password) {
      return res.status(401).json({ 
        message: 'Please use Google sign-in for this account' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        authMethod: user.authMethod
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        authMethod: user.authMethod
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        authMethod: user.authMethod,
        resumes: user.resumes
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Failed to get profile', 
      error: error.message 
    });
  }
};
