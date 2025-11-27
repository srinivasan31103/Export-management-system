import { Document, Order, OrderItem, Buyer, Shipment } from '../models/index.js';
import { generateCommercialInvoice, generatePackingList, generateCertificateOfOrigin, generateBillOfLading } from '../utils/pdfGenerator.js';
import { uploadFile } from '../config/awsS3.js';
import { createAuditLog } from '../utils/auditLogger.js';

/**
 * GET /api/docs/order/:orderId/invoice
 * Generate and return Commercial Invoice PDF
 */
export const generateInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.params;

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

    // Generate PDF
    const pdfBuffer = await generateCommercialInvoice(order);

    // Upload to storage
    const fileName = `invoice_${order.order_no}_${Date.now()}.pdf`;
    const fileUrl = await uploadFile(pdfBuffer, fileName, 'application/pdf', 'invoices');

    // Save document record
    const document = await Document.create({
      order_id: orderId,
      type: 'commercial_invoice',
      file_name: fileName,
      file_url: fileUrl,
      file_size: pdfBuffer.length,
      mime_type: 'application/pdf',
      generated_by: req.user.id,
      is_generated: true
    });

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'generate_invoice',
      entityType: 'document',
      entityId: document._id,
      meta: { orderId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Return PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/docs/order/:orderId/packing-list
 * Generate and return Packing List PDF
 */
export const generatePackingListDoc = async (req, res, next) => {
  try {
    const { orderId } = req.params;

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

    const pdfBuffer = await generatePackingList(order);

    const fileName = `packing_list_${order.order_no}_${Date.now()}.pdf`;
    const fileUrl = await uploadFile(pdfBuffer, fileName, 'application/pdf', 'packing-lists');

    await Document.create({
      order_id: orderId,
      type: 'packing_list',
      file_name: fileName,
      file_url: fileUrl,
      file_size: pdfBuffer.length,
      mime_type: 'application/pdf',
      generated_by: req.user.id,
      is_generated: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/docs/order/:orderId/certificate-of-origin
 * Generate Certificate of Origin
 */
export const generateCOO = async (req, res, next) => {
  try {
    const { orderId } = req.params;

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

    const pdfBuffer = await generateCertificateOfOrigin(order);

    const fileName = `coo_${order.order_no}_${Date.now()}.pdf`;
    const fileUrl = await uploadFile(pdfBuffer, fileName, 'application/pdf', 'certificates');

    await Document.create({
      order_id: orderId,
      type: 'certificate_of_origin',
      file_name: fileName,
      file_url: fileUrl,
      file_size: pdfBuffer.length,
      mime_type: 'application/pdf',
      generated_by: req.user.id,
      is_generated: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/docs/shipment/:shipmentId/bill-of-lading
 * Generate Bill of Lading
 */
export const generateBL = async (req, res, next) => {
  try {
    const { shipmentId } = req.params;

    const shipment = await Shipment.findById(shipmentId)
      .populate({
        path: 'order',
        populate: [
          { path: 'items' },
          { path: 'buyer' }
        ]
      });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: 'Shipment not found'
      });
    }

    const pdfBuffer = await generateBillOfLading(shipment);

    const fileName = `bl_${shipment.shipment_no}_${Date.now()}.pdf`;
    const fileUrl = await uploadFile(pdfBuffer, fileName, 'application/pdf', 'bills-of-lading');

    await Document.create({
      order_id: shipment.order_id,
      type: 'bill_of_lading',
      file_name: fileName,
      file_url: fileUrl,
      file_size: pdfBuffer.length,
      mime_type: 'application/pdf',
      generated_by: req.user.id,
      is_generated: true,
      metadata: { shipment_id: shipmentId }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/docs/order/:orderId
 * Get all documents for an order
 */
export const getOrderDocuments = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const documents = await Document.find({ order_id: orderId })
      .sort({ created_at: -1 })
      .lean();

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/docs/upload
 * Upload a document manually
 */
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { orderId, type } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const fileUrl = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'uploads'
    );

    const document = await Document.create({
      order_id: orderId,
      type: type || 'other',
      file_name: req.file.originalname,
      file_url: fileUrl,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      generated_by: req.user.id,
      is_generated: false
    });

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export default {
  generateInvoice,
  generatePackingListDoc,
  generateCOO,
  generateBL,
  getOrderDocuments,
  uploadDocument
};
