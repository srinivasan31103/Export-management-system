/**
 * HS Code utilities and validation
 */

/**
 * Validate HS code format
 * @param {string} hsCode
 * @returns {boolean}
 */
export const validateHSCode = (hsCode) => {
  if (!hsCode) return false;

  // HS codes are typically 6-10 digits
  const cleanCode = hsCode.replace(/[^0-9]/g, '');
  return cleanCode.length >= 6 && cleanCode.length <= 10;
};

/**
 * Format HS code with dots (e.g., 8517.12.00)
 * @param {string} hsCode
 * @returns {string}
 */
export const formatHSCode = (hsCode) => {
  if (!hsCode) return '';

  const cleanCode = hsCode.replace(/[^0-9]/g, '');

  if (cleanCode.length < 6) return cleanCode;

  // Format as XX.XX.XX or XXXX.XX.XX
  if (cleanCode.length === 6) {
    return `${cleanCode.slice(0, 2)}.${cleanCode.slice(2, 4)}.${cleanCode.slice(4, 6)}`;
  } else if (cleanCode.length === 8) {
    return `${cleanCode.slice(0, 4)}.${cleanCode.slice(4, 6)}.${cleanCode.slice(6, 8)}`;
  } else if (cleanCode.length === 10) {
    return `${cleanCode.slice(0, 4)}.${cleanCode.slice(4, 6)}.${cleanCode.slice(6, 8)}.${cleanCode.slice(8, 10)}`;
  }

  return cleanCode;
};

/**
 * Get HS code chapter description
 * @param {string} hsCode
 * @returns {string}
 */
export const getHSChapterDescription = (hsCode) => {
  if (!hsCode) return 'Unknown';

  const chapter = hsCode.substring(0, 2);

  const chapters = {
    '01': 'Live animals',
    '02': 'Meat and edible meat offal',
    '03': 'Fish and crustaceans',
    '04': 'Dairy produce',
    '08': 'Edible fruit and nuts',
    '09': 'Coffee, tea, spices',
    '20': 'Preparations of vegetables, fruit, nuts',
    '30': 'Pharmaceutical products',
    '39': 'Plastics and articles thereof',
    '40': 'Rubber and articles thereof',
    '42': 'Articles of leather',
    '61': 'Clothing and accessories, knitted',
    '62': 'Clothing and accessories, not knitted',
    '63': 'Other made-up textile articles',
    '64': 'Footwear',
    '73': 'Articles of iron or steel',
    '82': 'Tools, cutlery, spoons and forks',
    '84': 'Machinery and mechanical appliances',
    '85': 'Electrical machinery and equipment',
    '87': 'Vehicles',
    '90': 'Optical, measuring, medical instruments',
    '94': 'Furniture; bedding; lamps',
    '95': 'Toys, games and sports equipment'
  };

  return chapters[chapter] || 'Other';
};

export default {
  validateHSCode,
  formatHSCode,
  getHSChapterDescription
};
