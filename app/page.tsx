import Link from "next/link";
import { Plus, Lightbulb } from "lucide-react";
import Image from "next/image";
import { PageContainer } from "@/components/common/PageContainer";
import { Navbar } from "@/components/common/Navbar";

export default function Page() {
  return (
    <>
      <Navbar />
      <PageContainer className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo-light.png"
                alt="Sharon's Kitchen Logo"
                width={120}
                height={120}
                className="h-30 w-30"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Sharon&apos;s Kitchen
            </h1>
            <p className="text-lg text-foreground/70">
              Your personal recipe collection and meal suggestion companion
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
            <Link
              href="/recipes/new"
              className="group p-8 bg-card border border-border rounded-lg hover:border-accent transition-colors"
            >
              <Plus className="h-12 w-12 text-accent mb-4 mx-auto" />
              <h2 className="text-xl font-semibold mb-2">Add Recipe</h2>
              <p className="text-sm text-foreground/60">
                Record your favorite recipes with ingredients, steps, and photos
              </p>
            </Link>

            <Link
              href="/suggest"
              className="group p-8 bg-card border border-border rounded-lg hover:border-accent transition-colors"
            >
              <Lightbulb className="h-12 w-12 text-accent mb-4 mx-auto" />
              <h2 className="text-xl font-semibold mb-2">Suggest Meal</h2>
              <p className="text-sm text-foreground/60">
                Get personalized meal suggestions based on your preferences
              </p>
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-foreground/50">
              Track what you eat, balance your meals, and never wonder what to
              cook again.
            </p>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
