"use server";

import { db } from "@/lib/db";
import { PreferencesInput, type PreferencesInputType } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getPreferences() {
  try {
    let prefs = await db.preferences.findFirst();
    if (!prefs) {
      // Create default preferences if none exist
      prefs = await db.preferences.create({
        data: {},
      });
    }
    return { success: true, data: prefs };
  } catch (error) {
    console.error("Error getting preferences:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to get preferences" };
  }
}

export async function updatePreferences(data: PreferencesInputType) {
  try {
    const validated = PreferencesInput.parse(data);

    let prefs = await db.preferences.findFirst();
    if (prefs) {
      prefs = await db.preferences.update({
        where: { id: prefs.id },
        data: validated,
      });
    } else {
      prefs = await db.preferences.create({
        data: validated,
      });
    }

    revalidatePath("/settings");
    revalidatePath("/suggest");
    return { success: true, data: prefs };
  } catch (error) {
    console.error("Error updating preferences:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update preferences" };
  }
}

