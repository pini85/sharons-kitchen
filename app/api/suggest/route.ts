import { suggestNext } from "@/lib/suggestion";
import { listRecipes } from "@/app/actions/recipes";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get('exclude');
    
    const suggestionId = await suggestNext(excludeId || undefined);
    if (!suggestionId) {
      return NextResponse.json({ recipe: null });
    }

    const result = await listRecipes();
    if (!result.success || !result.data) {
      return NextResponse.json({ recipe: null });
    }

    const recipe = result.data.find((r) => r.id === suggestionId) ?? null;
    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Error getting suggestion:", error);
    return NextResponse.json({ recipe: null }, { status: 500 });
  }
}

