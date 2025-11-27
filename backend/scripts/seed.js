import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import {
  User,
  Buyer,
  SKU,
  Warehouse,
  Inventory,
  Order,
  OrderItem,
  ComplianceRule
} from '../models/index.js';

dotenv.config();

/**
 * Seed database with sample data
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to MongoDB
    await connectDB();

    // Drop all collections (equivalent to sequelize.sync({ force: true }))
    await User.deleteMany({});
    await Buyer.deleteMany({});
    await SKU.deleteMany({});
    await Warehouse.deleteMany({});
    await Inventory.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await ComplianceRule.deleteMany({});
    console.log('✓ Database collections cleared');

    // Create Admin User
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@exportsuite.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1-555-0100'
    });
    console.log('✓ Admin user created (email: admin@exportsuite.com, password: admin123)');

    // Create Manager User
    const manager = await User.create({
      name: 'John Manager',
      email: 'manager@exportsuite.com',
      password: 'manager123',
      role: 'manager',
      phone: '+1-555-0101'
    });
    console.log('✓ Manager user created (email: manager@exportsuite.com, password: manager123)');

    // Create Clerk User
    const clerk = await User.create({
      name: 'Jane Clerk',
      email: 'clerk@exportsuite.com',
      password: 'clerk123',
      role: 'clerk',
      phone: '+1-555-0102'
    });
    console.log('✓ Clerk user created (email: clerk@exportsuite.com, password: clerk123)');

    // Create Buyer User
    const buyerUser = await User.create({
      name: 'Bob Buyer',
      email: 'buyer@importco.com',
      password: 'buyer123',
      role: 'buyer',
      phone: '+44-20-1234-5678'
    });
    console.log('✓ Buyer user created (email: buyer@importco.com, password: buyer123)');

    // Create Buyers
    const buyer1 = await Buyer.create({
      name: 'Bob Williams',
      company_name: 'UK Import Co Ltd',
      contact_email: 'buyer@importco.com',
      contact_phone: '+44-20-1234-5678',
      country: 'United Kingdom',
      address: '123 Oxford Street',
      city: 'London',
      state: 'Greater London',
      postal_code: 'W1D 1BS',
      tax_id: 'GB123456789',
      credit_limit: 50000,
      currency_preference: 'GBP',
      payment_terms: 'NET30'
    });

    const buyer2 = await Buyer.create({
      name: 'Maria Garcia',
      company_name: 'Europa Trading GmbH',
      contact_email: 'maria@europatrading.de',
      contact_phone: '+49-30-12345678',
      country: 'Germany',
      address: 'Friedrichstrasse 50',
      city: 'Berlin',
      postal_code: '10117',
      tax_id: 'DE987654321',
      credit_limit: 75000,
      currency_preference: 'EUR',
      payment_terms: 'NET45'
    });

    console.log('✓ Buyers created');

    // Create Warehouses
    const warehouse1 = await Warehouse.create({
      name: 'Main Warehouse',
      code: 'WH-MAIN',
      address: '456 Warehouse Blvd',
      city: 'Newark',
      state: 'New Jersey',
      country: 'USA',
      postal_code: '07102',
      latitude: 40.735657,
      longitude: -74.172367,
      contact_name: 'Tom Warehouse',
      contact_phone: '+1-555-0200',
      contact_email: 'warehouse@exportsuite.com'
    });

    const warehouse2 = await Warehouse.create({
      name: 'West Coast Facility',
      code: 'WH-WEST',
      address: '789 Logistics Way',
      city: 'Los Angeles',
      state: 'California',
      country: 'USA',
      postal_code: '90001',
      latitude: 34.052235,
      longitude: -118.243683,
      contact_name: 'Sarah West',
      contact_phone: '+1-555-0201',
      contact_email: 'west@exportsuite.com'
    });

    console.log('✓ Warehouses created');

    // Create SKUs
    const sku1 = await SKU.create({
      sku: 'SKU-001',
      description: 'Stainless Steel Cutlery Set - 24 pieces',
      hs_code: '821510',
      uom: 'SET',
      category: 'Kitchenware',
      weight_kg: 2.5,
      dimensions: { length: 30, width: 20, height: 5, unit: 'cm' },
      unit_price: 45.00,
      cost_price: 25.00,
      reorder_level: 50
    });

    const sku2 = await SKU.create({
      sku: 'SKU-002',
      description: 'Cotton Bath Towel Set - 6 pieces',
      hs_code: '630260',
      uom: 'SET',
      category: 'Textiles',
      weight_kg: 1.8,
      dimensions: { length: 40, width: 30, height: 10, unit: 'cm' },
      unit_price: 32.00,
      cost_price: 18.00,
      reorder_level: 100
    });

    const sku3 = await SKU.create({
      sku: 'SKU-003',
      description: 'LED Desk Lamp - Adjustable',
      hs_code: '940520',
      uom: 'PCS',
      category: 'Lighting',
      weight_kg: 0.8,
      dimensions: { length: 35, width: 15, height: 10, unit: 'cm' },
      unit_price: 28.50,
      cost_price: 15.00,
      reorder_level: 75
    });

    const sku4 = await SKU.create({
      sku: 'SKU-004',
      description: 'Ceramic Coffee Mug Set - 4 pieces',
      hs_code: '691110',
      uom: 'SET',
      category: 'Kitchenware',
      weight_kg: 1.2,
      dimensions: { length: 25, width: 20, height: 12, unit: 'cm' },
      unit_price: 22.00,
      cost_price: 12.00,
      reorder_level: 150
    });

    console.log('✓ SKUs created');

    // Create Inventory (using _id for relationships)
    await Inventory.create({
      sku_id: sku1._id,
      warehouse_id: warehouse1._id,
      qty_available: 500,
      qty_reserved: 0,
      bin_location: 'A-01-05'
    });

    await Inventory.create({
      sku_id: sku2._id,
      warehouse_id: warehouse1._id,
      qty_available: 750,
      qty_reserved: 0,
      bin_location: 'B-02-10'
    });

    await Inventory.create({
      sku_id: sku3._id,
      warehouse_id: warehouse2._id,
      qty_available: 300,
      qty_reserved: 0,
      bin_location: 'C-03-15'
    });

    await Inventory.create({
      sku_id: sku4._id,
      warehouse_id: warehouse1._id,
      qty_available: 1000,
      qty_reserved: 0,
      bin_location: 'A-04-20'
    });

    console.log('✓ Inventory created');

    // Create Sample Order 1 (calculate totals in create object)
    const totalAmount1 = (100 * 45.00) + (50 * 28.50);
    const taxAmount1 = totalAmount1 * 0.18;
    const grandTotal1 = totalAmount1 + taxAmount1;

    const order1 = await Order.create({
      buyer_id: buyer1._id,
      incoterm: 'FOB',
      currency: 'USD',
      status: 'confirmed',
      expected_ship_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      shipping_address: '123 Oxford Street, London W1D 1BS, United Kingdom',
      billing_address: '123 Oxford Street, London W1D 1BS, United Kingdom',
      port_of_loading: 'Newark, NJ',
      port_of_discharge: 'Southampton, UK',
      created_by: admin._id,
      total_amount: totalAmount1,
      tax_amount: taxAmount1,
      grand_total: grandTotal1
    });

    await OrderItem.create({
      order_id: order1._id,
      sku_id: sku1._id,
      sku_code: sku1.sku,
      description: sku1.description,
      hs_code: sku1.hs_code,
      qty: 100,
      unit_price: 45.00,
      weight_kg: sku1.weight_kg
    });

    await OrderItem.create({
      order_id: order1._id,
      sku_id: sku3._id,
      sku_code: sku3.sku,
      description: sku3.description,
      hs_code: sku3.hs_code,
      qty: 50,
      unit_price: 28.50,
      weight_kg: sku3.weight_kg
    });

    console.log('✓ Sample order created');

    // Create Draft Order 2 (calculate totals in create object)
    const totalAmount2 = 200 * 32.00;
    const taxAmount2 = totalAmount2 * 0.18;
    const grandTotal2 = totalAmount2 + taxAmount2;

    const order2 = await Order.create({
      buyer_id: buyer2._id,
      incoterm: 'CIF',
      currency: 'EUR',
      status: 'draft',
      expected_ship_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      port_of_loading: 'Los Angeles, CA',
      port_of_discharge: 'Hamburg, Germany',
      created_by: manager._id,
      total_amount: totalAmount2,
      tax_amount: taxAmount2,
      grand_total: grandTotal2
    });

    await OrderItem.create({
      order_id: order2._id,
      sku_id: sku2._id,
      sku_code: sku2.sku,
      description: sku2.description,
      hs_code: sku2.hs_code,
      qty: 200,
      unit_price: 32.00,
      weight_kg: sku2.weight_kg
    });

    console.log('✓ Draft order created');

    // Create Compliance Rules
    await ComplianceRule.create({
      country: 'United Kingdom',
      hs_code: null,
      rule_type: 'general',
      description: 'All imports require valid commercial invoice and packing list',
      required_documents: ['commercial_invoice', 'packing_list'],
      duty_rate: 0,
      is_active: true
    });

    await ComplianceRule.create({
      country: 'Germany',
      hs_code: '821510',
      rule_type: 'certificate_required',
      description: 'Cutlery imports require CE marking certification',
      required_documents: ['commercial_invoice', 'packing_list', 'ce_certificate'],
      duty_rate: 2.5,
      is_active: true
    });

    await ComplianceRule.create({
      country: 'United States',
      hs_code: '630260',
      rule_type: 'textile_declaration',
      description: 'Textile products require country of origin labeling',
      required_documents: ['commercial_invoice', 'packing_list', 'textile_declaration'],
      duty_rate: 8.3,
      is_active: true
    });

    console.log('✓ Compliance rules created');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin:   admin@exportsuite.com / admin123');
    console.log('  Manager: manager@exportsuite.com / manager123');
    console.log('  Clerk:   clerk@exportsuite.com / clerk123');
    console.log('  Buyer:   buyer@importco.com / buyer123');
    console.log('\n📦 Sample Data Created:');
    console.log('  - 2 Buyers');
    console.log('  - 2 Warehouses');
    console.log('  - 4 SKUs with inventory');
    console.log('  - 2 Sample orders (1 confirmed, 1 draft)');
    console.log('  - 3 Compliance rules');

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
