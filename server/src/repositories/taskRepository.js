
const pool = require('../config/database');

async function createTask({
  userId,
  title,
  description,
  dueDate,
  priority,
}){
  const query = ' insert into tasks ( user_id, title, description, due_date, priority) values ($1, $2, $3, $4, $5) returning *';

  const values = [
    userId, 
    title,
    description || null,
    dueDate || null,
    priority || 'medium'
  ];

  const {rows} = await pool.query(query,values);

  return rows[0]
}


async function findTaskByUser(userId, filters = {}) {
  const { search, status, priority } = filters;

  const conditions = ['user_id = $1'];
  const values = [userId];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`title ILIKE $${values.length}`);
  }

  if (status) {
    values.push(status.toLowerCase());
    conditions.push(`status = $${values.length}`);
  }

  if (priority) {
    values.push(priority.toLowerCase());
    conditions.push(`priority = $${values.length}`);
  }

  const query = `
        SELECT *
        FROM tasks
        WHERE ${conditions.join(' AND ')}
        ORDER BY created_at DESC
    `;

  const { rows } = await pool.query(query, values);

  return rows;
}


async function findTaskById(userId,taskId){
  const query = 'select * from tasks where user_id = $1 and id = $2';

  const {rows} = await pool.query(query,[userId, taskId]);

  return rows[0] || null;
}

// Update a task belonging to a specific user
async function updateTask(userId, taskId, {
  title,
  description,
  dueDate,
  priority,
  status,
}) {
  const query = `
        UPDATE tasks SET title = $3,
            description = $4,
            due_date = $5,
            priority = $6,
            status = COALESCE($7, status)
        WHERE user_id = $1 AND id = $2
        RETURNING *
    `;

  const values = [
    userId,
    taskId,
    title,
    description || null,
    dueDate || null,
    priority,
    status || null,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}

// Delete a task belonging to a specific user
async function deleteTask(userId, taskId) {
  const query = `DELETE FROM tasks WHERE user_id = $1 AND id = $2 RETURNING *`;

  const { rows } = await pool.query(query, [userId, taskId]);
  return rows[0] || null;
}

// Mark a task as completed
async function completeTask(userId, taskId) {
  const query = `
        UPDATE tasks
        SET status = 'completed'
        WHERE user_id = $1 AND id = $2
        RETURNING *
    `;

  const { rows } = await pool.query(query, [userId, taskId]);
  return rows[0] || null;
}
module.exports = {
  createTask,
  findTaskByUser,
  findTaskById,
  updateTask,
  deleteTask,
  completeTask,
};
