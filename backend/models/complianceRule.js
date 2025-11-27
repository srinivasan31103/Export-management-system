import mongoose from 'mongoose';

const complianceRuleSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    uppercase: true
  },
  hs_code: {
    type: String,
    required: false
  },
  rule_type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  required_documents: {
    type: [String],
    required: false,
    default: []
  },
  duty_rate: {
    type: mongoose.Schema.Types.Decimal128,
    required: false,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return null;
    }
  },
  additional_info: {
    type: String,
    required: false
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'compliance_rules',
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Indexes
complianceRuleSchema.index({ country: 1 });
complianceRuleSchema.index({ hs_code: 1 });
complianceRuleSchema.index({ rule_type: 1 });
complianceRuleSchema.index({ is_active: 1 });

// Compound index for country-specific HS code lookups
complianceRuleSchema.index({ country: 1, hs_code: 1 });

const ComplianceRule = mongoose.model('ComplianceRule', complianceRuleSchema);

export default ComplianceRule;
