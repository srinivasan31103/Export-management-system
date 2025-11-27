import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  sku_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SKU',
    required: true
  },
  warehouse_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  qty_available: {
    type: Number,
    default: 0,
    required: true,
    min: 0
  },
  qty_reserved: {
    type: Number,
    default: 0,
    required: true,
    min: 0
  },
  qty_in_transit: {
    type: Number,
    default: 0,
    required: true,
    min: 0
  },
  last_stock_update: {
    type: Date,
    default: Date.now
  },
  bin_location: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  collection: 'inventory'
});

// Compound unique index to ensure one inventory record per SKU per warehouse
inventorySchema.index({ sku_id: 1, warehouse_id: 1 }, { unique: true });

// Additional indexes for queries
inventorySchema.index({ sku_id: 1 });
inventorySchema.index({ warehouse_id: 1 });
inventorySchema.index({ qty_available: 1 });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
