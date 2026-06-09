import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/db/supabase';
import { compressImage, validateImageFile, sanitizeFilename } from '@/lib/imageUtils';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  bucketName?: string;
  folder?: string;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUpload({
  onUploadComplete,
  currentImageUrl,
  bucketName = 'app-avdw5t0e8yrl-images',
  folder = 'uploads',
  maxSizeMB = 1,
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      setCompressing(true);
      setProgress(10);

      // Compress image
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const compressedBlob = await compressImage(file, maxSizeBytes);
      
      setProgress(30);
      setCompressing(false);
      setUploading(true);

      // Generate sanitized filename
      const sanitizedName = sanitizeFilename(file.name);
      const filePath = `${folder}/${sanitizedName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, compressedBlob, {
          contentType: 'image/webp',
          upsert: false,
        });

      if (error) throw error;

      setProgress(80);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setProgress(100);
      setPreviewUrl(urlData.publicUrl);
      onUploadComplete(urlData.publicUrl);

      // Show success message with file size
      const compressedSizeKB = (compressedBlob.size / 1024).toFixed(1);
      const originalSizeKB = (file.size / 1024).toFixed(1);
      toast.success(
        `Image uploaded successfully! Compressed from ${originalSizeKB}KB to ${compressedSizeKB}KB`
      );

      // Reset progress after a delay
      setTimeout(() => setProgress(0), 1000);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      setCompressing(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || compressing}
      />

      {previewUrl ? (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-border"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={uploading || compressing}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, GIF, WEBP, AVIF (max {maxSizeMB}MB after compression)
          </p>
        </div>
      )}

      {(uploading || compressing) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {compressing ? (
                <>
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Compressing image...
                </>
              ) : (
                <>
                  <Upload className="inline h-4 w-4 mr-2" />
                  Uploading...
                </>
              )}
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
}