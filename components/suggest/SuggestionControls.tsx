"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestionControlsProps {
  onAccept: () => void;
  onDecline: () => void;
  isLoading?: boolean;
}

export function SuggestionControls({
  onAccept,
  onDecline,
  isLoading = false,
}: SuggestionControlsProps) {
  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={onDecline}
        disabled={isLoading}
        className={cn(
          "flex-1 py-2.5 bg-background border-2 border-border rounded-lg font-medium text-base flex items-center justify-center gap-2 hover:border-accent transition-colors",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        <X className="h-4 w-4" />
        Skip
      </button>
      <button
        onClick={onAccept}
        disabled={isLoading}
        className={cn(
          "flex-1 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium text-base flex items-center justify-center gap-2 transition-colors",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        <Check className="h-4 w-4" />
        Accept
      </button>
    </div>
  );
}

