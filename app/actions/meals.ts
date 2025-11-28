"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function logMeal(recipeId: string, servedAt?: string, notes?: string) {
  try {
    const meal = await db.meal.create({
      data: {
        recipeId,
        servedAt,
        notes,
      },
      include: {
        recipe: {
          include: {
            buckets: {
              include: { bucket: true },
            },
          },
        },
      },
    });

    revalidatePath("/history");
    revalidatePath("/suggest");
    return { success: true, data: meal };
  } catch (error) {
    console.error("Error logging meal:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to log meal" };
  }
}

export async function listMeals(range?: { start?: Date; end?: Date }) {
  try {
    const meals = await db.meal.findMany({
      where: {
        ...(range?.start || range?.end
          ? {
              date: {
                ...(range.start && { gte: range.start }),
                ...(range.end && { lte: range.end }),
              },
            }
          : {}),
      },
      include: {
        recipe: {
          include: {
            buckets: {
              include: { bucket: true },
            },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return { success: true, data: meals };
  } catch (error) {
    console.error("Error listing meals:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to list meals" };
  }
}

export async function deleteMeal(id: string) {
  try {
    await db.meal.delete({ where: { id } });
    revalidatePath("/history");
    revalidatePath("/suggest");
    return { success: true };
  } catch (error) {
    console.error("Error deleting meal:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete meal" };
  }
}

