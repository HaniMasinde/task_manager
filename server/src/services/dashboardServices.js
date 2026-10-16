
const dashboardRepository = require('../repositories/taskRepository');

async function getDashboard(userId) {
  // Get today's date using the Nairobi time zone
  const dateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const dateValues = Object.fromEntries(
    dateParts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );

  const today =
    `${dateValues.year}-${dateValues.month}-${dateValues.day}`;

  // Retrieve statistics and task lists for the logged-in user
  const dashboard = await dashboardRepository.getDashboardData(
    userId,
    today
  );

  const stats = dashboard.stats;
  const totalTasks = Number(stats.total_tasks);
  const completedTasks = Number(stats.completed_tasks);

  // Avoid division by zero when the user has no tasks
  const completionRate = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return {
    ...dashboard,
    stats: {
      ...stats,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      pending_tasks: Number(stats.pending_tasks),
      overdue_tasks: Number(stats.overdue_tasks),
      due_today: Number(stats.due_today),
      completion_rate: completionRate,
    },
  };
}

module.exports = {
  getDashboard,
};