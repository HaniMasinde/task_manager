
const dashboardServices = require('../services/dashboardServices');

async function getDashboard(req, res) {
  const userId = req.session.userId;

  const dashboard = await dashboardServices.getDashboard(userId);

  res.status(200).json({
    status: 'success',
    data: dashboard,
  });
}

module.exports = {
  getDashboard,
};