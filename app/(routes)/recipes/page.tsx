import { listRecipes } from "@/app/actions/recipes";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { PageContainer } from "@/components/common/PageContainer";
import { Navbar } from "@/components/common/Navbar";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { RecipeSearch } from "@/components/recipes/RecipeSearch";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: { bucket?: string; search?: string; favorite?: string };
}) {
  const result = await listRecipes({
    bucket: searchParams.bucket,
    search: searchParams.search,
    favorite: searchParams.favorite === "true" ? true : undefined,
  });

  const recipes = result.success ? result.data : [];

  return (
    <>
      <Navbar />
      <PageContainer className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Recipes</h1>
          <Link
            href="/recipes/new"
            className="h-11 px-4 bg-accent text-accent-foreground rounded-lg flex items-center gap-2 font-medium"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Recipe</span>
          </Link>
        </div>

        <RecipeSearch />

        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/60 mb-4">No recipes found</p>
            <Link
              href="/recipes/new"
              className="inline-block px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium"
            >
              Add your first recipe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                imageUrl={recipe.imageUrl}
                timeMinutes={recipe.timeMinutes}
                isFavorite={recipe.isFavorite}
                buckets={recipe.buckets}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </>
  );
}

