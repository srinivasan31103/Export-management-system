import { classifyHSCode, generateDocSummary, generateBusinessInsights } from '../utils/aiClient.js';
import { Order, OrderItem, Buyer } from '../models/index.js';
import { createAuditLog } from '../utils/auditLogger.js';

/**
 * POST /api/ai/hs-classify
 * Classify product description to HS code using Claude AI
 *
 * Request body: { description: "stainless steel cutlery set 12 pcs" }
 *
 * Uses Claude AI with prompt:
 * "You are a customs classification assistant. Given product description:
 * '{description}' return the most likely HS code (6-digit), 2 short reasons,
 * and a confidence score (0-100). Output JSON format."
 */
export const hsClassify = async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid product description (min 3 characters)'
      });
    }

    // Call Claude AI
    const result = await classifyHSCode(description);

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'ai_hs_classify',
      entityType: 'ai',
      meta: { description, result },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI HS Classification Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to classify HS code. Please try again or contact support.',
      details: error.message
    });
  }
};

/**
 * POST /api/ai/doc-summary
 * Auto-fill document fields or identify missing information
 *
 * Request body: { orderId: 123 }
 */
export const docSummary = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId)
      .populate('buyer_id', 'name company_name country contact_email')
      .populate('created_by', 'name email')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Fetch order items separately
    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate('sku_id', 'sku description hs_code')
      .lean();
    order.items = orderItems;

    // Call Claude AI
    const summary = await generateDocSummary(order);

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'ai_doc_summary',
      entityType: 'ai',
      meta: { orderId, summary },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('AI Doc Summary Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate document summary',
      details: error.message
    });
  }
};

/**
 * POST /api/ai/business-insights
 * Generate business insights and recommendations
 *
 * Request body: { timeframe: "last_30_days" }
 */
export const businessInsights = async (req, res, next) => {
  try {
    const { timeframe = 'last_30_days' } = req.body;

    // Get recent orders for analysis
    const query = {};
    const now = new Date();

    switch (timeframe) {
      case 'last_7_days':
        query.created_at = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'last_30_days':
        query.created_at = { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
        break;
      case 'last_90_days':
        query.created_at = { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) };
        break;
    }

    const orders = await Order.find(query)
      .populate('buyer_id', 'name company_name country')
      .populate('created_by', 'name email')
      .limit(100)
      .lean();

    // Fetch order items for each order
    for (let order of orders) {
      const orderItems = await OrderItem.find({ order_id: order._id })
        .populate('sku_id', 'sku description hs_code')
        .lean();
      order.items = orderItems;
    }

    // Call Claude AI
    const insights = await generateBusinessInsights(orders, timeframe);

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'ai_business_insights',
      entityType: 'ai',
      meta: { timeframe, orderCount: orders.length },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('AI Business Insights Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate business insights',
      details: error.message
    });
  }
};

/**
 * POST /api/ai/suggest-improvements
 * Suggest improvements for order/shipment data
 */
export const suggestImprovements = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId)
      .populate('buyer_id', 'name company_name country contact_email')
      .populate('created_by', 'name email')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Fetch order items separately
    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate('sku_id', 'sku description hs_code weight_kg')
      .lean();
    order.items = orderItems;

    // Analyze order data quality
    const issues = [];
    const suggestions = [];

    // Check for missing HS codes
    const itemsWithoutHS = order.items.filter(item => !item.hs_code);
    if (itemsWithoutHS.length > 0) {
      issues.push(`${itemsWithoutHS.length} item(s) missing HS codes`);
      suggestions.push('Use AI HS Classifier to automatically classify products');
    }

    // Check for missing weights
    const itemsWithoutWeight = order.items.filter(item => !item.weight_kg);
    if (itemsWithoutWeight.length > 0) {
      issues.push(`${itemsWithoutWeight.length} item(s) missing weight information`);
      suggestions.push('Add weight information for accurate freight calculations');
    }

    // Check addresses
    if (!order.shipping_address) {
      issues.push('Missing shipping address');
      suggestions.push('Add complete shipping address with postal code');
    }

    res.json({
      success: true,
      data: {
        orderNo: order.order_no,
        issues,
        suggestions,
        completeness: ((order.items.length - itemsWithoutHS.length) / order.items.length * 100).toFixed(0) + '%'
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  hsClassify,
  docSummary,
  businessInsights,
  suggestImprovements
};
