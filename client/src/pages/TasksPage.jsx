
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import {
  getTasks,
  createTask,
  completeTask,
  deleteTask,
  updateTask
} from '../services/taskService.js'

function getLocalDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function TasksPage() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [updating, setUpdating] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [error, setError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [deletingTask, setDeletingTask] = useState(false)

  
  useEffect(() => {
    if (loading || !user) return

    async function loadTasks() {
      setTasksLoading(true)
      setError('')

      try {
        const data = await getTasks({
          search,
          status: statusFilter,
          priority: priorityFilter,
        })

        setTasks(data)
      } catch (err) {
        setError(err.message || 'Failed to load tasks.')
      } finally {
        setTasksLoading(false)
      }
    }

    loadTasks()
  }, [user, loading, search, statusFilter, priorityFilter])

  useEffect(() => {
    if (!deleteTarget || deletingTask) return

    function handleDialogKeyDown(event) {
      if (event.key === 'Escape') {
        setDeleteTarget(null)
        setDeleteError('')
      }
    }

    window.addEventListener('keydown', handleDialogKeyDown)
    return () => window.removeEventListener('keydown', handleDialogKeyDown)
  }, [deleteTarget, deletingTask])


  async function handleCreateTask(event) {
    event.preventDefault()

    setFormError('')
    setFormSuccess('')

    if (!title.trim()) {
      setFormError('Task title is required.')
      return
    }

    if (dueDate && dueDate < getLocalDateString()) {
      setFormError('Due date cannot be earlier than today.')
      return
    }

    setCreating(true)

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
        priority,
      }

      const newTask = await createTask(taskData)

      setTasks((currentTasks) => [newTask, ...currentTasks])
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('medium')
      setFormSuccess('Task created successfully.')
    } catch (err) {
      setFormError(err.message || 'Failed to create task.')
    } finally {
      setCreating(false)
    }
  }


  async function handleCompleteTask(taskId) {
    setError('')

    try {
      await completeTask(taskId)

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId
            ? { ...task, status: 'completed' }
            : task
        )
      )
    } catch (err) {
      setError(err.message || 'Failed to complete task.')
    }
  }


  async function handleDeleteTask(taskId) {
    setDeleteError('')
    setDeletingTask(true)

    try {
      await deleteTask(taskId)

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      )
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete task.')
    } finally {
      setDeletingTask(false)
    }
  }

  function handleStartEditing(task) {
    if (task.status === 'completed') return

    setEditingTaskId(task.id)

    setEditForm({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.due_date
        ? task.due_date.slice(0, 10)
        : '',
      priority: task.priority || 'medium',
    })

    setError('')
  }

  function handleEditChange(event) {
    const { name, value } = event.target

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  async function handleUpdateTask(event) {
    event.preventDefault()
    setError('')

    const taskBeingEdited = tasks.find((task) => task.id === editingTaskId)
    if (taskBeingEdited?.status === 'completed') {
      setError('Completed tasks cannot be edited.')
      setEditingTaskId(null)
      return
    }

    if (!editForm.title.trim()) {
      setError('Task title is required.')
      return
    }

    if (editForm.dueDate && editForm.dueDate < getLocalDateString()) {
      setError('Due date cannot be earlier than today.')
      return
    }

    setUpdating(true)

    try {
      const updatedTask = await updateTask(
        editingTaskId,
        {
          ...editForm,
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          dueDate: editForm.dueDate || null,
        }
      )

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTaskId ? updatedTask : task
        )
      )

      setEditingTaskId(null)
      setEditForm({})
    } catch (err) {
      setError(err.message || 'Failed to update task.')
    } finally {
      setUpdating(false)
    }
  }

  async function handleLogout() {
    setError('')
    setLoggingOut(true)

    try {
      await logout()
      navigate('/login', { replace: true })
    } catch {
      setError('Logout failed. Please try again.')
    } finally {
      setLoggingOut(false)
    }
  }

  if (loading) {
    return <main className="auth-page">Checking session...</main>
  }

  if (!user) {
    return null
  }

  return (
    <main className="auth-page task-page">
      <div className="task-dashboard">
        <header className="task-heading">
            <p>
              Welcome, <span className="task-user-name">{user.name}</span>.
            </p>
          <h1>My Tasks</h1>
          <button
            className="primary-button logout-button"
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Signing out...' : 'Log out'}
          </button>
        </header>

        <section
          className="task-panel task-create-panel"
          aria-labelledby="create-task-heading"
        >
          <form className="task-form" onSubmit={handleCreateTask}>
            <h2 id="create-task-heading">Create a Task</h2>

            <label htmlFor="title">Task title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={150}
              required
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />

            <div className="task-inline-fields">
              <div className="task-inline-field">
                <label htmlFor="dueDate">Due date</label>
                <input
                  id="dueDate"
                  type="date"
                  min={getLocalDateString()}
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </div>

              <div className="task-inline-field">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            {formSuccess && (
              <p role="status">
                {formSuccess}
              </p>
            )}

            <button
              className="primary-button"
              type="submit"
              disabled={creating}
            >
              {creating ? 'Creating task...' : 'Create Task'}
            </button>
          </form>
        </section>

        <section
          className="task-panel task-filters"
          aria-labelledby="task-filters-heading"
        >
          <h2 id="task-filters-heading">Search and Filter Tasks</h2>

          <label htmlFor="task-search">Search tasks</label>
          <input
            id="task-search"
            type="search"
            placeholder="Search by title or description"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <label htmlFor="status-filter">Filter by status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <label htmlFor="priority-filter">Filter by priority</label>
          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setSearch('')
              setStatusFilter('')
              setPriorityFilter('')
            }}
          >
            Clear Filters
          </button>
        </section>

        <section className="task-panel task-results" aria-label="Task results">
            {tasksLoading && <p>Loading your tasks...</p>}

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          {!tasksLoading && !error && (
            <p role="status">
              Tasks displayed: {tasks.length}
            </p>
          )}

          {!tasksLoading && !error && tasks.length === 0 && (
            <p>
              {search || statusFilter || priorityFilter
                ? 'No tasks match found.'
                : 'You have no tasks yet.'}
            </p>
          )}


          {!tasksLoading && tasks.length > 0 && (
            <ul className="task-list">
              {tasks.map((task) => (
                <li className="task-item" key={task.id}>
                  <h2>{task.title}</h2>

                  {editingTaskId === task.id && (
                  <form className="task-form task-edit-form" onSubmit={handleUpdateTask}>
                      <h3>Edit Task</h3>

                      <label htmlFor={`edit-title-${task.id}`}>Title</label>
                      <input
                        id={`edit-title-${task.id}`}
                        name="title"
                        value={editForm.title}
                        onChange={handleEditChange}
                        maxLength={150}
                        required
                      />

                      <label htmlFor={`edit-description-${task.id}`}>Description</label>
                      <textarea
                        id={`edit-description-${task.id}`}
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                        rows={3}
                      />

                      <label htmlFor={`edit-dueDate-${task.id}`}>Due date</label>
                      <input
                        id={`edit-dueDate-${task.id}`}
                        name="dueDate"
                        type="date"
                        min={getLocalDateString()}
                        value={editForm.dueDate}
                        onChange={handleEditChange}
                      />

                      <label htmlFor={`edit-priority-${task.id}`}>Priority</label>
                      <select
                        id={`edit-priority-${task.id}`}
                        name="priority"
                        value={editForm.priority}
                        onChange={handleEditChange}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>

                      <button
                        className="primary-button"
                        type="submit"
                        disabled={updating}
                      >
                        {updating ? 'Saving changes...' : 'Save Changes'}
                      </button>

                      <button
                        className="secondary-button"
                        type="button"
                        disabled={updating}
                        onClick={() => {
                          setEditingTaskId(null)
                          setEditForm({})
                        }}
                      >
                        Cancel
                      </button>
                    </form>
                  )}


                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}

                  <p>
                    Priority:{' '}
                    <span className={`priority-badge priority-${String(task.priority).toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </p>

                  <p>
                    Status:{' '}
                    <span className={`status-badge status-${String(task.status).toLowerCase()}`}>
                      {task.status}
                    </span>
                  </p>
                
                  <div className="task-actions">
                    {task.status !== 'completed' && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleStartEditing(task)}
                      >
                        Edit
                      </button>
                    )}
                    {task.status !== 'completed' && (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        Mark as Completed
                      </button>
                    )}

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setDeleteError('')
                        setDeleteTarget(task)
                      }}
                    >
                      Delete Task
                    </button>
                  </div>


                  {task.due_date && (
                    <p>
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {deleteTarget && (
          <div className="delete-dialog-overlay">
            <section
              className="delete-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-dialog-title"
              aria-describedby="delete-dialog-description"
            >
              <h2 id="delete-dialog-title">Delete this task?</h2>
              <p id="delete-dialog-description">
                “{deleteTarget.title}” will be permanently removed.
              </p>
              {deleteError && <p className="form-error" role="alert">{deleteError}</p>}
              <div className="delete-dialog-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setDeleteTarget(null)
                    setDeleteError('')
                  }}
                  disabled={deletingTask}
                  autoFocus
                >
                  Cancel
                </button>
                <button
                  className="delete-confirm-button"
                  type="button"
                  onClick={() => handleDeleteTask(deleteTarget.id)}
                  disabled={deletingTask}
                >
                  {deletingTask ? 'Deleting...' : 'Delete task'}
                </button>
              </div>
            </section>
          </div>
        )}

      </div>
    </main>
  )
}

export default TasksPage
