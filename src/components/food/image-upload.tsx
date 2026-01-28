"use client";

import { useState, useCallback } from "react";
import { Upload, Camera, Loader2 } from "lucide-react";
import type { InventoryItem } from "@/lib/anthropic";

interface ImageUploadProps {
  onItemsDetected: (items: InventoryItem[], location: string) => void;
}

export function ImageUpload({ onItemsDetected }: ImageUploadProps) {
  const [location, setLocation] = useState<"fridge" | "pantry" | "freezer">("fridge");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("location", location);

        const res = await fetch("/api/food/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        onItemsDetected(data.detectedItems, location);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [location, onItemsDetected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleUpload(file);
      }
    },
    [handleUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["fridge", "pantry", "freezer"] as const).map((loc) => (
          <button
            key={loc}
            onClick={() => setLocation(loc)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              location === loc
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {loc}
          </button>
        ))}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Analyzing your {location} photo...
            </p>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-3">
            <div className="flex gap-3">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <Camera className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">
              Drop a photo or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              Take a photo of your {location} to update inventory
            </p>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {preview && !uploading && (
        <div className="flex justify-center">
          <img
            src={preview}
            alt="Upload preview"
            className="max-h-48 rounded-lg border border-border"
          />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
