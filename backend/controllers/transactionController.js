import { Transaction, Order } from '../models/index.js';
import { createAuditLog } from '../utils/auditLogger.js';

/**
 * GET /api/transactions
 * Get all transactions
 */
export const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, orderId, status } = req.query;

    const query = {};
    if (orderId) query.order_id = orderId;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [transactions, count] = await Promise.all([
      Transaction.find(query)
        .populate('order')
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort({ created_at: -1 })
        .lean(),
      Transaction.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/transactions
 * Create a transaction
 */
export const createTransaction = async (req, res, next) => {
  try {
    const {
      orderId,
      type,
      amount,
      currency,
      paymentMethod,
      reference,
      notes
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const transaction = await Transaction.create({
      order_id: orderId,
      type: type || 'payment',
      amount,
      currency: currency || order.currency,
      payment_method: paymentMethod,
      reference,
      notes,
      status: 'completed',
      payment_date: new Date()
    });

    // Update order payment status
    const transactions = await Transaction.find({
      order_id: orderId,
      type: 'payment',
      status: 'completed'
    });

    const totalPaid = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

    if (totalPaid >= parseFloat(order.grand_total)) {
      order.payment_status = 'paid';
    } else if (totalPaid > 0) {
      order.payment_status = 'partial';
    }
    await order.save();

    await createAuditLog({
      userId: req.user.id,
      action: 'create_transaction',
      entityType: 'transaction',
      entityId: transaction._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getTransactions,
  createTransaction
};
