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
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "sharons-kitchen";

  return (
    <div className={cn("space-y-2", className)}>
      <CldUploadWidget
        uploadPreset={uploadPreset}
        options={{
          sources: ["local", "camera", "url"],
          multiple: false,
          maxFileSize: 5000000,
          clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
          styles: {
            palette: {
              window: "#FFFFFF",
              windowBorder: "#90A0B3",
              tabIcon: "#0078FF",
              menuIcons: "#5A616A",
              textDark: "#000000",
              textLight: "#FFFFFF",
              link: "#0078FF",
              action: "#FF620C",
              inactiveTabIcon: "#0E2F5A",
              error: "#F44235",
              inProgress: "#0078FF",
              complete: "#20B832",
              sourceBg: "#E4EBF1",
            },
            fonts: {
              default: null,
              "'Poppins', sans-serif": {
                url: "https://fonts.googleapis.com/css?family=Poppins",
                active: true,
              },
            },
          },
        }}
        onSuccess={(result) => {
          if (result.info && typeof result.info === "object" && "secure_url" in result.info) {
            const secureUrl = result.info.secure_url;
            if (typeof secureUrl === "string") {
              onChange(secureUrl);
            }
          }
          setIsUploading(false);
        }}
        onError={(error) => {
          console.error("Cloudinary upload error:", error);
          setIsUploading(false);
        }}
        onOpen={() => setIsUploading(true)}
        onClose={() => setIsUploading(false)}
      >
        {({ open }) => (
          <div className="relative w-full h-48 border-2 border-dashed border-border rounded-lg overflow-hidden group">
            {value ? (
              <>
                <img
                  src={value}
                  alt="Recipe preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => open()}
                    disabled={isUploading}
                    className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:border-accent transition-colors disabled:opacity-50"
                  >
                    Change Image
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(undefined)}
                  className="absolute top-2 right-2 h-10 w-10 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Remove image"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => open()}
                disabled={isUploading}
                className="w-full h-full flex flex-col items-center justify-center gap-2 hover:border-accent transition-colors disabled:opacity-50"
              >
                <ImageIcon className="h-12 w-12 text-foreground/40" />
                <span className="text-sm text-foreground/60">
                  {isUploading ? "Uploading..." : "Click to upload image"}
                </span>
              </button>
            )}
          </div>
        )}
      </CldUploadWidget>
    </div>
  );
}

