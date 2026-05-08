const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/customerController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, getAll);
router.get('/:id', auth, getOne);
router.post('/', auth, adminOnly, create);
router.put('/:id', auth, adminOnly, update);
router.delete('/:id', auth, adminOnly, remove);

module.exports = router;
