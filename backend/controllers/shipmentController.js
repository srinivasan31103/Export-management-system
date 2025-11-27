import { Shipment, Order, OrderItem, Buyer } from '../models/index.js';
import { createAuditLog } from '../utils/auditLogger.js';
import { sendEmail } from '../utils/emailService.js';

/**
 * POST /api/shipments
 * Create a new shipment
 */
export const createShipment = async (req, res, next) => {
  try {
    const {
      order_id,
      carrier,
      carrier_service,
      awb_bl_number,
      container_no,
      container_type,
      seal_no,
      mode_of_transport,
      estimated_departure,
      actual_departure,
      estimated_arrival,
      actual_arrival,
      port_of_loading,
      port_of_discharge,
      total_weight_kg,
      total_volume_cbm,
      freight_cost,
      insurance_cost,
      notes,
      status
    } = req.body;

    // Validate order exists
    const order = await Order.findById(order_id)
      .populate('buyer_id')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const shipment = await Shipment.create({
      order_id,
      carrier,
      carrier_service,
      awb_bl_number,
      container_no,
      container_type,
      seal_no,
      mode_of_transport: mode_of_transport || 'sea',
      status: status || 'created',
      estimated_departure,
      actual_departure,
      estimated_arrival,
      actual_arrival,
      port_of_loading: port_of_loading || order.port_of_loading,
      port_of_discharge: port_of_discharge || order.port_of_discharge,
      total_weight_kg,
      total_volume_cbm,
      freight_cost: freight_cost || 0,
      insurance_cost: insurance_cost || 0,
      notes
    });

    // Update order status
    if (order.status === 'confirmed' || order.status === 'packed') {
      await Order.findByIdAndUpdate(order_id, {
        status: 'shipped',
        actual_ship_date: new Date()
      });
    }

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'create_shipment',
      entityType: 'shipment',
      entityId: shipment._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Send email notification
    if (order.buyer_id && order.buyer_id.contact_email) {
      await sendEmail({
        to: order.buyer_id.contact_email,
        subject: `Shipment Created for Order ${order.order_no}`,
        text: `Your shipment ${shipment.shipment_no} has been created. Tracking will be available soon.`
      });
    }

    const completeShipment = await Shipment.findById(shipment._id)
      .populate({
        path: 'order_id',
        populate: { path: 'buyer_id' }
      });

    res.status(201).json({
      success: true,
      data: completeShipment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/shipments
 * Get all shipments
 */
export const getShipments = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      orderId,
      carrier
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (orderId) query.order_id = orderId;
    if (carrier) query.carrier = carrier;

    const skip = (page - 1) * limit;

    const [shipments, count] = await Promise.all([
      Shipment.find(query)
        .populate({
          path: 'order_id',
          populate: { path: 'buyer_id' }
        })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort({ created_at: -1 })
        .lean(),
      Shipment.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        shipments,
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
 * GET /api/shipments/:id
 * Get shipment by ID
 */
export const getShipmentById = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate({
        path: 'order_id',
        populate: { path: 'buyer_id' }
      })
      .lean();

    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: 'Shipment not found'
      });
    }

    // Fetch order items separately if needed
    if (shipment.order_id) {
      const orderItems = await OrderItem.find({ order_id: shipment.order_id._id })
        .populate('sku_id', 'sku description hs_code')
        .lean();
      shipment.order_id.items = orderItems;
    }

    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/shipments/:id
 * Update shipment
 */
export const updateShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate({
        path: 'order_id',
        populate: { path: 'buyer_id' }
      });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: 'Shipment not found'
      });
    }

    const oldStatus = shipment.status;

    // Accept both camelCase and snake_case field names
    const updates = req.body;

    // Map fields
    if (updates.status) shipment.status = updates.status;
    if (updates.carrier) shipment.carrier = updates.carrier;
    if (updates.awb_bl_number) shipment.awb_bl_number = updates.awb_bl_number;
    if (updates.container_no) shipment.container_no = updates.container_no;
    if (updates.container_type) shipment.container_type = updates.container_type;
    if (updates.seal_no) shipment.seal_no = updates.seal_no;
    if (updates.mode_of_transport) shipment.mode_of_transport = updates.mode_of_transport;
    if (updates.estimated_departure) shipment.estimated_departure = updates.estimated_departure;
    if (updates.actual_departure) shipment.actual_departure = updates.actual_departure;
    if (updates.estimated_arrival) shipment.estimated_arrival = updates.estimated_arrival;
    if (updates.actual_arrival) shipment.actual_arrival = updates.actual_arrival;
    if (updates.port_of_loading) shipment.port_of_loading = updates.port_of_loading;
    if (updates.port_of_discharge) shipment.port_of_discharge = updates.port_of_discharge;
    if (updates.total_weight_kg !== undefined) shipment.total_weight_kg = updates.total_weight_kg;
    if (updates.total_volume_cbm !== undefined) shipment.total_volume_cbm = updates.total_volume_cbm;
    if (updates.freight_cost !== undefined) shipment.freight_cost = updates.freight_cost;
    if (updates.insurance_cost !== undefined) shipment.insurance_cost = updates.insurance_cost;
    if (updates.tracking_url) shipment.tracking_url = updates.tracking_url;
    if (updates.notes !== undefined) shipment.notes = updates.notes;

    await shipment.save();

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'update_shipment',
      entityType: 'shipment',
      entityId: shipment._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Send email if status changed
    if (updates.status && updates.status !== oldStatus && shipment.order_id && shipment.order_id.buyer_id) {
      await sendEmail({
        to: shipment.order_id.buyer_id.contact_email,
        subject: `Shipment Status Update: ${shipment.shipment_no}`,
        text: `Your shipment status has been updated to: ${updates.status}`
      });
    }

    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/shipments/:id/track
 * Track shipment (simplified)
 */
export const trackShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('order_id')
      .lean();

    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: 'Shipment not found'
      });
    }

    // In a real system, this would call carrier API for real-time tracking
    const trackingInfo = {
      shipmentNo: shipment.shipment_no,
      carrier: shipment.carrier,
      awbBlNumber: shipment.awb_bl_number,
      status: shipment.status,
      currentLocation: 'In Transit',
      estimatedArrival: shipment.estimated_arrival,
      actualDeparture: shipment.actual_departure,
      trackingUrl: shipment.tracking_url,
      milestones: [
        { event: 'Shipment Created', date: shipment.created_at, completed: true },
        { event: 'Departed', date: shipment.actual_departure, completed: !!shipment.actual_departure },
        { event: 'In Transit', date: null, completed: shipment.status === 'in_transit' },
        { event: 'Arrived', date: shipment.actual_arrival, completed: !!shipment.actual_arrival },
        { event: 'Customs Cleared', date: null, completed: shipment.status === 'customs_cleared' },
        { event: 'Delivered', date: null, completed: shipment.status === 'delivered' }
      ]
    };

    res.json({
      success: true,
      data: trackingInfo
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipment,
  trackShipment
};
