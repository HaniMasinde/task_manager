
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const sessionMiddleware = require('./src/config/session');
const taskRoutes = require('./src/routes/taskRoutes');
const authMiddleware = require('./src/middleware/authMiddleware');
const errorMiddleware = require('./src/middleware/errorMiddleware');
const authRoutes = require('./src/routes/authRoutes');

const app = express();

// Allow requests from the local React development server.
// Credentials are required for cookie-based sessions.
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(helmet());

// Parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize server-side sessions
app.use(sessionMiddleware);

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Daily Task Manager API is running',
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Task routes: authentication required
app.use('/api/tasks', authMiddleware, taskRoutes);

// Centralized error handling must be registered last
app.use(errorMiddleware);

module.exports = app;