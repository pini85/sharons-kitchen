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
      {BUCKETS.map((bucket) => {
        const isSelected = value.includes(bucket);
        return (
          <button
            key={bucket}
            type="button"
            onClick={() => toggleBucket(bucket)}
            className={cn(
              "px-4 py-3 rounded-lg text-sm font-medium transition-all min-h-[48px] min-w-[100px]",
              isSelected
                ? "bg-accent text-accent-foreground shadow-md ring-2 ring-accent ring-offset-2 ring-offset-background"
                : "bg-card border-2 border-border hover:border-accent hover:bg-card/50"
            )}
            aria-pressed={isSelected}
          >
            {bucket.charAt(0).toUpperCase() + bucket.slice(1)}
          </button>
        );
      })}
    </div>
  );
}

