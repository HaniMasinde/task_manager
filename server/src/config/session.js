
require('dotenv').config();

const session = require('express-session');
const connectPgSimple = require('connect-pg-simple');
const pool = require('./database');

const PgSessionStore = connectPgSimple(session);

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not configured');
}

const sessionMiddleware = session({
  store: new PgSessionStore({
    pool,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000,
},
});

module.exports = sessionMiddleware;