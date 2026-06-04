const router = require('express').Router();
const auth = require('../middleware/auth');
const { uploadLaporan } = require('../middleware/upload');
const c = require('../controllers/laporanController');
router.get('/', auth, c.getAll);
router.post('/upload', auth, uploadLaporan.single('file'), c.upload);
router.put('/:id/status', auth, c.updateStatus);
module.exports = router;