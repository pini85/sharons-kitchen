"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const BUCKETS = ["meat", "fish", "chicken", "vegan"] as const;

export function RecipeSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedBucket, setSelectedBucket] = useState(searchParams.get("bucket") || "");
  const [favorite, setFavorite] = useState(searchParams.get("favorite") === "true");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedBucket) params.set("bucket", selectedBucket);
    if (favorite) params.set("favorite", "true");
    router.push(`/recipes?${params.toString()}`);
  }, [search, selectedBucket, favorite, router]);

  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes..."
          className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {BUCKETS.map((bucket) => (
          <button
            key={bucket}
            onClick={() => setSelectedBucket(selectedBucket === bucket ? "" : bucket)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
              selectedBucket === bucket
                ? "bg-accent text-accent-foreground"
                : "bg-card border border-border hover:border-accent"
            )}
          >
            {bucket.charAt(0).toUpperCase() + bucket.slice(1)}
          </button>
        ))}
        <button
          onClick={() => setFavorite(!favorite)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
            favorite
              ? "bg-accent text-accent-foreground"
              : "bg-card border border-border hover:border-accent"
          )}
        >
          ⭐ Favorites
        </button>
      </div>
    </div>
  );
}

