import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  shipment_no: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    default: function() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `SHP-${year}${month}-${random}`;
    }
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  carrier: {
    type: String,
    required: true
  },
  carrier_service: {
    type: String,
    required: false
  },
  awb_bl_number: {
    type: String,
    required: false
  },
  container_no: {
    type: String,
    required: false,
    uppercase: true
  },
  container_type: {
    type: String,
    required: false
  },
  seal_no: {
    type: String,
    required: false,
    uppercase: true
  },
  mode_of_transport: {
    type: String,
    enum: ['sea', 'air', 'road', 'rail'],
    default: 'sea'
  },
  status: {
    type: String,
    enum: ['created', 'booked', 'in_transit', 'arrived', 'customs_cleared', 'delivered', 'cancelled'],
    default: 'created',
    required: true
  },
  estimated_departure: {
    type: Date,
    required: false
  },
  actual_departure: {
    type: Date,
    required: false
  },
  estimated_arrival: {
    type: Date,
    required: false
  },
  actual_arrival: {
    type: Date,
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
  total_weight_kg: {
    type: mongoose.Schema.Types.Decimal128,
    required: false,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return null;
    }
  },
  total_volume_cbm: {
    type: mongoose.Schema.Types.Decimal128,
    required: false,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return null;
    }
  },
  tracking_url: {
    type: String,
    required: false
  },
  freight_cost: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  insurance_cost: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  notes: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  collection: 'shipments',
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Pre-save hook to auto-generate shipment number
shipmentSchema.pre('save', function(next) {
  if (!this.shipment_no || this.shipment_no === '') {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.shipment_no = `SHP-${year}${month}-${random}`;
  }
  next();
});

// Indexes
shipmentSchema.index({ order_id: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ awb_bl_number: 1 });
shipmentSchema.index({ container_no: 1 });

const Shipment = mongoose.model('Shipment', shipmentSchema);

export default Shipment;
