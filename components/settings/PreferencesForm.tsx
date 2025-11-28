"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PreferencesInput, type PreferencesInputType } from "@/lib/validators";
import { updatePreferences } from "@/app/actions/preferences";
import toast from "react-hot-toast";
import { useState } from "react";

interface PreferencesFormProps {
  initialData: {
    meatPerWeek: number;
    fishPerWeek: number;
    chickenPerWeek: number;
    veganPerWeek: number;
    cooldownDays: number;
  } | null;
}

export function PreferencesForm({ initialData }: PreferencesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PreferencesInputType>({
    resolver: zodResolver(PreferencesInput),
    defaultValues: initialData || {
      meatPerWeek: 1,
      fishPerWeek: 1,
      chickenPerWeek: 3,
      veganPerWeek: 2,
      cooldownDays: 5,
    },
  });

  const onSubmit = async (data: PreferencesInputType) => {
    setIsSubmitting(true);
    const result = await updatePreferences(data);
    if (result.success) {
      toast.success("Preferences updated!");
    } else {
      toast.error(result.error || "Failed to update preferences");
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Weekly Targets</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Meat per week: <span className="text-accent">{watch("meatPerWeek")}</span>
            </label>
            <input
              type="range"
              min="0"
              max="7"
              {...register("meatPerWeek", { valueAsNumber: true })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Fish per week: <span className="text-accent">{watch("fishPerWeek")}</span>
            </label>
            <input
              type="range"
              min="0"
              max="7"
              {...register("fishPerWeek", { valueAsNumber: true })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Chicken per week: <span className="text-accent">{watch("chickenPerWeek")}</span>
            </label>
            <input
              type="range"
              min="0"
              max="7"
              {...register("chickenPerWeek", { valueAsNumber: true })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Vegan per week: <span className="text-accent">{watch("veganPerWeek")}</span>
            </label>
            <input
              type="range"
              min="0"
              max="7"
              {...register("veganPerWeek", { valueAsNumber: true })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Cooldown</h2>
        <div>
          <label className="block text-sm font-medium mb-2">
            Cooldown days: <span className="text-accent">{watch("cooldownDays")}</span>
          </label>
          <input
            type="range"
            min="0"
            max="14"
            {...register("cooldownDays", { valueAsNumber: true })}
            className="w-full"
          />
          <p className="text-xs text-foreground/60 mt-1">
            Recipes won&apos;t be suggested again within this many days after being eaten
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-accent text-accent-foreground rounded-lg font-medium text-lg transition-colors min-h-[52px] disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : "Save Preferences"}
      </button>
    </form>
  );
}

