import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  order_no: {
    type: String,
    unique: true,
    uppercase: true
  },
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },
  incoterm: {
    type: String,
    enum: ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'],
    default: 'FOB',
    required: true
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
    enum: ['draft', 'confirmed', 'packed', 'shipped', 'invoiced', 'closed', 'cancelled'],
    default: 'draft',
    required: true
  },
  expected_ship_date: {
    type: Date,
    required: false
  },
  actual_ship_date: {
    type: Date,
    required: false
  },
  total_amount: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  tax_amount: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  discount_amount: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  grand_total: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  payment_status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending'
  },
  shipping_address: {
    type: String,
    required: false
  },
  billing_address: {
    type: String,
    required: false
  },
  port_of_loading: {
    type: String,
    required: false
  },
  port_of_discharge: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  collection: 'orders',
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Pre-save hook to auto-generate order number
orderSchema.pre('save', function(next) {
  if (!this.order_no || this.order_no === '') {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.order_no = `ORD-${year}${month}-${random}`;
  }
  next();
});

// Indexes
orderSchema.index({ buyer_id: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ payment_status: 1 });
orderSchema.index({ created_by: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
