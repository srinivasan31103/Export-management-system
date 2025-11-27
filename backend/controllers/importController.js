import { parse } from 'csv-parse/sync';
import { Order, OrderItem, SKU, Buyer } from '../models/index.js';
import { createAuditLog } from '../utils/auditLogger.js';

/**
 * POST /api/import/orders
 * Bulk import orders from CSV
 */
export const importOrders = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const results = {
      success: [],
      errors: []
    };

    for (const [index, record] of records.entries()) {
      try {
        // Expected CSV columns: buyerEmail, sku, description, qty, unitPrice, hsCode, currency, incoterm
        const buyer = await Buyer.findOne({ where: { contact_email: record.buyerEmail } });
        if (!buyer) {
          results.errors.push({
            row: index + 2,
            error: `Buyer not found: ${record.buyerEmail}`
          });
          continue;
        }

        // Create order
        const order = await Order.create({
          buyer_id: buyer.id,
          currency: record.currency || 'USD',
          incoterm: record.incoterm || 'FOB',
          created_by: req.user.id,
          status: 'draft'
        });

        // Create order item
        const sku = await SKU.findOne({ where: { sku: record.sku } });

        await OrderItem.create({
          order_id: order.id,
          sku_id: sku?.id,
          sku_code: record.sku,
          description: record.description,
          qty: parseInt(record.qty),
          unit_price: parseFloat(record.unitPrice),
          hs_code: record.hsCode || sku?.hs_code
        });

        // Update order total
        order.total_amount = parseFloat(record.qty) * parseFloat(record.unitPrice);
        order.grand_total = order.total_amount;
        await order.save();

        results.success.push({
          row: index + 2,
          orderNo: order.order_no
        });
      } catch (error) {
        results.errors.push({
          row: index + 2,
          error: error.message
        });
      }
    }

    await createAuditLog({
      userId: req.user.id,
      action: 'import_orders',
      entityType: 'order',
      meta: { totalRows: records.length, successCount: results.success.length, errorCount: results.errors.length },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/import/skus
 * Bulk import SKUs from CSV
 */
export const importSKUs = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const results = {
      success: [],
      errors: []
    };

    for (const [index, record] of records.entries()) {
      try {
        // Expected CSV columns: sku, description, hsCode, uom, category, unitPrice, costPrice, weightKg
        const existing = await SKU.findOne({ where: { sku: record.sku } });

        if (existing) {
          // Update existing
          existing.description = record.description || existing.description;
          existing.hs_code = record.hsCode || existing.hs_code;
          existing.uom = record.uom || existing.uom;
          existing.category = record.category || existing.category;
          existing.unit_price = record.unitPrice || existing.unit_price;
          existing.cost_price = record.costPrice || existing.cost_price;
          existing.weight_kg = record.weightKg || existing.weight_kg;
          await existing.save();

          results.success.push({
            row: index + 2,
            sku: existing.sku,
            action: 'updated'
          });
        } else {
          // Create new
          const newSKU = await SKU.create({
            sku: record.sku,
            description: record.description,
            hs_code: record.hsCode,
            uom: record.uom || 'PCS',
            category: record.category,
            unit_price: parseFloat(record.unitPrice || 0),
            cost_price: parseFloat(record.costPrice || 0),
            weight_kg: parseFloat(record.weightKg || 0)
          });

          results.success.push({
            row: index + 2,
            sku: newSKU.sku,
            action: 'created'
          });
        }
      } catch (error) {
        results.errors.push({
          row: index + 2,
          error: error.message
        });
      }
    }

    await createAuditLog({
      userId: req.user.id,
      action: 'import_skus',
      entityType: 'sku',
      meta: { totalRows: records.length, successCount: results.success.length, errorCount: results.errors.length },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

export default {
  importOrders,
  importSKUs
};
