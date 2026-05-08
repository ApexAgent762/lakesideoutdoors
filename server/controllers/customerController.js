const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAll = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(customers);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const getOne = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { leads: true, quotes: true, jobs: true }
    });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const create = async (req, res) => {
  try {
    const customer = await prisma.customer.create({ data: req.body });
    res.json(customer);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const update = async (req, res) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(customer);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const remove = async (req, res) => {
  try {
    await prisma.customer.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Customer deleted' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getAll, getOne, create, update, remove };
