"use server";

import { db } from "@/lib/db";
import { RecipeInput, type RecipeInputType } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function createRecipe(data: RecipeInputType) {
  try {
    const validated = RecipeInput.parse(data);

    // Get or create ingredients
    const ingredientPromises = validated.ingredients.map(async (ing) => {
      return await db.ingredient.upsert({
        where: { name: ing.name },
        update: {},
        create: { name: ing.name },
      });
    });

    const ingredients = await Promise.all(ingredientPromises);

    // Get or create buckets
    const bucketPromises = validated.buckets.map(async (bucketName) => {
      return await db.bucket.upsert({
        where: { name: bucketName },
        update: {},
        create: { name: bucketName },
      });
    });

    const buckets = await Promise.all(bucketPromises);

    // Create recipe with relations
    const recipe = await db.recipe.create({
      data: {
        title: validated.title,
        description: validated.description,
        imageUrl: validated.imageUrl,
        timeMinutes: validated.timeMinutes,
        cuisine: validated.cuisine,
        steps: {
          create: validated.steps.map((step) => ({
            order: step.order,
            text: step.text,
          })),
        },
        ingredients: {
          create: ingredients.map((ing, idx) => ({
            ingredientId: ing.id,
            amount: validated.ingredients[idx].amount,
          })),
        },
        buckets: {
          create: buckets.map((bucket) => ({
            bucketId: bucket.id,
          })),
        },
      },
      include: {
        steps: true,
        ingredients: {
          include: { ingredient: true },
        },
        buckets: {
          include: { bucket: true },
        },
      },
    });

    revalidatePath("/recipes");
    return { success: true, data: recipe };
  } catch (error) {
    console.error("Error creating recipe:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create recipe" };
  }
}

export async function updateRecipe(id: string, data: Partial<RecipeInputType>) {
  try {
    const validated = data.title ? RecipeInput.partial().parse(data) : data;

    // Handle ingredients if provided
    if (validated.ingredients) {
      const ingredientPromises = validated.ingredients.map(async (ing) => {
        return await db.ingredient.upsert({
          where: { name: ing.name },
          update: {},
          create: { name: ing.name },
        });
      });

      const ingredients = await Promise.all(ingredientPromises);

      // Delete old ingredient relations
      await db.ingredientOnRecipe.deleteMany({ where: { recipeId: id } });

      // Create new relations
      await db.ingredientOnRecipe.createMany({
        data: ingredients.map((ing, idx) => ({
          recipeId: id,
          ingredientId: ing.id,
          amount: validated.ingredients?.[idx]?.amount,
        })),
      });
    }

    // Handle buckets if provided
    if (validated.buckets) {
      const bucketPromises = validated.buckets.map(async (bucketName) => {
        return await db.bucket.upsert({
          where: { name: bucketName },
          update: {},
          create: { name: bucketName },
        });
      });

      const buckets = await Promise.all(bucketPromises);

      // Delete old bucket relations
      await db.bucketOnRecipe.deleteMany({ where: { recipeId: id } });

      // Create new relations
      await db.bucketOnRecipe.createMany({
        data: buckets.map((bucket) => ({
          recipeId: id,
          bucketId: bucket.id,
        })),
      });
    }

    // Handle steps if provided
    if (validated.steps) {
      await db.step.deleteMany({ where: { recipeId: id } });
      await db.step.createMany({
        data: validated.steps.map((step) => ({
          recipeId: id,
          order: step.order,
          text: step.text,
        })),
      });
    }

    // Update recipe fields
    const recipe = await db.recipe.update({
      where: { id },
      data: {
        title: validated.title,
        description: validated.description,
        imageUrl: validated.imageUrl,
        timeMinutes: validated.timeMinutes,
        cuisine: validated.cuisine,
      },
      include: {
        steps: true,
        ingredients: {
          include: { ingredient: true },
        },
        buckets: {
          include: { bucket: true },
        },
      },
    });

    revalidatePath("/recipes");
    revalidatePath(`/recipes/${id}`);
    return { success: true, data: recipe };
  } catch (error) {
    console.error("Error updating recipe:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update recipe" };
  }
}

export async function deleteRecipe(id: string) {
  try {
    await db.recipe.delete({ where: { id } });
    revalidatePath("/recipes");
    return { success: true };
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete recipe" };
  }
}

export async function listRecipes(filters?: { bucket?: string; search?: string; favorite?: boolean }) {
  try {
    const recipes = await db.recipe.findMany({
      where: {
        ...(filters?.bucket && {
          buckets: {
            some: {
              bucket: {
                name: filters.bucket,
              },
            },
          },
        }),
        ...(filters?.search && {
          title: {
            contains: filters.search,
            mode: "insensitive",
          },
        }),
        ...(filters?.favorite !== undefined && {
          isFavorite: filters.favorite,
        }),
      },
      include: {
        steps: { orderBy: { order: "asc" } },
        ingredients: {
          include: { ingredient: true },
        },
        buckets: {
          include: { bucket: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: recipes };
  } catch (error) {
    console.error("Error listing recipes:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to list recipes" };
  }
}

export async function toggleFavorite(id: string) {
  try {
    const recipe = await db.recipe.findUnique({ where: { id } });
    if (!recipe) {
      return { success: false, error: "Recipe not found" };
    }

    const updated = await db.recipe.update({
      where: { id },
      data: { isFavorite: !recipe.isFavorite },
    });

    revalidatePath("/recipes");
    revalidatePath(`/recipes/${id}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to toggle favorite" };
  }
}

