import { z } from "zod";

export const RecipeInput = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  timeMinutes: z.number().int().positive().optional(),
  cuisine: z.string().optional(),
  steps: z.array(z.object({ order: z.number().int(), text: z.string().min(1) })).min(1),
  ingredients: z.array(z.object({ name: z.string().min(1), amount: z.string().optional() })).min(1),
  buckets: z.array(z.string().min(1)).min(1),
});

export const PreferencesInput = z.object({
  meatPerWeek: z.number().int().min(0),
  fishPerWeek: z.number().int().min(0),
  chickenPerWeek: z.number().int().min(0),
  veganPerWeek: z.number().int().min(0),
  cooldownDays: z.number().int().min(0),
});

export type RecipeInputType = z.infer<typeof RecipeInput>;
export type PreferencesInputType = z.infer<typeof PreferencesInput>;

