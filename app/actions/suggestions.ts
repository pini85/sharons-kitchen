"use server";

import { acceptSuggestion as acceptSuggestionLib, declineSuggestion as declineSuggestionLib } from "@/lib/suggestion";

export async function acceptSuggestion(recipeId: string, servedAt?: string, notes?: string) {
  try {
    const result = await acceptSuggestionLib(recipeId, servedAt, notes);
    return result;
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

