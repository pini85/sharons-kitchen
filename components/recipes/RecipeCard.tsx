"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Heart, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";

interface RecipeCardProps {
  id: string;
  title: string;
  imageUrl?: string | null;
  timeMinutes?: number | null;
  isFavorite?: boolean;
  buckets?: Array<{ bucket: { name: string } }>;
  className?: string;
}

export function RecipeCard({
  id,
  title,
  imageUrl,
  timeMinutes,
  isFavorite,
  buckets,
  className,
}: RecipeCardProps) {
  return (
    <motion.div variants={fadeInUp} className={cn("group", className)}>
      <Link
        href={`/recipes/${id}`}
        className="block bg-card border border-border rounded-lg overflow-hidden hover:border-accent transition-colors"
      >
        <div className="relative aspect-video bg-background">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground/20">
              <UtensilsCrossed className="h-12 w-12" />
            </div>
          )}
          {isFavorite && (
            <div className="absolute top-2 right-2">
              <Heart className="h-5 w-5 fill-accent text-accent" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
          <div className="flex items-center gap-4 text-sm text-foreground/60">
            {timeMinutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{timeMinutes} min</span>
              </div>
            )}
            {buckets && buckets.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {buckets.slice(0, 2).map((b) => (
                  <span
                    key={b.bucket.name}
                    className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs"
                  >
                    {b.bucket.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

