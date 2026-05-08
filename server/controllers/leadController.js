const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAll = async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(leads);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const getOne = async (req, res) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { customer: true }
    });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const create = async (req, res) => {
  try {
    const lead = await prisma.lead.create({ data: req.body });
    res.json(lead);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const update = async (req, res) => {
  try {
    const lead = await prisma.lead.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(lead);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const remove = async (req, res) => {
  try {
    await prisma.lead.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Lead deleted' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getAll, getOne, create, update, remove };
