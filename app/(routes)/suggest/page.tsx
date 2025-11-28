import { suggestNext } from "@/lib/suggestion";
import { listRecipes } from "@/app/actions/recipes";
import { SuggestCard } from "@/components/suggest/SuggestCard";
import { SuggestionControls } from "@/components/suggest/SuggestionControls";
import { PageContainer } from "@/components/common/PageContainer";
import { Navbar } from "@/components/common/Navbar";
import { SuggestionFlow } from "@/components/suggest/SuggestionFlow";

export default async function SuggestPage() {
  const suggestionId = await suggestNext();
  const result = await listRecipes();
  const recipe = suggestionId && result.success && result.data
    ? result.data.find((r) => r.id === suggestionId) ?? null
    : null;

  return (
    <>
      <Navbar />
      <PageContainer className="container mx-auto px-4 max-w-2xl h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
        <h1 className="text-2xl font-bold mb-4 flex-shrink-0">Meal Suggestion</h1>
        <SuggestionFlow initialRecipe={recipe} />
      </PageContainer>
    </>
  );
}

