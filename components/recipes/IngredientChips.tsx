"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Ingredient {
  name: string;
  amount?: string;
}

interface IngredientChipsProps {
  ingredients: Ingredient[];
  onRemove?: (index: number) => void;
  editable?: boolean;
  className?: string;
}

export function IngredientChips({
  ingredients,
  onRemove,
  editable = false,
  className,
}: IngredientChipsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {ingredients.map((ing, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-full text-sm"
        >
          <span>
            {ing.name}
            {ing.amount && <span className="text-foreground/60 ml-1">({ing.amount})</span>}
          </span>
          {editable && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="h-5 w-5 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
              aria-label="Remove ingredient"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

