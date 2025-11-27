import nodemailer from 'nodemailer';

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

/**
 * Send email
 *
 * @param {Object} options - Email options
 * @returns {Promise}
 */
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'ExportSuite <noreply@exportsuite.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    // Don't throw - email failures shouldn't break the application
    return null;
  }
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmation = async (order, buyer) => {
  const subject = `Order Confirmation - ${order.order_no}`;
  const text = `
Dear ${buyer.name},

Your order ${order.order_no} has been confirmed.

Order Details:
- Total Amount: ${order.currency} ${order.grand_total}
- Expected Ship Date: ${order.expected_ship_date || 'TBD'}

Thank you for your business!

Best regards,
ExportSuite Team
  `;

  return sendEmail({
    to: buyer.contact_email,
    subject,
    text
  });
};

/**
 * Send shipment notification email
 */
export const sendShipmentNotification = async (shipment, order, buyer) => {
  const subject = `Shipment Update - ${shipment.shipment_no}`;
  const text = `
Dear ${buyer.name},

Your shipment ${shipment.shipment_no} for order ${order.order_no} has been dispatched.

Tracking Details:
- Carrier: ${shipment.carrier}
- AWB/BL: ${shipment.awb_bl_number || 'TBD'}
- Status: ${shipment.status}
- ETA: ${shipment.estimated_arrival || 'TBD'}

${shipment.tracking_url ? `Track your shipment: ${shipment.tracking_url}` : ''}

Best regards,
ExportSuite Team
  `;

  return sendEmail({
    to: buyer.contact_email,
    subject,
    text
  });
};

export default {
  sendEmail,
  sendOrderConfirmation,
  sendShipmentNotification
};
