"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageReady: (url: string) => void;
  onError?: (error: string) => void;
  defaultUrl?: string;
}

interface UploadResponse {
  success: boolean;
  uploadUrl: string;
  downloadUrl: string;
  fileId: string;
  filePath: string;
  expiresAt: string;
}

export function ImageUpload({ onImageReady, onError, defaultUrl = "" }: ImageUploadProps) {
  const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
  const [imageUrl, setImageUrl] = useState(defaultUrl);
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Handle drag events
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // We'll call handleFileUpload directly since it's defined later
      // This will be handled by the file input change handler
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }, []);

  // Add global drag event listeners
  useEffect(() => {
    const handleGlobalDragEnter = (e: DragEvent) => handleDragEnter(e);
    const handleGlobalDragLeave = (e: DragEvent) => handleDragLeave(e);
    const handleGlobalDragOver = (e: DragEvent) => handleDragOver(e);
    const handleGlobalDrop = (e: DragEvent) => handleDrop(e);

    document.addEventListener("dragenter", handleGlobalDragEnter);
    document.addEventListener("dragleave", handleGlobalDragLeave);
    document.addEventListener("dragover", handleGlobalDragOver);
    document.addEventListener("drop", handleGlobalDrop);

    return () => {
      document.removeEventListener("dragenter", handleGlobalDragEnter);
      document.removeEventListener("dragleave", handleGlobalDragLeave);
      document.removeEventListener("dragover", handleGlobalDragOver);
      document.removeEventListener("drop", handleGlobalDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return "Sadece JPEG, PNG, WebP ve GIF formatları desteklenir.";
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return "Dosya boyutu 10MB'dan büyük olamaz.";
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    setError("");
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get pre-signed URL
      const uploadRequest = await fetch("/api/upload/temp-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      if (!uploadRequest.ok) {
        const errorData = await uploadRequest.json();
        throw new Error(errorData.error || "Upload URL alınamadı");
      }

      const uploadData: UploadResponse = await uploadRequest.json();
      setUploadProgress(25);

      // Step 2: Upload file to pre-signed URL
      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Dosya yüklenemedi");
      }

      setUploadProgress(100);

      // Step 3: Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setUploadedImage(previewUrl);
      
      // Step 4: Notify parent component with download URL
      onImageReady(uploadData.downloadUrl);

      // Clear any previous errors
      setError("");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleUrlSubmit = () => {
    const trimmedUrl = imageUrl.trim();
    if (trimmedUrl && isValidUrl(trimmedUrl)) {
      onImageReady(trimmedUrl);
      setError("");
    } else {
      const errorMessage = "Lütfen geçerli bir HTTP veya HTTPS URL'si girin";
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setImageUrl(newUrl);
    
    // Auto-submit if valid URL is entered
    const trimmedUrl = newUrl.trim();
    if (trimmedUrl && isValidUrl(trimmedUrl)) {
      onImageReady(trimmedUrl);
      setError("");
    }
  };

  const handleUrlBlur = () => {
    // Auto-submit on blur if valid URL
    const trimmedUrl = imageUrl.trim();
    if (trimmedUrl && isValidUrl(trimmedUrl)) {
      onImageReady(trimmedUrl);
      setError("");
    }
  };

  const handleRemove = () => {
    setUploadedImage("");
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError("");
    // Clear the image from parent component
    onImageReady("");
  };

  const handleOpenUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    const trimmedUrl = imageUrl.trim();
    if (trimmedUrl && isValidUrl(trimmedUrl)) {
      window.open(trimmedUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "url" | "upload")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="upload">Yükle</TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">Görsel URL&apos;si</Label>
            <div className="flex gap-2">
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={handleUrlChange}
                onBlur={handleUrlBlur}
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                className="flex-1"
              />
              {imageUrl && isValidUrl(imageUrl.trim()) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenUrl}
                  className="h-10 w-10 shrink-0"
                  title="Yeni sekmede aç"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            {imageUrl && isValidUrl(imageUrl.trim()) && (
              <div className="mt-2">
                <p className="text-xs text-business">✓ Geçerli URL tespit edildi</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div className="space-y-2">
            <Label>Görsel Dosyası</Label>
            <div
              className={cn(
                "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                isDragging
                  ? "border-business bg-business/5"
                  : "border-border hover:border-business/50",
                isUploading && "pointer-events-none opacity-50"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isUploading}
              />
              
              {isUploading ? (
                <div className="space-y-3">
                  <Upload className="mx-auto h-8 w-8 text-business animate-pulse" />
                  <p className="text-sm text-text-secondary">Yükleniyor...</p>
                  <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                </div>
              ) : uploadedImage ? (
                <div className="space-y-3">
                  <Image
                    src={uploadedImage}
                    alt="Yüklenen görsel"
                    width={96}
                    height={96}
                    className="mx-auto h-24 w-24 object-cover rounded-lg"
                    unoptimized
                  />
                  <p className="text-sm text-business">Görsel yüklendi!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="mx-auto h-8 w-8 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-primary">
                      Dosyayı buraya sürükleyin veya tıklayın
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      JPEG, PNG, WebP, GIF (max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Error message */}
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Remove button */}
      {(uploadedImage || imageUrl) && !isUploading && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemove}
          className="w-full gap-2"
        >
          <X className="h-4 w-4" />
          Temizle
        </Button>
      )}

      {/* Global drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="rounded-2xl border-2 border-dashed border-business bg-business/5 p-12 text-center">
            <Upload className="mx-auto h-16 w-16 text-business mb-4" />
            <p className="text-lg font-medium text-business">
              Dosyayı buraya bırakın
            </p>
            <p className="text-sm text-text-secondary mt-2">
              Görsel yüklemek için dosyayı buraya sürükleyip bırakın
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
