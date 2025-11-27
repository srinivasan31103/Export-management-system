import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  entity_type: {
    type: String,
    required: true
  },
  entity_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  ip_address: {
    type: String,
    required: false
  },
  user_agent: {
    type: String,
    required: false
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false
  },
  collection: 'audit_logs'
});

// Indexes
auditLogSchema.index({ user_id: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entity_type: 1 });
auditLogSchema.index({ entity_id: 1 });
auditLogSchema.index({ createdAt: -1 });

// Compound index for filtering by entity
auditLogSchema.index({ entity_type: 1, entity_id: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
