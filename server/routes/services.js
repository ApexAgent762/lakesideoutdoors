const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const services = await prisma.service.findMany({ orderBy: { name: 'asc' } });
    res.json(services);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
