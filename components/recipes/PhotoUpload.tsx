"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Image as ImageIcon, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  className?: string;
}

export function PhotoUpload({ value, onChange, className }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Recipe"
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute top-2 right-2 h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors"
            aria-label="Remove image"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "sharons-kitchen"}
          onUpload={(result) => {
            if (result.info && typeof result.info === "object" && "secure_url" in result.info) {
              const secureUrl = result.info.secure_url;
              if (typeof secureUrl === "string") {
                onChange(secureUrl);
              }
            }
            setIsUploading(false);
          }}
          onOpen={() => setIsUploading(true)}
          onClose={() => setIsUploading(false)}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              disabled={isUploading}
              className="w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-accent transition-colors disabled:opacity-50"
            >
              <ImageIcon className="h-12 w-12 text-foreground/40" />
              <span className="text-sm text-foreground/60">
                {isUploading ? "Uploading..." : "Click to upload image"}
              </span>
            </button>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}

