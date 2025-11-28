"use client";

import { useState, useEffect } from "react";
import { SuggestCard } from "./SuggestCard";
import { SuggestionControls } from "./SuggestionControls";
import { acceptSuggestion, declineSuggestion } from "@/app/actions/suggestions";
import { listRecipes } from "@/app/actions/recipes";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface SuggestionFlowProps {
  initialRecipe: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    timeMinutes?: number | null;
    isFavorite: boolean;
    buckets: Array<{ bucket: { name: string } }>;
  } | null;
}

export function SuggestionFlow({ initialRecipe }: SuggestionFlowProps) {
  const [recipe, setRecipe] = useState(initialRecipe);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const loadNextSuggestion = async () => {
    setIsLoading(true);
    try {
      const url = recipe ? `/api/suggest?exclude=${recipe.id}` : "/api/suggest";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.recipe) {
          setRecipe(data.recipe);
        } else {
          toast.error("No more suggestions available");
        }
      } else {
        toast.error("Failed to load suggestion");
      }
    } catch (error) {
      console.error("Error loading suggestion:", error);
      toast.error("Failed to load suggestion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!recipe) return;
    setIsLoading(true);
    const result = await acceptSuggestion(recipe.id);
    if (result.success) {
      toast.success("Meal logged!");
      // Redirect to history page to see the logged meal
      router.push("/history");
    } else {
      toast.error("error" in result ? result.error : "Failed to log meal");
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!recipe) return;
    setIsLoading(true);
    try {
      await declineSuggestion(recipe.id);
      await loadNextSuggestion();
    } catch (error) {
      console.error("Error in handleDecline:", error);
      toast.error("Failed to load next suggestion");
      setIsLoading(false);
    }
  };

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground/60 mb-4">No suggestions available</p>
        <p className="text-sm text-foreground/50">
          Add more recipes or adjust your preferences to get suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <SuggestCard
        id={recipe.id}
        title={recipe.title}
        imageUrl={recipe.imageUrl}
        timeMinutes={recipe.timeMinutes}
        isFavorite={recipe.isFavorite}
        buckets={recipe.buckets}
        description={recipe.description}
      />
      <SuggestionControls
        onAccept={handleAccept}
        onDecline={handleDecline}
        isLoading={isLoading}
      />
    </div>
  );
}

