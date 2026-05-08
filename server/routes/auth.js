const express = require('express');
const router = express.Router();
const { login, getMe, createUser } = require('../controllers/authController');
const { auth, adminOnly } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/create-user', auth, adminOnly, createUser);

module.exports = router;
