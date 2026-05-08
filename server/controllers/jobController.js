const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAll = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: { customer: true, assignedUsers: true, notes: { include: { user: true } } },
      orderBy: { scheduledAt: 'asc' }
    });
    res.json(jobs);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const getOne = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { customer: true, assignedUsers: true, photos: true, notes: { include: { user: true } }, quote: { include: { lineItems: true } } }
    });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const getMine = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { assignedUsers: { some: { id: req.user.id } } },
      include: { customer: true, notes: { include: { user: true } } },
      orderBy: { scheduledAt: 'asc' }
    });
    res.json(jobs);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const create = async (req, res) => {
  try {
    const { assignedUserIds, scheduledAt, ...rest } = req.body;
    const job = await prisma.job.create({
      data: {
        ...rest,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        assignedUsers: assignedUserIds ? { connect: assignedUserIds.map(id => ({ id })) } : undefined
      },
      include: { customer: true, assignedUsers: true }
    });
    res.json(job);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const update = async (req, res) => {
  try {
    const { assignedUserIds, scheduledAt, ...rest } = req.body;
    const job = await prisma.job.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...rest,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        assignedUsers: assignedUserIds ? { set: assignedUserIds.map(id => ({ id })) } : undefined
      },
      include: { customer: true, assignedUsers: true }
    });
    res.json(job);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const addNote = async (req, res) => {
  try {
    const note = await prisma.jobNote.create({
      data: {
        jobId: parseInt(req.params.id),
        userId: req.user.id,
        note: req.body.note
      },
      include: { user: true }
    });
    res.json(note);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getAll, getOne, getMine, create, update, addNote };
