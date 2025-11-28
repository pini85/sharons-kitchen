import { suggestNext } from "@/lib/suggestion";
import { listRecipes } from "@/app/actions/recipes";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const suggestionId = await suggestNext();
    if (!suggestionId) {
      return NextResponse.json({ recipe: null });
    }

    const result = await listRecipes();
    if (!result.success) {
      return NextResponse.json({ recipe: null });
    }

    const recipe = result.data.find((r) => r.id === suggestionId);
    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Error getting suggestion:", error);
    return NextResponse.json({ recipe: null }, { status: 500 });
  }
}

