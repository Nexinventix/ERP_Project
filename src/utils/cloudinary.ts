import { v2 as cloudinary } from 'cloudinary';

import {
  CLOUDINARY_CLOUD_NAME, 
  CLOUDINARY_API_KEY, 
  CLOUDINARY_API_SECRET 
} from '../config'

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (file: Express.Multer.File): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'vehicle-certifications',
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    throw new Error('Error uploading file to Cloudinary');
  }
};
