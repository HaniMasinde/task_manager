const pool = require('../config/database');

async function createUser({name, email, passwordHash}){

  const query = 'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at';

  const values = [name, email, passwordHash]

  const {rows} = await pool.query(query,values);

  return rows[0];

}


async function findUserByEmail(email) {
  const query = `
        SELECT id, name, email, password_hash, created_at
        FROM users
        WHERE email = $1
    `;

  const { rows } = await pool.query(query, [email]);

  return rows[0] || null;
}


async function findUserById(id) {
  const query = `
        SELECT id, name, email, created_at
        FROM users
        WHERE id = $1
    `;

  const { rows } = await pool.query(query, [id]);

  return rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
}