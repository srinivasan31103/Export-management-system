import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  type: {
    type: String,
    enum: [
      'commercial_invoice',
      'packing_list',
      'certificate_of_origin',
      'bill_of_lading',
      'air_waybill',
      'proforma_invoice',
      'inspection_certificate',
      'phytosanitary_certificate',
      'export_license',
      'other'
    ],
    required: true
  },
  file_name: {
    type: String,
    required: true
  },
  file_url: {
    type: String,
    required: true
  },
  file_size: {
    type: Number,
    required: false
  },
  mime_type: {
    type: String,
    default: 'application/pdf'
  },
  generated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  is_generated: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  }
}, {
  timestamps: true,
  collection: 'documents'
});

// Indexes
documentSchema.index({ order_id: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ generated_by: 1 });
documentSchema.index({ createdAt: -1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;
