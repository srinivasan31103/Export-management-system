import { Order, OrderItem, Buyer, User, SKU, Shipment, Document } from '../models/index.js';
import { createAuditLog } from '../utils/auditLogger.js';

/**
 * POST /api/orders
 * Create a new order
 */
export const createOrder = async (req, res, next) => {
  try {
    const {
      buyer_id,
      items,
      incoterm,
      currency,
      expected_ship_date,
      shipping_address,
      billing_address,
      port_of_loading,
      port_of_discharge,
      notes
    } = req.body;

    // Validate buyer exists
    const buyer = await Buyer.findById(buyer_id);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }

    // Create order
    const order = await Order.create({
      buyer_id: buyer_id,
      incoterm: incoterm || 'FOB',
      currency: currency || 'USD',
      expected_ship_date: expected_ship_date,
      shipping_address: shipping_address,
      billing_address: billing_address,
      port_of_loading: port_of_loading,
      port_of_discharge: port_of_discharge,
      notes,
      created_by: req.user.id,
      status: 'draft'
    });

    // Create order items
    let totalAmount = 0;
    for (const item of items) {
      const sku = item.sku_id ? await SKU.findById(item.sku_id) : null;

      const orderItem = await OrderItem.create({
        order_id: order._id,
        sku_id: item.sku_id || null,
        sku_code: item.sku || sku?.sku || 'CUSTOM',
        description: item.description,
        hs_code: item.hs_code || sku?.hs_code,
        qty: item.qty,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
        tax_percent: item.tax_percent || 0,
        weight_kg: item.weight_kg || sku?.weight_kg
      });

      totalAmount += parseFloat(orderItem.line_total);
    }

    // Update order totals with precise decimal rounding
    const taxRate = parseFloat(process.env.DEFAULT_TAX_RATE) || 0;
    order.total_amount = Number(totalAmount.toFixed(2));
    order.tax_amount = Number((totalAmount * taxRate).toFixed(2));
    order.grand_total = Number((order.total_amount + order.tax_amount).toFixed(2));
    await order.save();

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'create_order',
      entityType: 'order',
      entityId: order._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Fetch complete order with buyer info and items
    const completeOrder = await Order.findById(order._id)
      .populate('buyer_id', 'name company_name country')
      .lean();

    // Fetch order items separately
    const orderItems = await OrderItem.find({ order_id: order._id }).lean();
    completeOrder.items = orderItems;

    res.status(201).json({
      success: true,
      data: completeOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders
 * Get all orders with filters and pagination
 */
export const getOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      buyerId,
      fromDate,
      toDate,
      search
    } = req.query;

    const query = {};

    // Apply filters
    if (status) query.status = status;
    if (buyerId) query.buyer_id = buyerId;
    if (fromDate || toDate) {
      query.created_at = {};
      if (fromDate) query.created_at.$gte = new Date(fromDate);
      if (toDate) query.created_at.$lte = new Date(toDate);
    }

    // For buyer role, only show their orders
    if (req.user.role === 'buyer') {
      const buyer = await Buyer.findOne({ contact_email: req.user.email });
      if (buyer) {
        query.buyer_id = buyer._id;
      }
    }

    const skip = (page - 1) * limit;

    const [orders, count] = await Promise.all([
      Order.find(query)
        .populate('buyer_id', 'name company_name country')
        .populate('created_by', 'name email')
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort({ created_at: -1 })
        .lean(),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        orders,
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
 * GET /api/orders/:id
 * Get single order by ID
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer_id', 'name company_name country')
      .populate('created_by', 'name email')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check access for buyer role
    if (req.user.role === 'buyer') {
      const buyer = await Buyer.findOne({ contact_email: req.user.email });
      if (!buyer || order.buyer_id._id.toString() !== buyer._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    // Fetch order items separately
    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate('sku_id', 'sku description hs_code')
      .lean();
    order.items = orderItems;

    // Fetch shipments
    const shipments = await Shipment.find({ order_id: order._id }).lean();
    order.shipments = shipments;

    // Fetch documents
    const documents = await Document.find({ order_id: order._id }).lean();
    order.documents = documents;

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/orders/:id
 * Update order
 */
export const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const {
      status,
      expectedShipDate,
      actualShipDate,
      shippingAddress,
      billingAddress,
      portOfLoading,
      portOfDischarge,
      notes
    } = req.body;

    const oldValues = order.toObject();

    // Update fields
    if (status) order.status = status;
    if (expectedShipDate) order.expected_ship_date = expectedShipDate;
    if (actualShipDate) order.actual_ship_date = actualShipDate;
    if (shippingAddress) order.shipping_address = shippingAddress;
    if (billingAddress) order.billing_address = billingAddress;
    if (portOfLoading) order.port_of_loading = portOfLoading;
    if (portOfDischarge) order.port_of_discharge = portOfDischarge;
    if (notes !== undefined) order.notes = notes;

    await order.save();

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'update_order',
      entityType: 'order',
      entityId: order._id,
      changes: { before: oldValues, after: order.toObject() },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const updatedOrder = await Order.findById(order._id)
      .populate('buyer_id', 'name company_name country')
      .populate('created_by', 'name email')
      .lean();

    // Fetch order items separately
    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate('sku_id', 'sku description hs_code')
      .lean();
    updatedOrder.items = orderItems;

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/orders/:id
 * Delete order
 */
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if order can be deleted
    if (['shipped', 'invoiced', 'closed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete order in current status'
      });
    }

    // Delete order items first
    await OrderItem.deleteMany({ order_id: order._id });

    // Delete order
    await order.deleteOne();

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'delete_order',
      entityType: 'order',
      entityId: order._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
};
