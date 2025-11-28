"use client";

import Image from "next/image";
import { Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { scaleIn } from "@/lib/motion";
import { UtensilsCrossed } from "lucide-react";

interface SuggestCardProps {
  id: string;
  title: string;
  imageUrl?: string | null;
  timeMinutes?: number | null;
  isFavorite?: boolean;
  buckets?: Array<{ bucket: { name: string } }>;
  description?: string | null;
}

export function SuggestCard({
  id,
  title,
  imageUrl,
  timeMinutes,
  isFavorite,
  buckets,
  description,
}: SuggestCardProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={scaleIn}
      className="bg-card border border-border rounded-lg overflow-hidden shadow-lg"
    >
      <div className="relative aspect-video bg-background">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/20">
            <UtensilsCrossed className="h-16 w-16" />
          </div>
        )}
        {isFavorite && (
          <div className="absolute top-3 right-3">
            <Heart className="h-6 w-6 fill-accent text-accent" />
          </div>
        )}
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {description && <p className="text-foreground/70 mb-4">{description}</p>}
        <div className="flex items-center gap-4 mb-4 text-sm text-foreground/60">
          {timeMinutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{timeMinutes} min</span>
            </div>
          )}
          {buckets && buckets.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {buckets.map((b) => (
                <span
                  key={b.bucket.name}
                  className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium"
                >
                  {b.bucket.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

