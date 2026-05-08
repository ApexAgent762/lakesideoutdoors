const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth, adminOnly } = require('../middleware/auth');
const prisma = new PrismaClient();

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const [customers, leads, quotes, jobs] = await Promise.all([
      prisma.customer.count(),
      prisma.lead.count(),
      prisma.quote.findMany({ select: { status: true } }),
      prisma.job.findMany({ select: { status: true, scheduledAt: true } })
    ]);

    const now = new Date();
    const upcoming = jobs.filter(j => j.scheduledAt && new Date(j.scheduledAt) >= now).length;
    const completed = jobs.filter(j => j.status === 'COMPLETED').length;
    const openQuotes = quotes.filter(q => q.status === 'SENT' || q.status === 'DRAFT').length;
    const approvedQuotes = quotes.filter(q => q.status === 'APPROVED').length;

    res.json({ customers, leads, openQuotes, approvedQuotes, upcoming, completed, totalJobs: jobs.length });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
