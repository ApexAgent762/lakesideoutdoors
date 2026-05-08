const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, convertToJob } = require('../controllers/quoteController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, getAll);
router.get('/:id', auth, getOne);
router.post('/', auth, adminOnly, create);
router.put('/:id', auth, adminOnly, update);
router.post('/:id/convert', auth, adminOnly, convertToJob);

module.exports = router;
