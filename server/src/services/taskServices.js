
const taskRepository = require('../repositories/taskRepository');

function validateDueDate(dueDate) {
  if (dueDate === undefined || dueDate === null || dueDate === '') return;

  if (typeof dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    const error = new Error('Due date must be a valid date.');
    error.statusCode = 400;
    throw error;
  }

  const [year, month, day] = dueDate.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  if (parsedDate.toISOString().slice(0, 10) !== dueDate) {
    const error = new Error('Due date must be a valid date.');
    error.statusCode = 400;
    throw error;
  }

  const todayParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const todayValues = Object.fromEntries(
    todayParts
      .filter(({ type }) => ['year', 'month', 'day'].includes(type))
      .map(({ type, value }) => [type, value])
  );
  const today = `${todayValues.year}-${todayValues.month}-${todayValues.day}`;

  if (dueDate < today) {
    const error = new Error('Due date cannot be earlier than today.');
    error.statusCode = 400;
    throw error;
  }
}

// Create a task
async function createTask(userId, taskData) {
  const {
    title,
    description,
    dueDate,
    priority,
  } = taskData;

  validateDueDate(dueDate);

  if (!title || !title.trim()) {
    const error = new Error('Task title is required.');
    error.statusCode = 400;
    throw error;
  }

  if (title.trim().length > 150) {
    const error = new Error('Task title must not exceed 150 characters.');
    error.statusCode = 400;
    throw error;
  }

  // Validate priority if provided
  const allowedPriorities = ['low', 'medium', 'high'];

  if (
    priority !== undefined &&
    (
      typeof priority !== 'string' ||
        !allowedPriorities.includes(priority.toLowerCase())
    )
  ) {
    const error = new Error(
      'Priority must be Low, Medium, or High.'
    );
    error.statusCode = 400;
    throw error;
  }

  return taskRepository.createTask({
    userId,
    title: title.trim(),
    description,
    dueDate,
    priority,
  });
}

// Get all tasks belonging to a user

// Get tasks belonging to a user, with optional filters
async function getTasksByUser(userId, filters = {}) {
  const { search, status, priority } = filters;

  const allowedStatuses = ['pending', 'completed'];
  const allowedPriorities = ['low', 'medium', 'high'];

  if (status !== undefined && status !== '') {
    if (
      typeof status !== 'string' ||
            !allowedStatuses.includes(status.toLowerCase())
    ) {
      const error = new Error(
        'Status must be Pending or Completed.'
      );
      error.statusCode = 400;
      throw error;
    }
  }

  if (priority !== undefined && priority !== '') {
    if (
      typeof priority !== 'string' ||
            !allowedPriorities.includes(priority.toLowerCase())
    ) {
      const error = new Error(
        'Priority must be Low, Medium, or High.'
      );
      error.statusCode = 400;
      throw error;
    }
  }

  if (search !== undefined && typeof search !== 'string') {
    const error = new Error('Search must be a string.');
    error.statusCode = 400;
    throw error;
  }

  return taskRepository.findTaskByUser(userId, {
    search: search?.trim(),
    status: status?.toLowerCase(),
    priority: priority?.toLowerCase(),
  });
}


// Get one task belonging to a user
async function getTaskById(userId, taskId) {
  const task = await taskRepository.findTaskById(userId, taskId);

  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    throw error;
  }

  return task;
}

// Update a task


async function updateTask(userId, taskId, taskData) {
  // Confirm the task exists and belongs to this user
  const existingTask = await getTaskById(userId, taskId);

  if (existingTask.status === 'completed') {
    const error = new Error('Completed tasks cannot be edited.');
    error.statusCode = 400;
    throw error;
  }

  const {
    title,
    description,
    dueDate,
    priority,
    status,
  } = taskData;

  if (dueDate !== undefined) validateDueDate(dueDate);

  // Validate title when provided
  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      const error = new Error('Task title cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    if (title.trim().length > 150) {
      const error = new Error(
        'Task title must not exceed 150 characters.'
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // Validate priority when provided
  const allowedPriorities = ['low', 'medium', 'high'];

  if (priority !== undefined) {
    if (
      typeof priority !== 'string' ||
            !allowedPriorities.includes(priority.toLowerCase())
    ) {
      const error = new Error(
        'Priority must be Low, Medium, or High.'
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // Validate status when provided
  const allowedStatuses = ['pending', 'completed'];

  if (status !== undefined) {
    if (
      typeof status !== 'string' ||
            !allowedStatuses.includes(status.toLowerCase())
    ) {
      const error = new Error(
        'Status must be Pending or Completed.'
      );
      error.statusCode = 400;
      throw error;
    }
  }

  return taskRepository.updateTask(userId, taskId, {
    title: title === undefined
      ? existingTask.title
      : title.trim(),
    description: description === undefined
      ? existingTask.description
      : description,
    dueDate: dueDate === undefined
      ? existingTask.due_date
      : dueDate,
    priority: priority === undefined
      ? existingTask.priority
      : priority.toLowerCase(),
    status: status === undefined
      ? existingTask.status
      : status.toLowerCase(),
  });
}


// Delete a task
async function deleteTask(userId, taskId) {
  const deletedTask = await taskRepository.deleteTask(userId, taskId);

  if (!deletedTask) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    throw error;
  }

  return deletedTask;
}

// Mark a task as completed
async function completedTask(userId, taskId) {
  const task = await taskRepository.completeTask(userId, taskId);

  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    throw error;
  }

  return task;
}

module.exports = {
  createTask,
  getTasksByUser,
  getTaskById,
  updateTask,
  deleteTask,
  completedTask,
};
