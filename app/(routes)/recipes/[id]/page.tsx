import { listRecipes, updateRecipe, deleteRecipe, toggleFavorite } from "@/app/actions/recipes";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { PageContainer } from "@/components/common/PageContainer";
import { Navbar } from "@/components/common/Navbar";
import Image from "next/image";
import { Clock, Heart, Edit, Trash2, UtensilsCrossed } from "lucide-react";
import { RecipeDetails } from "@/components/recipes/RecipeDetails";
import { RecipeEdit } from "@/components/recipes/RecipeEdit";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function RecipeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  
  const result = await listRecipes();
  const recipe = result.success && result.data
    ? result.data.find((r) => r.id === id) ?? null
    : null;

  if (!recipe) {
    redirect("/recipes");
  }

  const isEditing = edit === "true";

  return (
    <>
      <Navbar />
      <PageContainer className="container mx-auto px-4 py-6 max-w-3xl">
        {isEditing ? (
          <RecipeEdit recipe={recipe} />
        ) : (
          <RecipeDetails recipe={recipe} />
        )}
      </PageContainer>
    </>
  );
}

