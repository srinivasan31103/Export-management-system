import { Buyer, Order } from '../models/index.js';
import { createAuditLog } from '../utils/auditLogger.js';

/**
 * POST /api/buyers
 * Create a new buyer
 */
export const createBuyer = async (req, res, next) => {
  try {
    const {
      name,
      companyName,
      contactEmail,
      contactPhone,
      country,
      address,
      city,
      state,
      postalCode,
      taxId,
      creditLimit,
      currencyPreference,
      paymentTerms,
      notes
    } = req.body;

    const buyer = await Buyer.create({
      name,
      company_name: companyName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      country,
      address,
      city,
      state,
      postal_code: postalCode,
      tax_id: taxId,
      credit_limit: creditLimit || 0,
      currency_preference: currencyPreference || 'USD',
      payment_terms: paymentTerms || 'NET30',
      notes
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'create_buyer',
      entityType: 'buyer',
      entityId: buyer._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      data: buyer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/buyers
 * Get all buyers
 */
export const getBuyers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, country, isActive, search } = req.query;

    const query = {};
    if (country) query.country = country;
    if (isActive !== undefined) query.is_active = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company_name: { $regex: search, $options: 'i' } },
        { contact_email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [buyers, count] = await Promise.all([
      Buyer.find(query)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort({ name: 1 })
        .lean(),
      Buyer.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        buyers,
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
 * GET /api/buyers/:id
 * Get buyer by ID
 */
export const getBuyerById = async (req, res, next) => {
  try {
    const buyer = await Buyer.findById(req.params.id)
      .populate({
        path: 'orders',
        options: {
          limit: 10,
          sort: { created_at: -1 }
        }
      })
      .lean();

    if (!buyer) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }

    res.json({
      success: true,
      data: buyer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/buyers/:id
 * Update buyer
 */
export const updateBuyer = async (req, res, next) => {
  try {
    const buyer = await Buyer.findById(req.params.id);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }

    const {
      name,
      companyName,
      contactEmail,
      contactPhone,
      address,
      city,
      state,
      postalCode,
      creditLimit,
      paymentTerms,
      isActive,
      notes
    } = req.body;

    if (name) buyer.name = name;
    if (companyName) buyer.company_name = companyName;
    if (contactEmail) buyer.contact_email = contactEmail;
    if (contactPhone !== undefined) buyer.contact_phone = contactPhone;
    if (address !== undefined) buyer.address = address;
    if (city !== undefined) buyer.city = city;
    if (state !== undefined) buyer.state = state;
    if (postalCode !== undefined) buyer.postal_code = postalCode;
    if (creditLimit !== undefined) buyer.credit_limit = creditLimit;
    if (paymentTerms) buyer.payment_terms = paymentTerms;
    if (isActive !== undefined) buyer.is_active = isActive;
    if (notes !== undefined) buyer.notes = notes;

    await buyer.save();

    await createAuditLog({
      userId: req.user.id,
      action: 'update_buyer',
      entityType: 'buyer',
      entityId: buyer._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      data: buyer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/buyers/:id
 * Delete buyer (soft delete)
 */
export const deleteBuyer = async (req, res, next) => {
  try {
    const buyer = await Buyer.findById(req.params.id);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }

    buyer.is_active = false;
    await buyer.save();

    await createAuditLog({
      userId: req.user.id,
      action: 'delete_buyer',
      entityType: 'buyer',
      entityId: buyer._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Buyer deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createBuyer,
  getBuyers,
  getBuyerById,
  updateBuyer,
  deleteBuyer
};
