"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Trash2, UtensilsCrossed } from "lucide-react";
import { deleteMeal } from "@/app/actions/meals";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion";

interface MealListProps {
  meals: Array<{
    id: string;
    date: Date;
    servedAt?: string | null;
    notes?: string | null;
    recipe: {
      id: string;
      title: string;
      imageUrl?: string | null;
      timeMinutes?: number | null;
      buckets: Array<{ bucket: { name: string } }>;
    };
  }>;
}

export function MealList({ meals }: MealListProps) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meal?")) return;

    const result = await deleteMeal(id);
    if (result.success) {
      toast.success("Meal deleted");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete meal");
    }
  };

  if (meals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground/60 mb-4">No meals logged yet</p>
        <p className="text-sm text-foreground/50">
          Accept a suggestion or manually log a meal to see it here.
        </p>
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
      {meals.map((meal) => (
        <motion.div
          key={meal.id}
          variants={fadeInUp}
          className="bg-card border border-border rounded-lg overflow-hidden"
        >
          <Link href={`/recipes/${meal.recipe.id}`} className="flex gap-4 p-4 hover:bg-accent/5 transition-colors">
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-border">
              {meal.recipe.imageUrl ? (
                <Image
                  src={meal.recipe.imageUrl}
                  alt={meal.recipe.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-foreground/20">
                  <UtensilsCrossed className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1">{meal.recipe.title}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/60 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(meal.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                {meal.servedAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{meal.servedAt}</span>
                  </div>
                )}
                {meal.recipe.buckets.length > 0 && (
                  <div className="flex gap-1">
                    {meal.recipe.buckets.map((b) => (
                      <span
                        key={b.bucket.name}
                        className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs"
                      >
                        {b.bucket.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {meal.notes && (
                <p className="text-sm text-foreground/70 line-clamp-2">{meal.notes}</p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDelete(meal.id);
              }}
              className="h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors flex-shrink-0"
              aria-label="Delete meal"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

