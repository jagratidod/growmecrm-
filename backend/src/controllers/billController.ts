import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Bill, IBill } from '../models/Bill';

const formatBill = (bill: IBill) => ({
  id: bill._id.toString(),
  vendor: bill.vendor,
  category: bill.category,
  totalAmount: bill.totalAmount,
  amountPaid: bill.amountPaid,
  currency: bill.currency || 'INR',
  billDate: bill.billDate ? new Date(bill.billDate).toISOString().split('T')[0] : '',
  linkedTripId: bill.linkedTripId || '',
  linkedTripName: bill.linkedTripName || '',
  notes: bill.notes || '',
  status: bill.status,
  createdAt: bill.createdAt,
  updatedAt: bill.updatedAt,
});

// 1. GET ALL BILLS (with filters, search, and KPI metrics)
export const getBills = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      res.status(401).json({ error: 'Organization ID not found' });
      return;
    }

    const { status, category, search } = req.query;
    const filter: any = { organizationId: orgId };

    // Status filter
    if (status && status !== 'All') {
      if (status === 'Unpaid') {
        filter.status = { $in: ['Unpaid', 'Partial'] };
      } else {
        filter.status = status;
      }
    }

    // Category filter
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Search keyword
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { vendor: { $regex: q, $options: 'i' } },
        { linkedTripName: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } },
      ];
    }

    const bills = await Bill.find(filter).sort({ billDate: -1, createdAt: -1 });

    // Calculate agency-wide KPI statistics
    const allOrgBills = await Bill.find({ organizationId: orgId });
    let totalSpend = 0;
    let totalPaid = 0;

    allOrgBills.forEach((b) => {
      totalSpend += b.totalAmount || 0;
      totalPaid += b.amountPaid || 0;
    });

    const unpaid = Math.max(0, totalSpend - totalPaid);

    res.status(200).json({
      bills: bills.map(formatBill),
      stats: {
        totalSpend,
        unpaid,
        paid: totalPaid,
      },
    });
  } catch (error: any) {
    console.error('[BillController] getBills error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch vendor bills' });
  }
};

// 2. GET SINGLE BILL BY ID
export const getBillById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;

    const bill = await Bill.findOne({ _id: id, organizationId: orgId });
    if (!bill) {
      res.status(404).json({ error: 'Bill not found' });
      return;
    }

    res.status(200).json({ bill: formatBill(bill) });
  } catch (error: any) {
    console.error('[BillController] getBillById error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch bill' });
  }
};

// 3. CREATE NEW VENDOR BILL
export const createBill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      res.status(401).json({ error: 'Organization ID not found' });
      return;
    }

    const {
      vendor,
      category,
      totalAmount,
      amountPaid,
      currency,
      billDate,
      linkedTripId,
      linkedTripName,
      notes,
    } = req.body;

    if (!vendor || totalAmount === undefined) {
      res.status(400).json({ error: 'Vendor name and total amount are required' });
      return;
    }

    const newBill = new Bill({
      organizationId: orgId,
      vendor: vendor.trim(),
      category: category || 'General',
      totalAmount: Number(totalAmount),
      amountPaid: Number(amountPaid || 0),
      currency: currency || 'INR',
      billDate: billDate ? new Date(billDate) : new Date(),
      linkedTripId: linkedTripId || '',
      linkedTripName: linkedTripName || '',
      notes: notes || '',
    });

    await newBill.save();

    res.status(201).json({
      message: 'Bill created successfully',
      bill: formatBill(newBill),
    });
  } catch (error: any) {
    console.error('[BillController] createBill error:', error);
    res.status(500).json({ error: error.message || 'Failed to create bill' });
  }
};

// 4. UPDATE VENDOR BILL
export const updateBill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;
    const {
      vendor,
      category,
      totalAmount,
      amountPaid,
      currency,
      billDate,
      linkedTripId,
      linkedTripName,
      notes,
    } = req.body;

    const bill = await Bill.findOne({ _id: id, organizationId: orgId });
    if (!bill) {
      res.status(404).json({ error: 'Bill not found' });
      return;
    }

    if (vendor !== undefined) bill.vendor = vendor.trim();
    if (category !== undefined) bill.category = category;
    if (totalAmount !== undefined) bill.totalAmount = Number(totalAmount);
    if (amountPaid !== undefined) bill.amountPaid = Number(amountPaid);
    if (currency !== undefined) bill.currency = currency;
    if (billDate !== undefined) bill.billDate = new Date(billDate);
    if (linkedTripId !== undefined) bill.linkedTripId = linkedTripId;
    if (linkedTripName !== undefined) bill.linkedTripName = linkedTripName;
    if (notes !== undefined) bill.notes = notes;

    await bill.save();

    res.status(200).json({
      message: 'Bill updated successfully',
      bill: formatBill(bill),
    });
  } catch (error: any) {
    console.error('[BillController] updateBill error:', error);
    res.status(500).json({ error: error.message || 'Failed to update bill' });
  }
};

// 5. RECORD PAYMENT ON A BILL
export const recordPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;
    const { additionalPaid } = req.body;

    if (!additionalPaid || Number(additionalPaid) <= 0) {
      res.status(400).json({ error: 'Valid payment amount is required' });
      return;
    }

    const bill = await Bill.findOne({ _id: id, organizationId: orgId });
    if (!bill) {
      res.status(404).json({ error: 'Bill not found' });
      return;
    }

    bill.amountPaid = Math.min(bill.totalAmount, (bill.amountPaid || 0) + Number(additionalPaid));
    await bill.save();

    res.status(200).json({
      message: 'Payment recorded successfully',
      bill: formatBill(bill),
    });
  } catch (error: any) {
    console.error('[BillController] recordPayment error:', error);
    res.status(500).json({ error: error.message || 'Failed to record payment' });
  }
};

// 6. DELETE VENDOR BILL
export const deleteBill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;

    const bill = await Bill.findOneAndDelete({ _id: id, organizationId: orgId });
    if (!bill) {
      res.status(404).json({ error: 'Bill not found' });
      return;
    }

    res.status(200).json({
      message: 'Bill deleted successfully',
      id,
    });
  } catch (error: any) {
    console.error('[BillController] deleteBill error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete bill' });
  }
};
