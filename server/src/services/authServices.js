
const bycript = require('bcrypt');

const userRepository = require('../repositories/userRepository');

async function registerUser(userData = {}) {
  const { name, email, password } = userData;

  // Check that all required fields are provided
  if (
    typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !name.trim() ||
        !email.trim() ||
        !password
  ) {
    const error = new Error(
      'Name, email, and password are required.'
    );
    error.statusCode = 400;
    throw error;
  }

  const normalName = name.trim();
  const normalEmail = email.trim().toLowerCase();

  // Validate email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalEmail)) {
    const error = new Error(
      'Please provide a valid email address.'
    );
    error.statusCode = 400;
    throw error;
  }

  // Enforce the approved name-length requirement
  if (normalName.length < 2 || normalName.length > 40) {
    const error = new Error(
      'Name must be between 2 and 40 characters.'
    );
    error.statusCode = 400;
    throw error;
  }

  // Prevent duplicate accounts
  const existingUser =
        await userRepository.findUserByEmail(normalEmail);

  if (existingUser) {
    const error = new Error(
      'User with this email already exists.'
    );
    error.statusCode = 400;
    throw error;
  }

  // Hash the password before storing it
  const passwordHash = await bycript.hash(password, 12);

  const newUser = await userRepository.createUser({
    name: normalName,
    email: normalEmail,
    passwordHash,
  });

  return newUser;
}

async function loginUser({email, password}){
  if (typeof email !== 'string' || typeof password !== 'string') {
    const error = new Error('Email and password are required.');
    error.statusCode = 400;
    throw error;
  }

  const normalEmail = email.trim().toLowerCase();

  const user = await userRepository.findUserByEmail(normalEmail);

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bycript.compare(password, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const { password_hash, ...safeUser } = user;

  return safeUser;
}
async function getUserById(id) {
  return await userRepository.findUserById(id);
}

function accountError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateProfilePicture(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw accountError('Invalid profile picture.', 400);
  const match = value.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match) throw accountError('Use a PNG, JPEG, or WebP profile picture.', 400);
  const imageBytes = Buffer.from(match[2], 'base64');
  if (imageBytes.length > 1024 * 1024) {
    throw accountError('Profile pictures must be 1 MB or smaller.', 400);
  }
  const validImage = match[1] === 'png'
    ? imageBytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : match[1] === 'jpeg'
      ? imageBytes[0] === 0xff && imageBytes[1] === 0xd8 && imageBytes[2] === 0xff
      : imageBytes.toString('ascii', 0, 4) === 'RIFF' && imageBytes.toString('ascii', 8, 12) === 'WEBP';
  if (!validImage) throw accountError('The uploaded file is not a valid image.', 400);
  return value;
}

async function updateProfile(userId, { name, email, profilePicture, currentPassword } = {}) {
  if (typeof name !== 'string' || typeof email !== 'string') {
    throw accountError('Name and email are required.', 400);
  }
  const normalName = name.trim();
  const normalEmail = email.trim().toLowerCase();
  if (normalName.length < 2 || normalName.length > 40) {
    throw accountError('Name must be between 2 and 40 characters.', 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalEmail)) {
    throw accountError('Please provide a valid email address.', 400);
  }
  const existingUser = await userRepository.findUserCredentialsById(userId);
  if (!existingUser) throw accountError('Account not found. Please log in again.', 401);
  if (normalEmail !== existingUser.email.toLowerCase()) {
    if (typeof currentPassword !== 'string' || !(await bycript.compare(currentPassword, existingUser.password_hash))) {
      throw accountError('Enter your current password to change your email.', 401);
    }
  }
  if (await userRepository.findUserByEmailForOtherId(normalEmail, userId)) {
    throw accountError('An account with this email already exists.', 409);
  }
  const safePicture = profilePicture === undefined
    ? existingUser.profile_picture
    : validateProfilePicture(profilePicture);
  try {
    return await userRepository.updateUserProfile(userId, {
      name: normalName,
      email: normalEmail,
      profilePicture: safePicture,
    });
  } catch (error) {
    if (error.code === '23505') throw accountError('An account with this email already exists.', 409);
    throw error;
  }
}

async function updatePassword(userId, { currentPassword, newPassword } = {}, currentSessionId) {
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    throw accountError('Current and new passwords are required.', 400);
  }
  if (newPassword.length < 8 || newPassword.length > 72) {
    throw accountError('New password must be between 8 and 72 characters.', 400);
  }
  const user = await userRepository.findUserCredentialsById(userId);
  if (!user || !(await bycript.compare(currentPassword, user.password_hash))) {
    throw accountError('Current password is incorrect.', 401);
  }
  const passwordHash = await bycript.hash(newPassword, 12);
  await userRepository.updateUserPassword(userId, passwordHash, currentSessionId);
}

async function deleteAccount(userId, currentPassword) {
  if (typeof currentPassword !== 'string' || !currentPassword) {
    throw accountError('Enter your password to delete your account.', 400);
  }
  const user = await userRepository.findUserCredentialsById(userId);
  if (!user || !(await bycript.compare(currentPassword, user.password_hash))) {
    throw accountError('Password is incorrect.', 401);
  }
  return userRepository.deleteUserAndData(userId);
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateProfile,
  updatePassword,
  deleteAccount,
}
