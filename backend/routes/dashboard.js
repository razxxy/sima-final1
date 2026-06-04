const router = require('express').Router();
const auth = require('../middleware/auth');
const { getStats, getActivities } = require('../controllers/dashboardController');
router.get('/stats', auth, getStats);
router.get('/activities', auth, getActivities);
module.exports = router;