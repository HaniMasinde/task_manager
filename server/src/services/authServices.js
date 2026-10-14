
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

  const normalEmail = email.toLowerCase().trim();

  const user = await userRepository.findUserByEmail(normalEmail);

  if(!user){
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bycript.compare(password, user.password_hash);

  if(!isPasswordValid){
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const {password_hash, ...safeUser} = user;

  return safeUser;
}
async function getUserById(id) {
  return await userRepository.findUserById(id);
}

module.exports = {
  registerUser,
  loginUser,
  getUserById
}
