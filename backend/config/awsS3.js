import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === 'true';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

/**
 * Upload file to S3 or local storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name
 * @param {string} mimeType - MIME type
 * @param {string} folder - Folder name (e.g., 'invoices', 'documents')
 * @returns {Promise<string>} - File URL
 */
export const uploadFile = async (fileBuffer, fileName, mimeType, folder = 'documents') => {
  if (USE_LOCAL_STORAGE) {
    // Local storage fallback
    const uploadDir = path.join(process.cwd(), 'uploads', folder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, fileBuffer);

    return `/uploads/${folder}/${fileName}`;
  } else {
    // S3 upload
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${folder}/${fileName}`,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    return result.Location;
  }
};

/**
 * Delete file from S3 or local storage
 * @param {string} fileUrl - File URL
 * @returns {Promise<boolean>}
 */
export const deleteFile = async (fileUrl) => {
  if (USE_LOCAL_STORAGE) {
    const filePath = path.join(process.cwd(), fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } else {
    const key = fileUrl.split('.com/')[1];
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };
    await s3.deleteObject(params).promise();
    return true;
  }
};

/**
 * Generate signed URL for temporary access
 * @param {string} fileKey - S3 file key
 * @param {number} expiresIn - Expiration in seconds (default 1 hour)
 * @returns {string}
 */
export const getSignedUrl = (fileKey, expiresIn = 3600) => {
  if (USE_LOCAL_STORAGE) {
    return fileKey; // Return local path as-is
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileKey,
    Expires: expiresIn
  };

  return s3.getSignedUrl('getObject', params);
};

export default { uploadFile, deleteFile, getSignedUrl };
