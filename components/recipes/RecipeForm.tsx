"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RecipeInput, type RecipeInputType } from "@/lib/validators";
import { PhotoUpload } from "./PhotoUpload";
import { BucketSelector } from "./BucketSelector";
import { IngredientChips } from "./IngredientChips";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface RecipeFormProps {
  onSubmit: (data: RecipeInputType) => Promise<{ success: boolean; error?: string }>;
  initialData?: Partial<RecipeInputType>;
  onSuccess?: () => void;
}

export function RecipeForm({ onSubmit, initialData, onSuccess }: RecipeFormProps) {
  const [ingredients, setIngredients] = useState<Array<{ name: string; amount?: string }>>(
    initialData?.ingredients || [{ name: "", amount: "" }]
  );
  const [steps, setSteps] = useState<Array<{ order: number; text: string }>>(
    initialData?.steps || [{ order: 1, text: "" }]
  );
  const [buckets, setBuckets] = useState<string[]>(initialData?.buckets || []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecipeInputType>({
    resolver: zodResolver(RecipeInput),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
      timeMinutes: initialData?.timeMinutes,
      cuisine: initialData?.cuisine || "",
      ingredients: ingredients,
      steps: steps,
      buckets: buckets,
    },
  });

  const imageUrl = watch("imageUrl") || "";

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "" }]);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
    setValue("ingredients", newIngredients);
  };

  const updateIngredient = (index: number, field: "name" | "amount", value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
    setValue("ingredients", newIngredients);
  };

  const addStep = () => {
    const newSteps = [...steps, { order: steps.length + 1, text: "" }];
    setSteps(newSteps);
    setValue("steps", newSteps);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 }));
    setSteps(newSteps);
    setValue("steps", newSteps);
  };

  const updateStep = (index: number, text: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], text };
    setSteps(newSteps);
    setValue("steps", newSteps);
  };

  const onFormSubmit = async (data: RecipeInputType) => {
    const formData = {
      ...data,
      ingredients: ingredients.filter((ing) => ing.name.trim() !== ""),
      steps: steps.filter((step) => step.text.trim() !== ""),
      buckets,
    };

    const result = await onSubmit(formData);
    if (result.success) {
      toast.success("Recipe saved!");
      onSuccess?.();
    } else {
      toast.error(result.error || "Failed to save recipe");
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Title *</label>
        <input
          {...register("title")}
          className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Recipe title"
        />
        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          placeholder="Optional description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Photo</label>
        <PhotoUpload
          value={imageUrl}
          onChange={(url) => setValue("imageUrl", url || "")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Time (minutes)</label>
          <input
            type="number"
            {...register("timeMinutes", { valueAsNumber: true })}
            className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Cuisine</label>
          <input
            {...register("cuisine")}
            className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Italian"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Buckets *</label>
        <BucketSelector value={buckets} onChange={setBuckets} />
        {errors.buckets && <p className="text-sm text-red-500 mt-1">{errors.buckets.message}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Ingredients *</label>
          <button
            type="button"
            onClick={addIngredient}
            className="h-10 px-3 bg-accent text-accent-foreground rounded-lg flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ing, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(index, "name", e.target.value)}
                placeholder="Ingredient name"
                className="flex-1 px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="text"
                value={ing.amount || ""}
                onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                placeholder="Amount"
                className="w-32 px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="h-12 w-12 bg-card border border-border rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.ingredients && (
          <p className="text-sm text-red-500 mt-1">{errors.ingredients.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Steps *</label>
          <button
            type="button"
            onClick={addStep}
            className="h-10 px-3 bg-accent text-accent-foreground rounded-lg flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-2">
              <span className="h-12 w-12 flex items-center justify-center bg-card border border-border rounded-lg font-medium">
                {step.order}
              </span>
              <textarea
                value={step.text}
                onChange={(e) => updateStep(index, e.target.value)}
                placeholder="Step instructions"
                rows={2}
                className="flex-1 px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="h-12 w-12 bg-card border border-border rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.steps && <p className="text-sm text-red-500 mt-1">{errors.steps.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full py-4 bg-accent text-accent-foreground rounded-lg font-medium text-lg transition-colors min-h-[52px]",
          isSubmitting && "opacity-50 cursor-not-allowed"
        )}
      >
        {isSubmitting ? "Saving..." : "Save Recipe"}
      </button>
    </form>
  );
}

