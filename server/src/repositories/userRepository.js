const pool = require('../config/database');

async function createUser({name, email, passwordHash}){

  const query = 'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, profile_picture, created_at';

  const values = [name, email, passwordHash]

  const {rows} = await pool.query(query,values);

  return rows[0];

}


async function findUserByEmail(email) {
  const query = `
        SELECT id, name, email, password_hash, profile_picture, created_at
        FROM users
        WHERE email = $1
    `;

  const { rows } = await pool.query(query, [email]);

  return rows[0] || null;
}


async function findUserById(id) {
  const query = `
        SELECT id, name, email, profile_picture, created_at
        FROM users
        WHERE id = $1
    `;

  const { rows } = await pool.query(query, [id]);

  return rows[0] || null;
}

async function findUserCredentialsById(id) {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash, profile_picture FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function findUserByEmailForOtherId(email, id) {
  const { rows } = await pool.query(
    'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id <> $2',
    [email, id]
  );
  return rows[0] || null;
}

async function updateUserProfile(id, { name, email, profilePicture }) {
  const query = `
    UPDATE users
    SET name = $2, email = $3, profile_picture = $4
    WHERE id = $1
    RETURNING id, name, email, profile_picture, created_at
  `;
  const { rows } = await pool.query(query, [id, name, email, profilePicture]);
  return rows[0] || null;
}

async function updateUserPassword(id, passwordHash, currentSessionId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'UPDATE users SET password_hash = $2 WHERE id = $1 RETURNING id',
      [id, passwordHash]
    );
    if (currentSessionId) {
      await client.query(
        "DELETE FROM session WHERE sess->>'userId' = $1 AND sid <> $2",
        [String(id), currentSessionId]
      );
    }
    await client.query('COMMIT');
    return rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function deleteUserAndData(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM tasks WHERE user_id = $1', [id]);
    // Invalidate every stored session associated with this account.
    await client.query("DELETE FROM session WHERE sess->>'userId' = $1", [String(id)]);
    const { rows } = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    await client.query('COMMIT');
    return rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findUserCredentialsById,
  findUserByEmailForOtherId,
  updateUserProfile,
  updateUserPassword,
  deleteUserAndData,
}
