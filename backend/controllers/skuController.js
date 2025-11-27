import { SKU, Inventory, Warehouse } from '../models/index.js';
import { createAuditLog } from '../utils/auditLogger.js';

/**
 * POST /api/skus
 * Create a new SKU
 */
export const createSKU = async (req, res, next) => {
  try {
    const {
      sku,
      description,
      hsCode,
      uom,
      category,
      weightKg,
      dimensions,
      unitPrice,
      costPrice,
      reorderLevel,
      imageUrl,
      notes
    } = req.body;

    // Check if SKU already exists
    const existing = await SKU.findOne({ sku });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'SKU already exists'
      });
    }

    const newSKU = await SKU.create({
      sku,
      description,
      hs_code: hsCode,
      uom: uom || 'PCS',
      category,
      weight_kg: weightKg,
      dimensions,
      unit_price: unitPrice || 0,
      cost_price: costPrice || 0,
      reorder_level: reorderLevel || 0,
      image_url: imageUrl,
      notes
    });

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'create_sku',
      entityType: 'sku',
      entityId: newSKU._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      data: newSKU
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/skus
 * Get all SKUs with pagination and filters
 */
export const getSKUs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      search,
      isActive
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (isActive !== undefined) query.is_active = isActive === 'true';
    if (search) {
      query.$or = [
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [skus, count] = await Promise.all([
      SKU.find(query)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort({ sku: 1 })
        .lean(),
      SKU.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        skus,
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
 * GET /api/skus/:id
 * Get single SKU by ID
 */
export const getSKUById = async (req, res, next) => {
  try {
    const sku = await SKU.findById(req.params.id)
      .populate({
        path: 'inventory',
        populate: { path: 'warehouse' }
      })
      .lean();

    if (!sku) {
      return res.status(404).json({
        success: false,
        error: 'SKU not found'
      });
    }

    res.json({
      success: true,
      data: sku
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/skus/:id
 * Update SKU
 */
export const updateSKU = async (req, res, next) => {
  try {
    const sku = await SKU.findById(req.params.id);

    if (!sku) {
      return res.status(404).json({
        success: false,
        error: 'SKU not found'
      });
    }

    const oldValues = sku.toObject();

    const {
      description,
      hsCode,
      uom,
      category,
      weightKg,
      dimensions,
      unitPrice,
      costPrice,
      reorderLevel,
      imageUrl,
      isActive,
      notes
    } = req.body;

    // Update fields
    if (description) sku.description = description;
    if (hsCode !== undefined) sku.hs_code = hsCode;
    if (uom) sku.uom = uom;
    if (category !== undefined) sku.category = category;
    if (weightKg !== undefined) sku.weight_kg = weightKg;
    if (dimensions !== undefined) sku.dimensions = dimensions;
    if (unitPrice !== undefined) sku.unit_price = unitPrice;
    if (costPrice !== undefined) sku.cost_price = costPrice;
    if (reorderLevel !== undefined) sku.reorder_level = reorderLevel;
    if (imageUrl !== undefined) sku.image_url = imageUrl;
    if (isActive !== undefined) sku.is_active = isActive;
    if (notes !== undefined) sku.notes = notes;

    await sku.save();

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'update_sku',
      entityType: 'sku',
      entityId: sku._id,
      changes: { before: oldValues, after: sku.toObject() },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      data: sku
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/skus/:id
 * Delete SKU
 */
export const deleteSKU = async (req, res, next) => {
  try {
    const sku = await SKU.findById(req.params.id);

    if (!sku) {
      return res.status(404).json({
        success: false,
        error: 'SKU not found'
      });
    }

    // Soft delete (deactivate instead of removing)
    sku.is_active = false;
    await sku.save();

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'delete_sku',
      entityType: 'sku',
      entityId: sku._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'SKU deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createSKU,
  getSKUs,
  getSKUById,
  updateSKU,
  deleteSKU
};
