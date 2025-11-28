"use client";

import { createRecipe } from "@/app/actions/recipes";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { PageContainer } from "@/components/common/PageContainer";
import { Navbar } from "@/components/common/Navbar";
import { useRouter } from "next/navigation";

export default function NewRecipePage() {
  const router = useRouter();

  async function handleSubmit(data: Parameters<typeof createRecipe>[0]) {
    const result = await createRecipe(data);
    return result;
  }

  function handleSuccess() {
    // This will be called after the success toast
    setTimeout(() => {
      router.push(`/recipes`);
    }, 500);
  }

  return (
    <>
      <Navbar />
      <PageContainer className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">New Recipe</h1>
        <RecipeForm onSubmit={handleSubmit} onSuccess={handleSuccess} />
      </PageContainer>
    </>
  );
}

