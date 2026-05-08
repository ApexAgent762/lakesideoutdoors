const express = require('express');
const router = express.Router();
const { getAll, getOne, getMine, create, update, addNote } = require('../controllers/jobController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, getAll);
router.get('/mine', auth, getMine);
router.get('/:id', auth, getOne);
router.post('/', auth, adminOnly, create);
router.put('/:id', auth, update);
router.post('/:id/notes', auth, addNote);

module.exports = router;
