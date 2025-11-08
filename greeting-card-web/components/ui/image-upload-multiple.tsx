'use client';

import { useRef, useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Progress } from './progress';
import { SafeImage } from './safe-image';
import { cn } from '@/lib/utils';
import * as uploadService from '@/services/upload.service';
import type { ProductImageRequest } from '@/types';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { GripVertical, Image as ImageIcon, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

type ImageUploadMultipleProps = {
  value?: ProductImageRequest[];
  onChange: (images: ProductImageRequest[]) => void;
  folder?: 'products' | 'categories' | 'users' | 'reviews' | 'general';
  maxSizeMB?: number;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
  productId?: number; // Optional productId để tổ chức folder
};

export function ImageUploadMultiple({
  value = [],
  onChange,
  maxSizeMB = 10,
  maxFiles = 10,
  className,
  disabled = false,
  productId,
}: ImageUploadMultipleProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync previews with value prop
  const images = value || [];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file count
    const totalFiles = images.length + files.length;
    if (totalFiles > maxFiles) {
      toast.error(`Chỉ được upload tối đa ${maxFiles} hình ảnh`);
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} không phải là file hình ảnh`);
        continue;
      }

      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        toast.error(`${file.name} vượt quá ${maxSizeMB}MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Upload to Cloudinary
    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload files one by one to support productId
      const newImages: ProductImageRequest[] = [];
      for (const file of validFiles) {
        const result = await uploadService.uploadProductImage(file, productId);
        if (result.data?.url) {
          newImages.push({
            imageUrl: result.data.url,
            altText: '',
          });
        }
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages];
        onChange(updatedImages);
        toast.success(`Upload ${newImages.length} hình ảnh thành công`);
      } else {
        throw new Error('Không nhận được URL từ server');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload thất bại';
      toast.error(message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleAltTextChange = (index: number, altText: string) => {
    const newImages = [...images];
    newImages[index] = {
      ...newImages[index],
      altText: altText,
    };
    onChange(newImages);
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
    toast.success('Đã sắp xếp lại thứ tự hình ảnh');
  };

  return (
    <div className={cn('space-y-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {images.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {provided => (
              <div className="grid grid-cols-1">
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex gap-4 overflow-x-auto pb-2"
                >
                  {images.map((image, index) => (
                    <Draggable
                      key={`${image.imageUrl}-${index}`}
                      draggableId={`${image.imageUrl}-${index}`}
                      index={index}
                      isDragDisabled={disabled || uploading}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            'max-w-60 min-w-[180px] space-y-2',
                            snapshot.isDragging && 'opacity-50',
                          )}
                        >
                          <div className="group relative max-h-[300px]">
                            <div className="border-border bg-muted relative aspect-square max-h-[300px] w-auto overflow-hidden rounded-lg border shadow-sm hover:shadow-md">
                              <SafeImage
                                src={image.imageUrl}
                                alt={image.altText || `Preview ${index + 1}`}
                                className="h-full w-full"
                              />
                              {!disabled && (
                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="hover:bg-muted/10 cursor-grab rounded p-2 active:cursor-grabbing"
                                  >
                                    <GripVertical className="h-6 w-6 text-white" />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRemove(index)}
                                    disabled={uploading}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              {index === 0 && (
                                <div className="bg-primary text-primary-foreground absolute top-2 left-2 rounded px-2 py-1 text-xs font-medium">
                                  Chính
                                </div>
                              )}
                            </div>
                          </div>
                          <Input
                            type="text"
                            placeholder="Alt text cho hình ảnh (tùy chọn)"
                            value={image.altText || ''}
                            onChange={e => handleAltTextChange(index, e.target.value)}
                            disabled={disabled}
                            className="text-sm"
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-muted-foreground text-center text-sm">
            Đang upload... {uploadProgress}%
          </p>
        </div>
      )}

      {images.length < maxFiles && (
        <div
          onClick={handleClick}
          className={cn(
            'border-border bg-muted/50 relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
            disabled || uploading
              ? 'cursor-not-allowed opacity-50'
              : 'hover:border-primary hover:bg-muted',
          )}
        >
          <ImageIcon className="text-muted-foreground mb-2 h-10 w-10" />
          <div className="text-center">
            <p className="text-foreground text-sm font-medium">
              Click để chọn hình ảnh hoặc kéo thả để sắp xếp
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              PNG, JPG, GIF tối đa {maxSizeMB}MB ({images.length}/{maxFiles})
            </p>
          </div>
        </div>
      )}

      {images.length < maxFiles && !uploading && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          Thêm hình ảnh
        </Button>
      )}
    </div>
  );
}
