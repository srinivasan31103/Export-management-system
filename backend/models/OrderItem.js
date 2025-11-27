import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  sku_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SKU',
    required: false
  },
  sku_code: {
    type: String,
    required: true,
    uppercase: true
  },
  description: {
    type: String,
    required: true
  },
  hs_code: {
    type: String,
    required: false
  },
  qty: {
    type: Number,
    required: true,
    min: 1
  },
  unit_price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  line_total: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  discount_percent: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  tax_percent: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  weight_kg: {
    type: mongoose.Schema.Types.Decimal128,
    required: false,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return null;
    }
  },
  dimensions: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  }
}, {
  timestamps: true,
  collection: 'order_items',
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Pre-save hook to calculate line_total
orderItemSchema.pre('save', function(next) {
  // Use precise decimal arithmetic to avoid floating-point errors
  const qty = Number(this.qty);
  const unitPrice = Number(parseFloat(this.unit_price.toString()).toFixed(2));

  // Calculate base line total: qty × unit_price
  let lineTotal = qty * unitPrice;

  // Apply discount if present
  if (this.discount_percent > 0) {
    const discountPercent = Number(parseFloat(this.discount_percent.toString()).toFixed(2));
    const discountAmount = lineTotal * (discountPercent / 100);
    lineTotal = lineTotal - discountAmount;
  }

  // Round to 2 decimal places for currency precision
  this.line_total = Number(lineTotal.toFixed(2));
  next();
});

// Indexes
orderItemSchema.index({ order_id: 1 });
orderItemSchema.index({ sku_id: 1 });
orderItemSchema.index({ sku_code: 1 });

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

export default OrderItem;
