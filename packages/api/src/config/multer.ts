// ============================================
// Multer Configuration — Avatar Upload
// In-memory storage, file type + size limits
// ============================================

import multer from 'multer';
import { AppError } from '../middleware/errorHandler.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export const avatarUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
        files: 1,
    },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError(400, 'INVALID_FILE_TYPE', 'Please upload a JPG, PNG, or WebP image'));
        }
    },
});
