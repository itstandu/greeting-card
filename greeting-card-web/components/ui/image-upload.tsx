'use client';

import { useRef, useState } from 'react';
import { Button } from './button';
import { Progress } from './progress';
import { SafeImage } from './safe-image';
import { cn } from '@/lib/utils';
import * as uploadService from '@/services/upload.service';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

type ImageUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  folder?: 'products' | 'categories' | 'users' | 'reviews' | 'general';
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
};

export function ImageUpload({
  value,
  onChange,
  folder = 'general',
  maxSizeMB = 10,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview with value prop
  const preview = value || null;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error(`Kích thước file không được vượt quá ${maxSizeMB}MB`);
      return;
    }

    // Upload to Cloudinary
    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress (Cloudinary doesn't provide real-time progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadService.uploadFile(file, folder);
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.data?.url) {
        onChange(result.data.url);
        toast.success('Upload hình ảnh thành công');
      } else {
        throw new Error('Không nhận được URL từ server');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload thất bại';
      toast.error(message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {preview ? (
        <div className="group relative">
          <div className="border-border bg-muted relative aspect-video w-full overflow-hidden rounded-lg border">
            <SafeImage src={preview} alt="Preview" className="h-full w-full" />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  disabled={uploading}
                >
                  <X className="mr-2 h-4 w-4" />
                  Xóa
                </Button>
              </div>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
              <div className="w-full max-w-xs space-y-2 p-4">
                <Progress value={uploadProgress} />
                <p className="text-center text-sm text-white">Đang upload... {uploadProgress}%</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={cn(
            'border-border bg-muted/50 relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
            disabled || uploading
              ? 'cursor-not-allowed opacity-50'
              : 'hover:border-primary hover:bg-muted',
          )}
        >
          {uploading ? (
            <div className="w-full space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-muted-foreground text-center text-sm">
                Đang upload... {uploadProgress}%
              </p>
            </div>
          ) : (
            <>
              <ImageIcon className="text-muted-foreground mb-4 h-12 w-12" />
              <div className="text-center">
                <p className="text-foreground text-sm font-medium">Click để chọn hình ảnh</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  PNG, JPG, GIF tối đa {maxSizeMB}MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {!preview && !uploading && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          Chọn hình ảnh
        </Button>
      )}
    </div>
  );
}
