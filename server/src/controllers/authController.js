

const authServices = require('../services/authServices');
const asyncHandler = require('../utils/asyncHandler');


const register = asyncHandler(async (req, res) => {

  const user = await authServices.registerUser(req.body);

  req.session.userId = user.id;

  res.status(201).json({
    status: 'success',
    message: 'Registration successful.',
    data: { user },
  });
});

const login = asyncHandler(async (req, res) => {
  const user = await authServices.loginUser(req.body);

  req.session.userId = user.id;

  res.status(200).json({
    status: 'success',
    message: 'Login successful.',
    data: { user },
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authServices.getUserById(req.session.userId);

  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'User account not found. Please log in again.',
    });
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

const logout = asyncHandler(async (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Could not log out.',
      });
    }

    res.clearCookie('connect.sid');

    return res.status(200).json({
      status: 'success',
      message: 'Logout successful.',
    });
  });
});

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};
