"use client";

import Image from "next/image";
import { Clock, Heart, Edit, Trash2, UtensilsCrossed } from "lucide-react";
import { IngredientChips } from "./IngredientChips";
import { deleteRecipe, toggleFavorite } from "@/app/actions/recipes";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

interface RecipeDetailsProps {
  recipe: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    timeMinutes?: number | null;
    cuisine?: string | null;
    isFavorite: boolean;
    steps: Array<{ order: number; text: string }>;
    ingredients: Array<{ ingredient: { name: string }; amount?: string | null }>;
    buckets: Array<{ bucket: { name: string } }>;
  };
}

export function RecipeDetails({ recipe }: RecipeDetailsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    const result = await deleteRecipe(recipe.id);
    if (result.success) {
      toast.success("Recipe deleted");
      router.push("/recipes");
    } else {
      toast.error(result.error || "Failed to delete recipe");
    }
  };

  const handleToggleFavorite = async () => {
    const result = await toggleFavorite(recipe.id);
    if (result.success) {
      toast.success(result.data.isFavorite ? "Added to favorites" : "Removed from favorites");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update favorite");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
          {recipe.description && (
            <p className="text-foreground/70 mb-4">{recipe.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleToggleFavorite}
            className="h-11 w-11 rounded-lg bg-card border border-border flex items-center justify-center hover:border-accent transition-colors"
            aria-label="Toggle favorite"
          >
            <Heart
              className={`h-5 w-5 ${recipe.isFavorite ? "fill-accent text-accent" : ""}`}
            />
          </button>
          <Link
            href={`/recipes/${recipe.id}?edit=true`}
            className="h-11 w-11 rounded-lg bg-card border border-border flex items-center justify-center hover:border-accent transition-colors"
            aria-label="Edit recipe"
          >
            <Edit className="h-5 w-5" />
          </Link>
          <button
            onClick={handleDelete}
            className="h-11 w-11 rounded-lg bg-card border border-border flex items-center justify-center hover:border-accent transition-colors"
            aria-label="Delete recipe"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {recipe.imageUrl && (
        <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
        {recipe.timeMinutes && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.timeMinutes} minutes</span>
          </div>
        )}
        {recipe.cuisine && (
          <div className="px-3 py-1 bg-card border border-border rounded-full">
            {recipe.cuisine}
          </div>
        )}
        {recipe.buckets.map((b) => (
          <div
            key={b.bucket.name}
            className="px-3 py-1 bg-accent/20 text-accent rounded-full font-medium"
          >
            {b.bucket.name}
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
        <IngredientChips
          ingredients={recipe.ingredients.map((ing) => ({
            name: ing.ingredient.name,
            amount: ing.amount || undefined,
          }))}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Steps</h2>
        <ol className="space-y-4">
          {recipe.steps.map((step) => (
            <li key={step.order} className="flex gap-4">
              <span className="flex-shrink-0 h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-medium">
                {step.order}
              </span>
              <p className="flex-1 pt-1">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

