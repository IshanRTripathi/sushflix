const crypto = require('crypto');

const generateContentKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

const encryptContent = (content, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  
  let encrypted = cipher.update(content);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return {
    iv: iv.toString('hex'),
    encryptedContent: encrypted.toString('hex')
  };
};

const decryptContent = (encryptedData, key) => {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(key, 'hex'),
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  let decrypted = decipher.update(Buffer.from(encryptedData.encryptedContent, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted;
};

const addWatermark = (content, userId) => {
  // Implementation depends on content type (image/video)
  // This is a placeholder for the actual watermarking logic
  return {
    ...content,
    watermark: {
      userId,
      timestamp: new Date().toISOString()
    }
  };
};

module.exports = {
  generateContentKey,
  encryptContent,
  decryptContent,
  addWatermark
};