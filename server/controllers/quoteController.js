const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateQuoteNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LO-${year}-${rand}`;
};

const getAll = async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      include: { customer: true, lineItems: { include: { service: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quotes);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const getOne = async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { customer: true, lineItems: { include: { service: true } }, photos: true }
    });
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.json(quote);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const create = async (req, res) => {
  try {
    const { customerId, lineItems, notes, expiresAt } = req.body;
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        customerId,
        notes,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        lineItems: {
          create: lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            serviceId: item.serviceId || null
          }))
        }
      },
      include: { customer: true, lineItems: true }
    });
    res.json(quote);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const update = async (req, res) => {
  try {
    const { status, notes, expiresAt } = req.body;
    const quote = await prisma.quote.update({
      where: { id: parseInt(req.params.id) },
      data: { status, notes, expiresAt: expiresAt ? new Date(expiresAt) : null }
    });
    res.json(quote);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const convertToJob = async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { customer: true, lineItems: true }
    });
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    const job = await prisma.job.create({
      data: {
        name: `Job - ${quote.customer.name}`,
        customerId: quote.customerId,
        quoteId: quote.id,
        serviceAddress: quote.customer.serviceAddress,
        description: quote.notes,
        status: 'SCHEDULED'
      }
    });
    await prisma.quote.update({
      where: { id: quote.id },
      data: { status: 'APPROVED' }
    });
    res.json(job);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getAll, getOne, create, update, convertToJob };
