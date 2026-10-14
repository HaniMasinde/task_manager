
import { apiRequest } from './api.js'

async function getTasks(filters = {}) {
  const query = new URLSearchParams()

  if (filters.search) {
    query.set('search', filters.search)
  }

  if (filters.status) {
    query.set('status', filters.status)
  }

  if (filters.priority) {
    query.set('priority', filters.priority)
  }

  const queryString = query.toString()
  const endpoint = queryString
    ? `/tasks?${queryString}`
    : '/tasks'

  const response = await apiRequest(endpoint)

  return response.data
}
async function createTask(taskData) {
  const response = await apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  })

  return response.data
}
async function completeTask(taskId) {
  const response = await apiRequest(`/tasks/${taskId}/complete`, {
    method: 'PATCH',
  })

  return response.data
}
async function deleteTask(taskId) {
  await apiRequest(`/tasks/${taskId}`, {
    method: 'DELETE',
  })
}
async function updateTask(taskId, taskData) {
  const response = await apiRequest(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  })

  return response.data
}
export { getTasks, createTask, completeTask, deleteTask, updateTask }
