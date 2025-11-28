"use client";

import { updateRecipe } from "@/app/actions/recipes";
import { RecipeForm } from "./RecipeForm";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";

interface RecipeEditProps {
  recipe: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    timeMinutes?: number | null;
    cuisine?: string | null;
    steps: Array<{ order: number; text: string }>;
    ingredients: Array<{ ingredient: { name: string }; amount?: string | null }>;
    buckets: Array<{ bucket: { name: string } }>;
  };
}

export function RecipeEdit({ recipe }: RecipeEditProps) {
  const router = useRouter();

  async function handleSubmit(data: Parameters<typeof updateRecipe>[1]) {
    const result = await updateRecipe(recipe.id, data);
    if (result.success) {
      router.push(`/recipes/${recipe.id}`);
      router.refresh();
    }
    return result;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Recipe</h1>
        <Link
          href={`/recipes/${recipe.id}`}
          className="h-11 w-11 rounded-lg bg-card border border-border flex items-center justify-center hover:border-accent transition-colors"
          aria-label="Cancel editing"
        >
          <X className="h-5 w-5" />
        </Link>
      </div>
      <RecipeForm
        onSubmit={handleSubmit}
        initialData={{
          title: recipe.title,
          description: recipe.description || undefined,
          imageUrl: recipe.imageUrl || undefined,
          timeMinutes: recipe.timeMinutes || undefined,
          cuisine: recipe.cuisine || undefined,
          steps: recipe.steps.map((s) => ({ order: s.order, text: s.text })),
          ingredients: recipe.ingredients.map((ing) => ({
            name: ing.ingredient.name,
            amount: ing.amount || undefined,
          })),
          buckets: recipe.buckets.map((b) => b.bucket.name),
        }}
        onSuccess={() => router.push(`/recipes/${recipe.id}`)}
      />
    </div>
  );
}

