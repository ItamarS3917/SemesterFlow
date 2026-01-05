import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileText,
  Loader2,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { FileAttachment } from '../types';
import {
  uploadFile,
  deleteFile,
  validateFile,
  formatFileSize,
  getFileTypeIcon,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
} from '../services/storageService';

interface FileUploadProps {
  uid: string;
  assignmentId: string;
  files: FileAttachment[];
  onFilesChange: (files: FileAttachment[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  uid,
  assignmentId,
  files,
  onFilesChange,
  maxFiles = 5,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const filesToUpload = Array.from(selectedFiles);
    const remainingSlots = maxFiles - files.length;

    if (filesToUpload.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more file(s). Maximum is ${maxFiles}.`);
      return;
    }

    // Add files to uploading state
    const uploadingFiles: UploadingFile[] = filesToUpload.map((file) => ({
      file,
      progress: 0,
    }));
    setUploading(uploadingFiles);

    // Upload each file
    const newFiles: FileAttachment[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];

      // Validate first
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploading((prev) =>
          prev.map((u, idx) => (idx === i ? { ...u, error: validation.error } : u))
        );
        continue;
      }

      // Upload with progress tracking
      const result = await uploadFile(uid, assignmentId, file, (progress) => {
        setUploading((prev) =>
          prev.map((u, idx) => (idx === i ? { ...u, progress: progress.progress } : u))
        );
      });

      if (result.success && result.attachment) {
        newFiles.push(result.attachment);
        setUploading((prev) => prev.map((u, idx) => (idx === i ? { ...u, progress: 100 } : u)));
      } else {
        setUploading((prev) =>
          prev.map((u, idx) => (idx === i ? { ...u, error: result.error || 'Upload failed' } : u))
        );
      }
    }

    // Update files list
    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }

    // Clear uploading state after a delay
    setTimeout(() => {
      setUploading([]);
    }, 2000);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (fileToDelete: FileAttachment) => {
    const result = await deleteFile(fileToDelete.storagePath);

    if (result.success) {
      onFilesChange(files.filter((f) => f.id !== fileToDelete.id));
    } else {
      alert('Failed to delete file: ' + result.error);
    }

    setDeleteConfirm(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-green-400" />
          <label className="text-sm font-bold text-white font-mono uppercase">
            Files ({files.length}/{maxFiles})
          </label>
        </div>
      </div>

      {/* Info Notice */}
      <div className="retro-card bg-gray-800/50 p-3 border-green-500/30">
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-400 font-mono">
            <p className="text-green-400 font-bold mb-1">Supabase Storage (1GB Free)</p>
            <p>
              Max {MAX_FILE_SIZE / 1024 / 1024}MB per file •{' '}
              {ALLOWED_EXTENSIONS.slice(0, 6).join(', ')}...
            </p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      {files.length < maxFiles && !disabled && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            retro-card p-6 text-center cursor-pointer transition-all
            ${
              dragOver
                ? 'border-green-400 bg-green-900/20'
                : 'border-gray-600 hover:border-green-500 bg-gray-800/50'
            }
          `}
        >
          <Upload
            className={`w-8 h-8 mx-auto mb-2 ${dragOver ? 'text-green-400' : 'text-gray-500'}`}
          />
          <p className="text-sm text-gray-300 font-mono">
            {dragOver ? 'Drop files here' : 'Drag & drop files or click to browse'}
          </p>
          <p className="text-xs text-gray-500 font-mono mt-1">
            PDF, Images, Documents, Spreadsheets, ZIP
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_EXTENSIONS.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {/* Uploading Files */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((item, index) => (
            <div key={index} className="retro-card bg-gray-800 p-3 border-yellow-500/50">
              <div className="flex items-center gap-3">
                {item.error ? (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                ) : item.progress === 100 ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <Loader2 className="w-5 h-5 text-yellow-400 animate-spin flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-mono truncate">{item.file.name}</p>
                  {item.error ? (
                    <p className="text-red-400 text-xs font-mono">{item.error}</p>
                  ) : (
                    <div className="mt-1">
                      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <p className="text-gray-400 text-xs font-mono mt-1">
                        {Math.round(item.progress)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="retro-card bg-gray-800 p-3 flex items-center justify-between group hover:border-green-500 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl">{getFileTypeIcon(file.type)}</span>

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-mono font-bold truncate">{file.name}</p>
                  <p className="text-gray-500 text-xs font-mono">
                    {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="retro-btn bg-gray-700 text-white hover:bg-green-600 px-3 py-1 text-xs flex items-center gap-1"
                  title="Download file"
                >
                  <Download className="w-3 h-3" />
                  Open
                </a>

                {deleteConfirm === file.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(file)}
                      className="retro-btn bg-red-600 text-white hover:bg-red-700 px-2 py-1 text-xs"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="retro-btn bg-gray-600 text-white hover:bg-gray-700 px-2 py-1 text-xs"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(file.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Delete file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && uploading.length === 0 && (
        <div className="text-center py-4 text-gray-500 font-mono text-sm">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No files uploaded yet</p>
        </div>
      )}
    </div>
  );
};
