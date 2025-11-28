"use client";

import { Check, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestionControlsProps {
  onAccept: () => void;
  onDecline: () => void;
  onAnother: () => void;
  isLoading?: boolean;
}

export function SuggestionControls({
  onAccept,
  onDecline,
  onAnother,
  isLoading = false,
}: SuggestionControlsProps) {
  return (
    <div className="flex gap-3 mt-6">
      <button
        onClick={onAccept}
        disabled={isLoading}
        className={cn(
          "flex-1 py-4 bg-accent text-accent-foreground rounded-lg font-medium text-lg flex items-center justify-center gap-2 min-h-[52px] transition-colors",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        <Check className="h-5 w-5" />
        Accept
      </button>
      <button
        onClick={onDecline}
        disabled={isLoading}
        className={cn(
          "flex-1 py-4 bg-card border-2 border-border rounded-lg font-medium text-lg flex items-center justify-center gap-2 min-h-[52px] hover:border-accent transition-colors",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        <X className="h-5 w-5" />
        Decline
      </button>
      <button
        onClick={onAnother}
        disabled={isLoading}
        className={cn(
          "px-4 py-4 bg-card border border-border rounded-lg font-medium flex items-center justify-center min-h-[52px] hover:border-accent transition-colors",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
        aria-label="Another suggestion"
      >
        <RefreshCw className="h-5 w-5" />
      </button>
    </div>
  );
}

