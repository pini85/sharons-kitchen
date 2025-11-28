import { createRecipe } from "@/app/actions/recipes";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { PageContainer } from "@/components/common/PageContainer";
import { Navbar } from "@/components/common/Navbar";
import { redirect } from "next/navigation";

export default function NewRecipePage() {
  async function handleSubmit(data: Parameters<typeof createRecipe>[0]) {
    "use server";
    const result = await createRecipe(data);
    if (result.success) {
      redirect(`/recipes/${result.data.id}`);
    }
    return result;
  }

  return (
    <>
      <Navbar />
      <PageContainer className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">New Recipe</h1>
        <RecipeForm onSubmit={handleSubmit} />
      </PageContainer>
    </>
  );
}

