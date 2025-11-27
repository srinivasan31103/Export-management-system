import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

const MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

/**
 * Classify product description to HS code using Claude AI
 *
 * Prompt: "You are a customs classification assistant. Given product description:
 * '{description}' return the most likely HS code (6-digit), 2 short reasons,
 * and a confidence score (0-100). Output JSON format."
 *
 * @param {string} description - Product description
 * @returns {Promise<{hsCode: string, reasons: string[], confidence: number}>}
 */
export const classifyHSCode = async (description) => {
  try {
    const prompt = `You are a customs classification assistant specializing in HS (Harmonized System) codes.

Given the following product description: "${description}"

Please provide:
1. The most likely 6-digit HS code
2. Two short reasons why this classification is appropriate
3. A confidence score from 0-100

Return your response in the following JSON format only (no additional text):
{
  "hsCode": "123456",
  "reasons": ["reason 1", "reason 2"],
  "confidence": 85
}`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].text;

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return result;
    }

    // Fallback if JSON parsing fails
    return {
      hsCode: 'N/A',
      reasons: ['Unable to classify - please provide more specific description'],
      confidence: 0
    };
  } catch (error) {
    console.error('Claude AI HS Classification Error:', error);
    throw new Error(`AI classification failed: ${error.message}`);
  }
};

/**
 * Generate document summary and identify missing fields
 *
 * @param {Object} order - Order object with items and buyer
 * @returns {Promise<{missingFields: string[], suggestions: string[], completeness: number}>}
 */
export const generateDocSummary = async (order) => {
  try {
    const prompt = `You are a trade documentation expert. Analyze this export order and identify missing or incomplete fields needed for export documentation.

Order Details:
- Order Number: ${order.order_no}
- Buyer: ${order.buyer?.name} (${order.buyer?.country})
- Incoterm: ${order.incoterm}
- Number of Items: ${order.items?.length}
- Has HS Codes: ${order.items?.filter(i => i.hs_code).length}/${order.items?.length}
- Shipping Address: ${order.shipping_address ? 'Yes' : 'No'}
- Port of Loading: ${order.port_of_loading || 'Not specified'}
- Port of Discharge: ${order.port_of_discharge || 'Not specified'}

Items:
${order.items?.map(item => `- ${item.description} (Qty: ${item.qty}, HS: ${item.hs_code || 'Missing'})`).join('\n')}

Analyze this order and return ONLY a JSON object with:
{
  "missingFields": ["list of missing critical fields"],
  "suggestions": ["actionable suggestions to complete the order"],
  "completeness": 75
}`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      missingFields: [],
      suggestions: [],
      completeness: 100
    };
  } catch (error) {
    console.error('Claude AI Doc Summary Error:', error);
    throw new Error(`AI doc summary failed: ${error.message}`);
  }
};

/**
 * Generate business insights from orders
 *
 * @param {Array} orders - Array of order objects
 * @param {string} timeframe - Timeframe for analysis
 * @returns {Promise<{topCountries: string[], insights: string[], recommendations: string[]}>}
 */
export const generateBusinessInsights = async (orders, timeframe) => {
  try {
    // Prepare data summary
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.grand_total || 0), 0);

    const countryCounts = {};
    orders.forEach(order => {
      const country = order.buyer?.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country, count]) => `${country} (${count} orders)`);

    const prompt = `You are a business analyst for an export company. Analyze this export data and provide insights.

Summary for ${timeframe}:
- Total Orders: ${totalOrders}
- Total Revenue: $${totalRevenue.toFixed(2)}
- Average Order Value: $${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0}
- Top Countries: ${topCountries.join(', ')}

Provide ONLY a JSON object with:
{
  "topCountries": ["top 3 countries by revenue"],
  "insights": ["key insight 1", "key insight 2", "key insight 3"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2"]
}`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      topCountries: topCountries.slice(0, 3),
      insights: ['Insufficient data for AI analysis'],
      recommendations: []
    };
  } catch (error) {
    console.error('Claude AI Business Insights Error:', error);
    throw new Error(`AI insights failed: ${error.message}`);
  }
};

export default {
  classifyHSCode,
  generateDocSummary,
  generateBusinessInsights
};
