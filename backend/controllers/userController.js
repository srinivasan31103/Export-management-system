import { User } from '../models/index.js';
import { createAuditLog } from '../utils/auditLogger.js';

/**
 * GET /api/users
 * Get all users (admin only)
 */
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, role, isActive } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.is_active = isActive === 'true';

    const skip = (page - 1) * limit;

    const [users, count] = await Promise.all([
      User.find(query)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort({ name: 1 })
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        users,
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
 * PUT /api/users/:id
 * Update user (admin only)
 */
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { name, role, isActive, phone } = req.body;

    if (name) user.name = name;
    if (role) user.role = role;
    if (isActive !== undefined) user.is_active = isActive;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    await createAuditLog({
      userId: req.user.id,
      action: 'update_user',
      entityType: 'user',
      entityId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getUsers,
  updateUser
};
