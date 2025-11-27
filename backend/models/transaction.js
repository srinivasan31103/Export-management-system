import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  transaction_no: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['payment', 'refund', 'adjustment', 'credit_note'],
    default: 'payment',
    required: true
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  currency: {
    type: String,
    maxlength: 3,
    default: 'USD',
    required: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    required: true
  },
  payment_method: {
    type: String,
    required: false
  },
  payment_gateway_id: {
    type: String,
    required: false
  },
  payment_date: {
    type: Date,
    required: false
  },
  reference: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  }
}, {
  timestamps: true,
  collection: 'transactions',
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Pre-save hook to auto-generate transaction number
transactionSchema.pre('save', function(next) {
  if (!this.transaction_no || this.transaction_no === '') {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.transaction_no = `TXN-${year}${month}-${random}`;
  }
  next();
});

// Indexes
transactionSchema.index({ order_id: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ payment_gateway_id: 1 });
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
