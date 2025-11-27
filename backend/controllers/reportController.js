import { Order, OrderItem, Buyer, Shipment, Transaction, SKU, Document } from '../models/index.js';

/**
 * GET /api/reports/sales
 * Sales report with filters
 */
export const salesReport = async (req, res, next) => {
  try {
    const { from, to, groupBy = 'month', buyerId, country } = req.query;

    const whereClause = {
      status: { $nin: ['draft', 'cancelled'] }
    };

    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt.$gte = new Date(from);
      if (to) whereClause.createdAt.$lte = new Date(to);
    }

    // Build buyer filter if needed
    let buyerIds = null;
    if (buyerId || country) {
      const buyerWhere = {};
      if (buyerId) buyerWhere._id = buyerId;
      if (country) buyerWhere.country = country;
      const buyers = await Buyer.find(buyerWhere).select('_id');
      buyerIds = buyers.map(b => b._id);
      whereClause.buyer_id = { $in: buyerIds };
    }

    const orders = await Order.find(whereClause)
      .populate('buyer_id', 'name country')
      .sort({ createdAt: 1 })
      .lean();

    // Get order items for each order
    const orderIds = orders.map(o => o._id);
    const orderItems = await OrderItem.find({ order_id: { $in: orderIds } }).lean();

    // Group items by order_id
    const itemsByOrder = {};
    orderItems.forEach(item => {
      const orderId = item.order_id.toString();
      if (!itemsByOrder[orderId]) itemsByOrder[orderId] = [];
      itemsByOrder[orderId].push(item);
    });

    // Attach items to orders
    orders.forEach(order => {
      order.items = itemsByOrder[order._id.toString()] || [];
    });

    // Aggregate by grouping
    const aggregated = {};
    const countryStats = {};
    const productStats = {};

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      let key;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = String(date.getFullYear());
      }

      if (!aggregated[key]) {
        aggregated[key] = { period: key, totalSales: 0, orderCount: 0, currency: order.currency };
      }

      const grandTotal = order.grand_total?.toString ? parseFloat(order.grand_total.toString()) : parseFloat(order.grand_total || 0);
      aggregated[key].totalSales += grandTotal;
      aggregated[key].orderCount += 1;

      // Country stats
      const country = order.buyer_id?.country || 'Unknown';
      if (!countryStats[country]) {
        countryStats[country] = { country, totalSales: 0, orderCount: 0 };
      }
      countryStats[country].totalSales += grandTotal;
      countryStats[country].orderCount += 1;

      // Product stats
      order.items.forEach(item => {
        const sku = item.sku_code;
        if (!productStats[sku]) {
          productStats[sku] = { sku, description: item.description, totalQty: 0, totalRevenue: 0 };
        }
        productStats[sku].totalQty += item.qty;
        const lineTotal = item.line_total?.toString ? parseFloat(item.line_total.toString()) : parseFloat(item.line_total || 0);
        productStats[sku].totalRevenue += lineTotal;
      });
    });

    const salesByPeriod = Object.values(aggregated);
    const salesByCountry = Object.values(countryStats).sort((a, b) => b.totalSales - a.totalSales);
    const salesByProduct = Object.values(productStats).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);

    const totalSales = salesByPeriod.reduce((sum, item) => sum + item.totalSales, 0);
    const totalOrders = salesByPeriod.reduce((sum, item) => sum + item.orderCount, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalSales,
          totalOrders,
          averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
        },
        salesByPeriod,
        salesByCountry,
        topProducts: salesByProduct
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/pending-shipments
 * Get pending shipments report
 */
export const pendingShipmentsReport = async (req, res, next) => {
  try {
    const pendingShipments = await Shipment.find({
      status: { $in: ['created', 'booked', 'in_transit'] }
    })
      .populate({
        path: 'order_id',
        populate: { path: 'buyer_id' }
      })
      .sort({ estimated_arrival: 1 })
      .lean();

    // Group by status
    const byStatus = {
      created: [],
      booked: [],
      in_transit: []
    };

    pendingShipments.forEach(shipment => {
      byStatus[shipment.status].push(shipment);
    });

    res.json({
      success: true,
      data: {
        total: pendingShipments.length,
        byStatus,
        shipments: pendingShipments
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/pending-documents
 * Get orders with pending documents
 */
export const pendingDocumentsReport = async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: { $in: ['confirmed', 'packed', 'shipped'] }
    })
      .populate('buyer_id', 'name')
      .lean();

    const orderIds = orders.map(o => o._id);
    const documents = await Document.find({ order_id: { $in: orderIds } }).lean();

    // Group documents by order_id
    const docsByOrder = {};
    documents.forEach(doc => {
      const orderId = doc.order_id.toString();
      if (!docsByOrder[orderId]) docsByOrder[orderId] = [];
      docsByOrder[orderId].push(doc);
    });

    // Attach documents to orders
    orders.forEach(order => {
      order.documents = docsByOrder[order._id.toString()] || [];
    });

    const pendingDocs = orders.filter(order => {
      const hasInvoice = order.documents.some(doc => doc.type === 'commercial_invoice');
      const hasPackingList = order.documents.some(doc => doc.type === 'packing_list');
      return !hasInvoice || !hasPackingList;
    });

    res.json({
      success: true,
      data: {
        total: pendingDocs.length,
        orders: pendingDocs.map(order => ({
          id: order._id,
          orderNo: order.order_no,
          buyer: order.buyer_id?.name,
          status: order.status,
          missingDocs: [
            !order.documents.some(d => d.type === 'commercial_invoice') ? 'Commercial Invoice' : null,
            !order.documents.some(d => d.type === 'packing_list') ? 'Packing List' : null
          ].filter(Boolean)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/lead-times
 * Average lead times report
 */
export const leadTimesReport = async (req, res, next) => {
  try {
    // Calculate average order to ship time
    const completedOrders = await Order.find({
      status: 'closed',
      actual_ship_date: { $ne: null }
    }).select('createdAt actual_ship_date').lean();

    let totalLeadDays = 0;
    completedOrders.forEach(order => {
      const diffMs = new Date(order.actual_ship_date) - new Date(order.createdAt);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      totalLeadDays += diffDays;
    });

    const avgLeadDays = completedOrders.length > 0 ? totalLeadDays / completedOrders.length : 0;

    // Calculate average transit time
    const deliveredShipments = await Shipment.find({
      status: 'delivered',
      actual_departure: { $ne: null },
      actual_arrival: { $ne: null }
    }).select('actual_departure actual_arrival').lean();

    let totalTransitDays = 0;
    deliveredShipments.forEach(shipment => {
      const diffMs = new Date(shipment.actual_arrival) - new Date(shipment.actual_departure);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      totalTransitDays += diffDays;
    });

    const avgTransitDays = deliveredShipments.length > 0 ? totalTransitDays / deliveredShipments.length : 0;

    res.json({
      success: true,
      data: {
        averageOrderToShipDays: avgLeadDays.toFixed(1),
        averageTransitDays: avgTransitDays.toFixed(1),
        orderCount: completedOrders.length,
        shipmentCount: deliveredShipments.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/export-csv
 * Export report to CSV
 */
export const exportCSV = async (req, res, next) => {
  try {
    const { type, from, to } = req.query;

    const whereClause = {};
    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt.$gte = new Date(from);
      if (to) whereClause.createdAt.$lte = new Date(to);
    }

    let data = [];
    let headers = [];

    if (type === 'orders') {
      const orders = await Order.find(whereClause)
        .populate('buyer_id', 'name country')
        .lean();

      headers = ['Order No', 'Date', 'Buyer', 'Country', 'Status', 'Currency', 'Total Amount'];
      data = orders.map(order => [
        order.order_no,
        new Date(order.createdAt).toISOString().split('T')[0],
        order.buyer_id?.name || '',
        order.buyer_id?.country || '',
        order.status,
        order.currency,
        order.grand_total?.toString ? order.grand_total.toString() : order.grand_total
      ]);
    } else if (type === 'shipments') {
      const shipments = await Shipment.find(whereClause)
        .populate({
          path: 'order_id',
          populate: { path: 'buyer_id', select: 'name' }
        })
        .lean();

      headers = ['Shipment No', 'Order No', 'Buyer', 'Carrier', 'Status', 'ETA', 'Freight Cost'];
      data = shipments.map(s => [
        s.shipment_no,
        s.order_id?.order_no || '',
        s.order_id?.buyer_id?.name || '',
        s.carrier,
        s.status,
        s.estimated_arrival ? new Date(s.estimated_arrival).toISOString().split('T')[0] : '',
        s.freight_cost?.toString ? s.freight_cost.toString() : s.freight_cost
      ]);
    }

    // Generate CSV
    const csv = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_report_${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

export default {
  salesReport,
  pendingShipmentsReport,
  pendingDocumentsReport,
  leadTimesReport,
  exportCSV
};
