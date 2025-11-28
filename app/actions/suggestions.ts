"use server";

import { acceptSuggestion as acceptSuggestionLib, declineSuggestion as declineSuggestionLib } from "@/lib/suggestion";

type AcceptSuggestionResult =
  | { success: true; nextSuggestionId: string | null }
  | { success: false; error: string; nextSuggestionId: null };

export async function acceptSuggestion(recipeId: string, servedAt?: string, notes?: string): Promise<AcceptSuggestionResult> {
  try {
    const result = await acceptSuggestionLib(recipeId, servedAt, notes);
    if (result.success) {
      return result;
    }
    return { success: false, error: "Failed to accept suggestion", nextSuggestionId: null };
  } catch (error) {
    console.error("Error accepting suggestion:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to accept suggestion", nextSuggestionId: null };
  }
}

export async function declineSuggestion(recipeId: string) {
  try {
    await declineSuggestionLib(recipeId);
    return { success: true };
  } catch (error) {
    console.error("Error declining suggestion:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to decline suggestion" };
  }
}

