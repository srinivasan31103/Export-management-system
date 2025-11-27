import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';

/**
 * Generate Commercial Invoice PDF
 */
export const generateCommercialInvoice = async (order) => {
  const template = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 24px; }
    .info-section { margin-bottom: 20px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .info-box { width: 48%; padding: 10px; border: 1px solid #ddd; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
    .totals { margin-top: 20px; text-align: right; }
    .totals div { margin: 5px 0; }
    .grand-total { font-size: 18px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>COMMERCIAL INVOICE</h1>
    <p>Invoice No: {{orderNo}}</p>
    <p>Date: {{date}}</p>
  </div>

  <div class="info-row">
    <div class="info-box">
      <strong>Exporter:</strong><br>
      ExportSuite Inc.<br>
      123 Export Street<br>
      Trade City, TC 12345<br>
      USA
    </div>
    <div class="info-box">
      <strong>Consignee:</strong><br>
      {{buyer.name}}<br>
      {{buyer.companyName}}<br>
      {{buyer.address}}<br>
      {{buyer.city}}, {{buyer.country}}
    </div>
  </div>

  <div class="info-section">
    <strong>Shipping Details:</strong><br>
    Incoterm: {{incoterm}}<br>
    Port of Loading: {{portOfLoading}}<br>
    Port of Discharge: {{portOfDischarge}}
  </div>

  <table>
    <thead>
      <tr>
        <th>S.No</th>
        <th>Description</th>
        <th>HS Code</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{inc @index}}</td>
        <td>{{description}}</td>
        <td>{{hsCode}}</td>
        <td>{{qty}}</td>
        <td>{{currency}} {{unitPrice}}</td>
        <td>{{currency}} {{lineTotal}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="totals">
    <div>Subtotal: {{currency}} {{totalAmount}}</div>
    <div>Tax: {{currency}} {{taxAmount}}</div>
    <div class="grand-total">Grand Total: {{currency}} {{grandTotal}}</div>
  </div>

  <div style="margin-top: 40px;">
    <p>Certified that the goods described above are of {{buyer.country}} origin.</p>
    <br>
    <p>_______________________</p>
    <p>Authorized Signature</p>
  </div>
</body>
</html>
  `;

  Handlebars.registerHelper('inc', function(value) {
    return parseInt(value) + 1;
  });

  const compiledTemplate = Handlebars.compile(template);
  const html = compiledTemplate({
    orderNo: order.order_no,
    date: new Date().toLocaleDateString(),
    buyer: {
      name: order.buyer?.name,
      companyName: order.buyer?.company_name,
      address: order.buyer?.address,
      city: order.buyer?.city,
      country: order.buyer?.country
    },
    incoterm: order.incoterm,
    portOfLoading: order.port_of_loading || 'TBD',
    portOfDischarge: order.port_of_discharge || 'TBD',
    items: order.items?.map(item => ({
      description: item.description,
      hsCode: item.hs_code || 'N/A',
      qty: item.qty,
      unitPrice: parseFloat(item.unit_price).toFixed(2),
      currency: order.currency,
      lineTotal: parseFloat(item.line_total).toFixed(2)
    })),
    currency: order.currency,
    totalAmount: parseFloat(order.total_amount).toFixed(2),
    taxAmount: parseFloat(order.tax_amount).toFixed(2),
    grandTotal: parseFloat(order.grand_total).toFixed(2)
  });

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return pdfBuffer;
};

/**
 * Generate Packing List PDF
 */
export const generatePackingList = async (order) => {
  const template = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
  </style>
</head>
<body>
  <div class="header">
    <h1>PACKING LIST</h1>
    <p>Order No: {{orderNo}}</p>
    <p>Date: {{date}}</p>
  </div>

  <p><strong>Consignee:</strong> {{buyer.name}}, {{buyer.country}}</p>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Description</th>
        <th>Quantity</th>
        <th>Weight (kg)</th>
        <th>Total Weight (kg)</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{inc @index}}</td>
        <td>{{description}}</td>
        <td>{{qty}}</td>
        <td>{{weightKg}}</td>
        <td>{{totalWeight}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <p style="margin-top: 20px;"><strong>Total Packages:</strong> {{packageCount}}</p>
  <p><strong>Total Gross Weight:</strong> {{totalGrossWeight}} kg</p>
</body>
</html>
  `;

  Handlebars.registerHelper('inc', function(value) {
    return parseInt(value) + 1;
  });

  const compiledTemplate = Handlebars.compile(template);
  const html = compiledTemplate({
    orderNo: order.order_no,
    date: new Date().toLocaleDateString(),
    buyer: {
      name: order.buyer?.name,
      country: order.buyer?.country
    },
    items: order.items?.map(item => ({
      description: item.description,
      qty: item.qty,
      weightKg: item.weight_kg || 1,
      totalWeight: ((item.weight_kg || 1) * item.qty).toFixed(2)
    })),
    packageCount: order.items?.length || 0,
    totalGrossWeight: order.items?.reduce((sum, item) => sum + ((item.weight_kg || 1) * item.qty), 0).toFixed(2)
  });

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return pdfBuffer;
};

/**
 * Generate Certificate of Origin PDF
 */
export const generateCertificateOfOrigin = async (order) => {
  const template = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 30px; border: 2px solid #000; padding: 20px; }
    .header h1 { margin: 0; font-size: 28px; }
    .section { margin: 20px 0; padding: 15px; border: 1px solid #999; }
    .signature { margin-top: 60px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CERTIFICATE OF ORIGIN</h1>
    <p>Non-Preferential</p>
  </div>

  <div class="section">
    <strong>1. Exporter:</strong><br>
    ExportSuite Inc., 123 Export Street, Trade City, USA
  </div>

  <div class="section">
    <strong>2. Consignee:</strong><br>
    {{buyer.name}}<br>
    {{buyer.companyName}}<br>
    {{buyer.address}}, {{buyer.city}}, {{buyer.country}}
  </div>

  <div class="section">
    <strong>3. Country of Origin:</strong> United States of America
  </div>

  <div class="section">
    <strong>4. Country of Destination:</strong> {{buyer.country}}
  </div>

  <div class="section">
    <strong>5. Goods Description:</strong><br>
    {{#each items}}
    - {{description}} (Qty: {{qty}}, HS Code: {{hsCode}})<br>
    {{/each}}
  </div>

  <div class="section">
    <strong>6. Invoice Number and Date:</strong> {{orderNo}}, {{date}}
  </div>

  <div class="signature">
    <p><strong>Declaration:</strong></p>
    <p>We hereby certify that the goods described above originated in the United States of America.</p>
    <br><br>
    <p>_______________________</p>
    <p>Place and Date of Issue</p>
    <br>
    <p>_______________________</p>
    <p>Signature and Stamp</p>
  </div>
</body>
</html>
  `;

  const compiledTemplate = Handlebars.compile(template);
  const html = compiledTemplate({
    orderNo: order.order_no,
    date: new Date().toLocaleDateString(),
    buyer: {
      name: order.buyer?.name,
      companyName: order.buyer?.company_name,
      address: order.buyer?.address,
      city: order.buyer?.city,
      country: order.buyer?.country
    },
    items: order.items?.map(item => ({
      description: item.description,
      qty: item.qty,
      hsCode: item.hs_code || 'N/A'
    }))
  });

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return pdfBuffer;
};

/**
 * Generate Bill of Lading PDF
 */
export const generateBillOfLading = async (shipment) => {
  const template = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 24px; }
    .section { margin: 15px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
  </style>
</head>
<body>
  <div class="header">
    <h1>BILL OF LADING</h1>
    <p>B/L Number: {{awbBlNumber}}</p>
    <p>Shipment No: {{shipmentNo}}</p>
  </div>

  <div class="section">
    <strong>Shipper:</strong> ExportSuite Inc., 123 Export Street, USA
  </div>

  <div class="section">
    <strong>Consignee:</strong> {{buyer.name}}, {{buyer.country}}
  </div>

  <div class="section">
    <strong>Carrier:</strong> {{carrier}}<br>
    <strong>Vessel/Flight:</strong> {{carrierService}}<br>
    <strong>Container No:</strong> {{containerNo}}<br>
    <strong>Seal No:</strong> {{sealNo}}
  </div>

  <div class="section">
    <strong>Port of Loading:</strong> {{portOfLoading}}<br>
    <strong>Port of Discharge:</strong> {{portOfDischarge}}
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantity</th>
        <th>Weight (kg)</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{description}}</td>
        <td>{{qty}}</td>
        <td>{{totalWeight}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="section">
    <strong>Total Weight:</strong> {{totalWeightKg}} kg<br>
    <strong>Total Volume:</strong> {{totalVolumeCbm}} CBM
  </div>

  <div style="margin-top: 60px;">
    <p>_______________________</p>
    <p>Carrier's Signature</p>
  </div>
</body>
</html>
  `;

  const compiledTemplate = Handlebars.compile(template);
  const html = compiledTemplate({
    awbBlNumber: shipment.awb_bl_number || 'TBD',
    shipmentNo: shipment.shipment_no,
    buyer: {
      name: shipment.order?.buyer?.name,
      country: shipment.order?.buyer?.country
    },
    carrier: shipment.carrier,
    carrierService: shipment.carrier_service || 'Standard',
    containerNo: shipment.container_no || 'N/A',
    sealNo: shipment.seal_no || 'N/A',
    portOfLoading: shipment.port_of_loading,
    portOfDischarge: shipment.port_of_discharge,
    items: shipment.order?.items?.map(item => ({
      description: item.description,
      qty: item.qty,
      totalWeight: ((item.weight_kg || 1) * item.qty).toFixed(2)
    })),
    totalWeightKg: shipment.total_weight_kg || 0,
    totalVolumeCbm: shipment.total_volume_cbm || 0
  });

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return pdfBuffer;
};

export default {
  generateCommercialInvoice,
  generatePackingList,
  generateCertificateOfOrigin,
  generateBillOfLading
};
