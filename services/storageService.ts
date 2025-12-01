import { supabase } from "./supabase";
import { FileAttachment } from "../types";

// Max file size: 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  'application/zip',
  'application/x-zip-compressed'
];

export const ALLOWED_EXTENSIONS = [
  '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.md', '.zip'
];

interface UploadResult {
  success: boolean;
  attachment?: FileAttachment;
  error?: string;
}

interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

/**
 * Validate file before upload
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
    };
  }

  // Check file type
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return { 
      valid: false, 
      error: `File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` 
    };
  }

  return { valid: true };
};

/**
 * Generate a unique file path for storage
 */
const generateFilePath = (uid: string, assignmentId: string, fileName: string): string => {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${uid}/${assignmentId}/${timestamp}_${sanitizedName}`;
};

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (
  uid: string,
  assignmentId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const filePath = generateFilePath(uid, assignmentId, file.name);
    
    // Simulate progress start
    if (onProgress) {
      onProgress({ progress: 10, bytesTransferred: 0, totalBytes: file.size });
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('assignments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { success: false, error: error.message };
    }

    // Update progress
    if (onProgress) {
      onProgress({ progress: 80, bytesTransferred: file.size, totalBytes: file.size });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('assignments')
      .getPublicUrl(filePath);

    if (onProgress) {
      onProgress({ progress: 100, bytesTransferred: file.size, totalBytes: file.size });
    }

    const attachment: FileAttachment = {
      id: crypto.randomUUID(),
      name: file.name,
      url: urlData.publicUrl,
      storagePath: filePath,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    };

    return { success: true, attachment };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { success: false, error: error.message || 'Upload failed' };
  }
};

/**
 * Delete a file from Supabase Storage
 */
export const deleteFile = async (storagePath: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage
      .from('assignments')
      .remove([storagePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Delete error:', error);
    return { success: false, error: error.message || 'Delete failed' };
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file icon based on type
 */
export const getFileTypeIcon = (type: string): string => {
  if (type.includes('pdf')) return '📄';
  if (type.includes('image')) return '🖼️';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
  if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
  if (type.includes('zip')) return '📦';
  if (type.includes('text')) return '📃';
  return '📎';
};
