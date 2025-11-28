"use client";

import { cn } from "@/lib/utils";

const BUCKETS = ["meat", "fish", "chicken", "vegan"] as const;

interface BucketSelectorProps {
  value: string[];
  onChange: (buckets: string[]) => void;
  className?: string;
}

export function BucketSelector({ value, onChange, className }: BucketSelectorProps) {
  const toggleBucket = (bucket: string) => {
    if (value.includes(bucket)) {
      onChange(value.filter((b) => b !== bucket));
    } else {
      onChange([...value, bucket]);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {BUCKETS.map((bucket) => (
        <button
          key={bucket}
          type="button"
          onClick={() => toggleBucket(bucket)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
            value.includes(bucket)
              ? "bg-accent text-accent-foreground"
              : "bg-card border border-border hover:border-accent"
          )}
        >
          {bucket.charAt(0).toUpperCase() + bucket.slice(1)}
        </button>
      ))}
    </div>
  );
}

