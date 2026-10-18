
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const sessionMiddleware = require('./src/config/session');
const taskRoutes = require('./src/routes/taskRoutes');
const authMiddleware = require('./src/middleware/authMiddleware');
const errorMiddleware = require('./src/middleware/errorMiddleware');
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
// Allow the local frontend and the deployed frontend.
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(helmet());

// Parse incoming request bodies
app.use(express.json({ limit: '2mb' }));
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
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use(errorMiddleware);

module.exports = app;
