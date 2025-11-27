import { AuditLog } from '../models/index.js';

/**
 * Create audit log entry
 *
 * @param {Object} params - Audit log parameters
 * @returns {Promise<AuditLog>}
 */
export const createAuditLog = async (params) => {
  try {
    const {
      userId,
      action,
      entityType,
      entityId,
      changes,
      ipAddress,
      userAgent,
      meta
    } = params;

    const auditLog = await AuditLog.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes,
      ip_address: ipAddress,
      user_agent: userAgent,
      meta
    });

    return auditLog;
  } catch (error) {
    console.error('Audit log creation error:', error);
    // Don't throw - audit logging failures shouldn't break the application
    return null;
  }
};

export default { createAuditLog };
