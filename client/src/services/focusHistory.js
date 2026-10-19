const STORAGE_PREFIX = 'task-manager-focus-history:'

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}${userId}`
}

function getFocusHistory(userId) {
  if (!userId) return []
  try {
    const history = JSON.parse(localStorage.getItem(getStorageKey(userId)) || '[]')
    return Array.isArray(history) ? history : []
  } catch {
    return []
  }
}

function recordTaskCompletion(userId, task) {
  if (!userId || !task) return
  try {
    const history = getFocusHistory(userId)
    history.push({
      taskId: task.id,
      title: task.title || 'Completed task',
      completedAt: new Date().toISOString(),
    })
    localStorage.setItem(getStorageKey(userId), JSON.stringify(history.slice(-1000)))
  } catch {
    // Completion should succeed even if local activity tracking is unavailable.
  }
}

export { getFocusHistory, recordTaskCompletion }
