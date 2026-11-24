import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Invoice, IInvoice } from '../models/Invoice';
import { Organization } from '../models/Organization';

const formatInvoice = (inv: IInvoice) => ({
  id: inv._id.toString(),
  invoiceNumber: inv.invoiceNumber,
  customerName: inv.customerName,
  customerPhone: inv.customerPhone,
  customerEmail: inv.customerEmail || '',
  destination: inv.destination,
  linkedBookingId: inv.linkedBookingId || '',
  issueDate: inv.issueDate ? new Date(inv.issueDate).toISOString().split('T')[0] : '',
  dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
  totalAmount: inv.totalAmount,
  paidAmount: inv.paidAmount,
  currency: inv.currency || 'INR',
  status: inv.status,
  items: inv.items || [],
  taxDetails: inv.taxDetails || {},
  notes: inv.notes || '',
  createdAt: inv.createdAt,
  updatedAt: inv.updatedAt,
});

// Helper: generate next sequential invoice number for this agency
const generateNextInvoiceNumber = async (orgId: any): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const count = await Invoice.countDocuments({ organizationId: orgId });
  const seq = String(count + 1).padStart(3, '0');
  return `INV-${currentYear}-${seq}`;
};

// 1. GET ALL INVOICES (with filters, search, and KPI metrics)
export const getInvoices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      res.status(401).json({ error: 'Organization ID not found' });
      return;
    }

    const { status, search } = req.query;
    const filter: any = { organizationId: orgId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { invoiceNumber: { $regex: q, $options: 'i' } },
        { customerName: { $regex: q, $options: 'i' } },
        { customerPhone: { $regex: q, $options: 'i' } },
        { destination: { $regex: q, $options: 'i' } },
      ];
    }

    const invoices = await Invoice.find(filter).sort({ issueDate: -1, createdAt: -1 });

    // Calculate agency-wide KPI statistics
    const allOrgInvoices = await Invoice.find({ organizationId: orgId });
    let totalBilled = 0;
    let totalCollected = 0;

    allOrgInvoices.forEach((inv) => {
      totalBilled += inv.totalAmount || 0;
      totalCollected += inv.paidAmount || 0;
    });

    const totalPending = Math.max(0, totalBilled - totalCollected);

    res.status(200).json({
      invoices: invoices.map(formatInvoice),
      stats: {
        totalBilled,
        totalCollected,
        totalPending,
      },
    });
  } catch (error: any) {
    console.error('[InvoiceController] getInvoices error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tax invoices' });
  }
};

// 2. GET SINGLE INVOICE BY ID (with Organization branding/bank info)
export const getInvoiceById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;

    const invoice = await Invoice.findOne({ _id: id, organizationId: orgId });
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const organization = await Organization.findById(orgId);

    res.status(200).json({
      invoice: formatInvoice(invoice),
      organization: organization
        ? {
            name: organization.name,
            logoUrl: organization.logoUrl,
            slug: organization.slug,
          }
        : null,
    });
  } catch (error: any) {
    console.error('[InvoiceController] getInvoiceById error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch invoice' });
  }
};

// 3. CREATE NEW CUSTOMER TAX INVOICE
export const createInvoice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      res.status(401).json({ error: 'Organization ID not found' });
      return;
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      destination,
      linkedBookingId,
      issueDate,
      dueDate,
      totalAmount,
      paidAmount,
      currency,
      items,
      taxDetails,
      notes,
    } = req.body;

    if (!customerName || totalAmount === undefined) {
      res.status(400).json({ error: 'Customer name and total amount are required' });
      return;
    }

    const invoiceNumber = await generateNextInvoiceNumber(orgId);

    const defaultItems = Array.isArray(items) && items.length > 0
      ? items
      : [
          {
            description: destination || 'Custom Travel Package & Tour Services',
            quantity: 1,
            unitPrice: Number(totalAmount),
            amount: Number(totalAmount),
          },
        ];

    const newInvoice = new Invoice({
      organizationId: orgId,
      invoiceNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : '+91 98765 00000',
      customerEmail: customerEmail ? customerEmail.trim() : '',
      destination: destination ? destination.trim() : 'Custom Travel Package',
      linkedBookingId: linkedBookingId || '',
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalAmount: Number(totalAmount),
      paidAmount: Number(paidAmount || 0),
      currency: currency || 'INR',
      items: defaultItems,
      taxDetails: taxDetails || {},
      notes: notes || '',
    });

    await newInvoice.save();

    res.status(201).json({
      message: 'Tax invoice created successfully',
      invoice: formatInvoice(newInvoice),
    });
  } catch (error: any) {
    console.error('[InvoiceController] createInvoice error:', error);
    res.status(500).json({ error: error.message || 'Failed to create invoice' });
  }
};

// 4. UPDATE INVOICE
export const updateInvoice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;
    const {
      customerName,
      customerPhone,
      customerEmail,
      destination,
      linkedBookingId,
      issueDate,
      dueDate,
      totalAmount,
      paidAmount,
      currency,
      items,
      taxDetails,
      notes,
    } = req.body;

    const invoice = await Invoice.findOne({ _id: id, organizationId: orgId });
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    if (customerName !== undefined) invoice.customerName = customerName.trim();
    if (customerPhone !== undefined) invoice.customerPhone = customerPhone.trim();
    if (customerEmail !== undefined) invoice.customerEmail = customerEmail.trim();
    if (destination !== undefined) invoice.destination = destination.trim();
    if (linkedBookingId !== undefined) invoice.linkedBookingId = linkedBookingId;
    if (issueDate !== undefined) invoice.issueDate = new Date(issueDate);
    if (dueDate !== undefined) invoice.dueDate = new Date(dueDate);
    if (totalAmount !== undefined) invoice.totalAmount = Number(totalAmount);
    if (paidAmount !== undefined) invoice.paidAmount = Number(paidAmount);
    if (currency !== undefined) invoice.currency = currency;
    if (Array.isArray(items)) invoice.items = items;
    if (taxDetails !== undefined) invoice.taxDetails = taxDetails;
    if (notes !== undefined) invoice.notes = notes;

    await invoice.save();

    res.status(200).json({
      message: 'Invoice updated successfully',
      invoice: formatInvoice(invoice),
    });
  } catch (error: any) {
    console.error('[InvoiceController] updateInvoice error:', error);
    res.status(500).json({ error: error.message || 'Failed to update invoice' });
  }
};

// 5. RECORD PAYMENT OR MARK FULLY PAID
export const recordPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;
    const { amount, markFull } = req.body;

    const invoice = await Invoice.findOne({ _id: id, organizationId: orgId });
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    if (markFull) {
      invoice.paidAmount = invoice.totalAmount;
    } else if (amount && Number(amount) > 0) {
      invoice.paidAmount = Math.min(invoice.totalAmount, (invoice.paidAmount || 0) + Number(amount));
    } else {
      res.status(400).json({ error: 'Valid payment amount or markFull flag is required' });
      return;
    }

    await invoice.save();

    res.status(200).json({
      message: 'Payment recorded successfully',
      invoice: formatInvoice(invoice),
    });
  } catch (error: any) {
    console.error('[InvoiceController] recordPayment error:', error);
    res.status(500).json({ error: error.message || 'Failed to record invoice payment' });
  }
};

// 6. DELETE INVOICE
export const deleteInvoice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;

    const invoice = await Invoice.findOneAndDelete({ _id: id, organizationId: orgId });
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    res.status(200).json({
      message: 'Invoice deleted successfully',
      id,
    });
  } catch (error: any) {
    console.error('[InvoiceController] deleteInvoice error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete invoice' });
  }
};
