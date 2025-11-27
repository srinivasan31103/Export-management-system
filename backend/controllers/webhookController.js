import { Shipment } from '../models/index.js';
import { sendEmail } from '../utils/emailService.js';

/**
 * POST /api/webhooks/carrier
 * Webhook for carrier tracking updates
 */
export const carrierWebhook = async (req, res, next) => {
  try {
    const { trackingNumber, status, location, timestamp, carrier } = req.body;

    // Find shipment by AWB/BL number
    const shipment = await Shipment.findOne({
      where: { awb_bl_number: trackingNumber }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: 'Shipment not found'
      });
    }

    // Map carrier status to our status
    const statusMapping = {
      'picked_up': 'booked',
      'in_transit': 'in_transit',
      'arrived': 'arrived',
      'delivered': 'delivered'
    };

    const newStatus = statusMapping[status] || shipment.status;

    shipment.status = newStatus;
    if (status === 'delivered' && !shipment.actual_arrival) {
      shipment.actual_arrival = new Date(timestamp);
    }

    await shipment.save();

    // Send notification (simplified)
    console.log(`Shipment ${shipment.shipment_no} updated to ${newStatus} at ${location}`);

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/webhooks/payment
 * Webhook for payment gateway callbacks
 */
export const paymentWebhook = async (req, res, next) => {
  try {
    const { orderId, transactionId, status, amount, gateway } = req.body;

    // In production, verify webhook signature from payment gateway
    console.log('Payment webhook received:', { orderId, transactionId, status, amount, gateway });

    // Update transaction status in database
    // This would typically update the Transaction model

    res.json({
      success: true,
      message: 'Payment webhook processed'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  carrierWebhook,
  paymentWebhook
};
