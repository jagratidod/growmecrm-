/**
 * Centralized Image Upload Service for GrowMe CRM
 * Uploads images directly to Cloudinary via backend stream API
 */

// Helper: Client-side fallback compression if backend API is unreachable
const compressFallback = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const uploadService = {
  /**
   * Upload an image file to Cloudinary
   * @param file - The File object from file input
   * @param folder - Cloudinary subfolder (e.g. 'hotels', 'packages', 'logos')
   * @returns The secure HTTPS Cloudinary URL
   */
  async uploadImage(file: File, folder: string = 'hotels'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `growme_crm/${folder}`);

      const token = localStorage.getItem('crm_auth_token') || sessionStorage.getItem('crm_auth_token');

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data?.url) {
        return data.url;
      }
      throw new Error(data?.error || 'No URL returned from upload server');
    } catch (err) {
      console.warn('[Cloudinary API fallback]: Uploading via client compressor:', err);
      return compressFallback(file);
    }
  },
};
