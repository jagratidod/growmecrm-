import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Request, Response } from 'express';
import { CloudCredentials, isClientImage } from './connections';

const websiteImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
}).single('file');

export function readWebsiteImage(req: Request, res: Response) {
  return new Promise<Express.Multer.File | undefined>((resolve, reject) => {
    websiteImageUpload(req, res, (error) => error ? reject(error) : resolve(req.file));
  });
}

export async function uploadWebsiteImage(
  file: Express.Multer.File | undefined,
  { cloudName, apiKey, apiSecret }: CloudCredentials,
  folder: string,
): Promise<string> {
  if (!file || !['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(file.mimetype)) {
    throw Object.assign(new Error('Choose a JPEG, PNG, WebP, GIF or AVIF image.'), { status: 400 });
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const form = new FormData();
  form.set('file', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname);
  form.set('folder', folder);
  form.set('timestamp', String(timestamp));
  form.set('api_key', apiKey);
  form.set('signature', cloudinary.utils.api_sign_request({ folder, timestamp }, apiSecret));
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST', body: form, signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error();
    const { secure_url } = await response.json() as { secure_url?: string };
    if (typeof secure_url !== 'string' || !secure_url || !isClientImage(secure_url, cloudName)) throw new Error();
    return secure_url;
  } catch {
    throw Object.assign(new Error('The client’s Cloudinary account could not upload this image.'), { status: 502 });
  }
}
