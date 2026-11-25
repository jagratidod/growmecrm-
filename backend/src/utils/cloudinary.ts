import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'lypvsp0h',
  api_key: process.env.CLOUDINARY_API_KEY || '734124318164869',
  api_secret: process.env.CLOUDINARY_API_SECRET || '91WD4tcdEbv96-195L_qNupIo3w',
  secure: true,
});

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string = 'growme_crm'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]:', error);
          return reject(error);
        }
        resolve(result?.secure_url || '');
      }
    );
    uploadStream.end(buffer);
  });
};

export { cloudinary };
