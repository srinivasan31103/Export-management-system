import { Inventory, SKU, Warehouse, OrderItem } from '../models/index.js';
import { createAuditLog } from '../utils/auditLogger.js';

/**
 * GET /api/inventory
 * Get all inventory with filters
 */
export const getInventory = async (req, res, next) => {
  try {
    const { warehouseId, skuId, lowStock } = req.query;

    const query = {};
    if (warehouseId) query.warehouse_id = warehouseId;
    if (skuId) query.sku_id = skuId;

    let inventory = await Inventory.find(query)
      .populate('sku_id', 'sku description')
      .populate('warehouse_id', 'name location')
      .sort({ sku_id: 1 })
      .lean();

    // Filter low stock if requested
    if (lowStock === 'true') {
      inventory = inventory.filter(inv => {
        const reorderLevel = inv.sku?.reorder_level || 0;
        return inv.qty_available <= reorderLevel;
      });
    }

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/inventory/reserve
 * Reserve inventory for an order
 */
export const reserveInventory = async (req, res, next) => {
  try {
    const { orderId, warehouseId } = req.body;

    // Get order items
    const items = await OrderItem.find({ order_id: orderId })
      .populate('sku');

    const reservations = [];
    const errors = [];

    for (const item of items) {
      if (!item.sku_id) continue;

      const inventory = await Inventory.findOne({
        sku_id: item.sku_id,
        warehouse_id: warehouseId
      });

      if (!inventory) {
        errors.push(`No inventory found for SKU ${item.sku_code} in warehouse`);
        continue;
      }

      if (inventory.qty_available < item.qty) {
        errors.push(`Insufficient stock for SKU ${item.sku_code}. Available: ${inventory.qty_available}, Required: ${item.qty}`);
        continue;
      }

      // Reserve inventory
      inventory.qty_available -= item.qty;
      inventory.qty_reserved += item.qty;
      await inventory.save();

      reservations.push({
        skuCode: item.sku_code,
        qtyReserved: item.qty,
        warehouse: inventory.warehouse_id
      });
    }

    await createAuditLog({
      userId: req.user.id,
      action: 'reserve_inventory',
      entityType: 'inventory',
      meta: { orderId, warehouseId, reservations },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: errors.length === 0,
      data: {
        reservations,
        errors
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/inventory/adjust
 * Adjust inventory levels
 */
export const adjustInventory = async (req, res, next) => {
  try {
    const { skuId, warehouseId, adjustment, reason } = req.body;

    const inventory = await Inventory.findOne({
      sku_id: skuId,
      warehouse_id: warehouseId
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory record not found'
      });
    }

    const oldQty = inventory.qty_available;
    inventory.qty_available += parseInt(adjustment);

    if (inventory.qty_available < 0) {
      return res.status(400).json({
        success: false,
        error: 'Adjustment would result in negative inventory'
      });
    }

    inventory.last_stock_update = new Date();
    await inventory.save();

    await createAuditLog({
      userId: req.user.id,
      action: 'adjust_inventory',
      entityType: 'inventory',
      entityId: inventory._id,
      changes: {
        before: oldQty,
        after: inventory.qty_available,
        adjustment,
        reason
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/inventory
 * Create inventory record
 */
export const createInventory = async (req, res, next) => {
  try {
    const { skuId, warehouseId, qtyAvailable, binLocation } = req.body;

    // Check if already exists
    const existing = await Inventory.findOne({
      sku_id: skuId,
      warehouse_id: warehouseId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Inventory record already exists for this SKU and warehouse'
      });
    }

    const inventory = await Inventory.create({
      sku_id: skuId,
      warehouse_id: warehouseId,
      qty_available: qtyAvailable || 0,
      bin_location: binLocation
    });

    res.status(201).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getInventory,
  reserveInventory,
  adjustInventory,
  createInventory
};
