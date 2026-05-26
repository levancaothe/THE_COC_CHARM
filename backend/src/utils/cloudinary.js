const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUD_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUD_KEY_SECRET || process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const isCloudinaryUrl = (value = '') => {
  if (typeof value !== 'string') return false;
  return value.includes('res.cloudinary.com');
};

const uploadImageToCloudinary = async (imageUrl, options = {}) => {
  if (!imageUrl) {
    throw new Error('Image URL is required');
  }

  if (isCloudinaryUrl(imageUrl)) {
    return imageUrl;
  }

  const result = await cloudinary.uploader.upload(imageUrl, {
    resource_type: 'image',
    folder: options.folder || 'the_coc_charm/charms',
    overwrite: true
  });

  return result.secure_url || result.url;
};

module.exports = {
  cloudinary,
  uploadImageToCloudinary,
  isCloudinaryUrl
};
