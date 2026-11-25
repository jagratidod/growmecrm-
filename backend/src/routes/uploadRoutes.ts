import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadBufferToCloudinary } from '../utils/cloudinary';

const router = Router();

// Store file in memory buffer so it can be streamed straight to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

// POST /api/upload/image
router.post(
  '/image',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }

      const folderName = req.body.folder || 'growme_crm/general';
      const cdnUrl = await uploadBufferToCloudinary(req.file.buffer, folderName);

      if (!cdnUrl) {
        res.status(500).json({ error: 'Failed to retrieve Cloudinary secure URL' });
        return;
      }

      console.log(`[Cloudinary Success] Uploaded file to: ${cdnUrl}`);

      res.status(200).json({
        message: 'Image uploaded to Cloudinary successfully',
        url: cdnUrl,
        size: req.file.size,
        mimeType: req.file.mimetype,
      });
    } catch (error: any) {
      console.error('[Upload Route Error]:', error);
      res.status(500).json({
        error: error.message || 'Error uploading image to Cloudinary',
      });
    }
  }
);

export default router;
