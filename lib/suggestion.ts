import { db } from "./db";

interface WeeklyDeficit {
  bucket: string;
  deficit: number;
}

interface RecipeCandidate {
  id: string;
  title: string;
  buckets: string[];
  isFavorite: boolean;
  timeMinutes: number | null;
  lastEaten?: Date;
}

/**
 * Get the start and end of the current week (Monday to Sunday)
 */
function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const start = new Date(now.setDate(diff));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Count meals per bucket within the current week
 */
async function countMealsPerBucket(weekStart: Date, weekEnd: Date): Promise<Map<string, number>> {
  const meals = await db.meal.findMany({
    where: {
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
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

  const counts = new Map<string, number>();
  meals.forEach((meal) => {
    meal.recipe.buckets.forEach((br) => {
      const bucketName = br.bucket.name;
      counts.set(bucketName, (counts.get(bucketName) || 0) + 1);
    });
  });

  return counts;
}

/**
 * Compute deficits for each bucket based on preferences
 */
async function computeDeficits(
  weekStart: Date,
  weekEnd: Date
): Promise<WeeklyDeficit[]> {
  const prefs = await db.preferences.findFirst();
  if (!prefs) {
    // Default preferences if none exist
    return [
      { bucket: "meat", deficit: 1 },
      { bucket: "fish", deficit: 1 },
      { bucket: "chicken", deficit: 3 },
      { bucket: "vegan", deficit: 2 },
    ];
  }

  const consumed = await countMealsPerBucket(weekStart, weekEnd);
  const targets = {
    meat: prefs.meatPerWeek,
    fish: prefs.fishPerWeek,
    chicken: prefs.chickenPerWeek,
    vegan: prefs.veganPerWeek,
  };

  return Object.entries(targets).map(([bucket, target]) => ({
    bucket,
    deficit: Math.max(0, target - (consumed.get(bucket) || 0)),
  }));
}

/**
 * Get recipes eaten within cooldown period
 */
async function getRecentRecipeIds(cooldownDays: number): Promise<Set<string>> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - cooldownDays);
  cutoff.setHours(0, 0, 0, 0);

  const recentMeals = await db.meal.findMany({
    where: {
      date: {
        gte: cutoff,
      },
    },
    select: {
      recipeId: true,
    },
  });

  return new Set(recentMeals.map((m) => m.recipeId));
}

/**
 * Get last eaten date for each recipe
 */
async function getLastEatenDates(): Promise<Map<string, Date>> {
  const meals = await db.meal.findMany({
    select: {
      recipeId: true,
      date: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  const lastEaten = new Map<string, Date>();
  meals.forEach((meal) => {
    if (!lastEaten.has(meal.recipeId)) {
      lastEaten.set(meal.recipeId, meal.date);
    }
  });

  return lastEaten;
}

/**
 * Rank recipe candidates based on deficits, recency, favorites, and time
 */
function rankCandidates(
  candidates: RecipeCandidate[],
  deficits: WeeklyDeficit[],
  isWeekday: boolean
): RecipeCandidate[] {
  const deficitMap = new Map(deficits.map((d) => [d.bucket, d.deficit]));

  return candidates.sort((a, b) => {
    // 1. Highest bucket deficit
    const aMaxDeficit = Math.max(...a.buckets.map((b) => deficitMap.get(b) || 0));
    const bMaxDeficit = Math.max(...b.buckets.map((b) => deficitMap.get(b) || 0));
    if (aMaxDeficit !== bMaxDeficit) {
      return bMaxDeficit - aMaxDeficit;
    }

    // 2. Not recently eaten (prefer recipes without lastEaten)
    if (!a.lastEaten && b.lastEaten) return -1;
    if (a.lastEaten && !b.lastEaten) return 1;
    if (a.lastEaten && b.lastEaten) {
      const aDays = Math.floor((Date.now() - a.lastEaten.getTime()) / (1000 * 60 * 60 * 24));
      const bDays = Math.floor((Date.now() - b.lastEaten.getTime()) / (1000 * 60 * 60 * 24));
      if (aDays !== bDays) return bDays - aDays;
    }

    // 3. Favorites first
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;

    // 4. Shorter time on weekdays
    if (isWeekday) {
      const aTime = a.timeMinutes || 999;
      const bTime = b.timeMinutes || 999;
      if (aTime !== bTime) return aTime - bTime;
    }

    return 0;
  });
}

/**
 * Suggest the next recipe to cook
 */
export async function suggestNext(): Promise<string | null> {
  try {
    const { start: weekStart, end: weekEnd } = getCurrentWeekRange();
    const prefs = await db.preferences.findFirst();
    const cooldownDays = prefs?.cooldownDays || 5;

    const deficits = await computeDeficits(weekStart, weekEnd);
    const recentIds = await getRecentRecipeIds(cooldownDays);
    const lastEaten = await getLastEatenDates();

    // Get all recipes with their buckets
    const recipes = await db.recipe.findMany({
      include: {
        buckets: {
          include: { bucket: true },
        },
      },
    });

    // Filter out recently eaten recipes
    const candidates: RecipeCandidate[] = recipes
      .filter((r) => !recentIds.has(r.id))
      .map((r) => ({
        id: r.id,
        title: r.title,
        buckets: r.buckets.map((br) => br.bucket.name),
        isFavorite: r.isFavorite,
        timeMinutes: r.timeMinutes,
        lastEaten: lastEaten.get(r.id),
      }));

    if (candidates.length === 0) {
      // If all recipes are in cooldown, suggest from all recipes
      const allCandidates: RecipeCandidate[] = recipes.map((r) => ({
        id: r.id,
        title: r.title,
        buckets: r.buckets.map((br) => br.bucket.name),
        isFavorite: r.isFavorite,
        timeMinutes: r.timeMinutes,
        lastEaten: lastEaten.get(r.id),
      }));

      const isWeekday = [1, 2, 3, 4, 5].includes(new Date().getDay());
      const ranked = rankCandidates(allCandidates, deficits, isWeekday);
      return ranked[0]?.id || null;
    }

    const isWeekday = [1, 2, 3, 4, 5].includes(new Date().getDay());
    const ranked = rankCandidates(candidates, deficits, isWeekday);
    return ranked[0]?.id || null;
  } catch (error) {
    console.error("Error suggesting next recipe:", error);
    return null;
  }
}

/**
 * Decline a suggestion (no-op for now, could track declined suggestions)
 */
export async function declineSuggestion(recipeId: string): Promise<void> {
  // Could implement tracking of declined suggestions here
  // For now, just return the next suggestion
}

/**
 * Accept a suggestion and log it as a meal
 */
export async function acceptSuggestion(
  recipeId: string,
  servedAt?: string,
  notes?: string
): Promise<{ success: true; nextSuggestionId: string | null } | { success: false; nextSuggestionId: null }> {
  try {
    // Log the meal
    await db.meal.create({
      data: {
        recipeId,
        servedAt,
        notes,
      },
    });

    // Get next suggestion
    const nextId = await suggestNext();
    return { success: true, nextSuggestionId: nextId };
  } catch (error) {
    console.error("Error accepting suggestion:", error);
    return { success: false, nextSuggestionId: null };
  }
}

