# AGENT_TODO.md — Sharon’s Kitchen (Mobile‑First Recipe & Meal Suggestion App)

## 0) Problem & Product Goal (for the agent to keep in mind)
**Pain:** We cook a lot of dishes but struggle daily with “what should we eat?”. We forget what we’ve made, can’t balance meat/fish/chicken/vegan through the week, and decision fatigue sets in at mealtime.

**Goal:** A warm, family‑friendly mobile‑first app that:
- Lets us **record recipes** (title, image, ingredients, steps, buckets/categories).
- Tracks **what we ate** each day.
- Applies **weekly preferences** (e.g., chicken 3×/week, meat 1×, vegan 2×, fish 1×) and a **cooldown** window to **suggest** what to eat next.
- Provides a **single-tap suggestion flow**: Accept → logs meal, Decline → shows next suggestion.
- Is deployable on **Vercel** with **Neon Postgres** via **Prisma**, styled with **Tailwind + shadcn/ui**, animated with **Framer Motion**, and supports **Cloudinary** image uploads.
- **Mobile-first** with a bottom tab bar and large tap targets.

---

## 1) Global Guardrails for the Agent
- **Mobile-first** always: prioritize small screen layout, large touch targets (≥44px), sticky actions.
- **Safety:** Do not print secrets; all credentials must come from `.env` or Vercel env.
- **Atomic tasks:** Each task must produce tangible files or code; verify with acceptance criteria.
- **Use Server Actions** where possible; prefer App Router idioms.
- **Warm Organic theme**: use existing Tailwind tokens (bg/fg/card/border/accent).
- **Libraries assumed installed**: `shadcn/ui`, `next-themes`, `framer-motion`, `react-hook-form`, `zod`, `cloudinary`/`next-cloudinary`, `react-hot-toast`, Tailwind plugins.

---

## 2) Phase Map (Do in order)
1. **Project sanity** → 2. **Theme & Layout** → 3. **DB & Prisma** → 4. **Validation** → 5. **Server Actions** → 6. **Uploads** → 7. **Core Components** → 8. **Pages & Flows** → 9. **Suggestion Engine** → 10. **QA & Polish** → 11. **Deploy**

---

## 3) Detailed Tasks (step‑by‑step with outputs & acceptance)

### Task 1 — Project Sanity
**Purpose:** Ensure environment, paths, and mobile meta are correct before generating features.  
**Actions:**
- Verify `node -v` ≥ 20.19 and `DATABASE_URL` exists in `.env` (pooled Neon URL).  
- Ensure Tailwind tokens are present in `app/globals.css` and color aliases in `tailwind.config.ts`.  
- Add viewport meta for mobile.
**Files to create/update:**
- `app/layout.tsx` (will be created in Task 2).  
**Acceptance:**
- `npm run dev` renders a blank page without errors and uses the warm palette.

---

### Task 2 — Base Layout, Theme Provider, Toasts & Motion
**Purpose:** Global shell shared across pages.  
**Actions:**
- Implement `next-themes` provider, Framer Motion page transitions, React Hot Toast provider, and global containers.  
- Add `BottomNav` placeholder for mobile tabs.
**Files:**
- `app/layout.tsx`
- `components/common/ThemeToggle.tsx`
- `components/common/BottomNav.tsx`
- `lib/motion.ts` (motion presets)
**Acceptance:**
- Dark mode toggle works.
- Bottom tab bar visible on mobile.

---

### Task 3 — Prisma Setup & Schema
**Purpose:** Persist recipes, buckets, ingredients, steps, meals, preferences.  
**Actions:**
- Create `prisma/schema.prisma` using the provided models.
- Run `npx prisma db push` and `npx prisma generate`.
**Files:**
- `prisma/schema.prisma`
**Acceptance:**
- Prisma generates without errors; DB tables exist in Neon.

**Schema (paste as-is):**
```prisma
model Recipe {
  id           String                 @id @default(cuid())
  title        String
  description  String?
  imageUrl     String?
  timeMinutes  Int?
  cuisine      String?
  isFavorite   Boolean                @default(false)
  steps        Step[]
  ingredients  IngredientOnRecipe[]
  buckets      BucketOnRecipe[]
  createdAt    DateTime               @default(now())
  updatedAt    DateTime               @updatedAt
}

model Step {
  id        String   @id @default(cuid())
  order     Int
  text      String
  recipeId  String
  recipe    Recipe   @relation(fields: [recipeId], references: [id])
}

model Ingredient {
  id        String                @id @default(cuid())
  name      String                @unique
  recipes   IngredientOnRecipe[]
}

model IngredientOnRecipe {
  recipeId     String
  ingredientId String
  amount       String?
  recipe       Recipe      @relation(fields: [recipeId], references: [id])
  ingredient   Ingredient  @relation(fields: [ingredientId], references: [id])
  @@id([recipeId, ingredientId])
}

model Bucket {
  id       String           @id @default(cuid())
  name     String           @unique  // meat, fish, chicken, vegan
  recipes  BucketOnRecipe[]
}

model BucketOnRecipe {
  recipeId String
  bucketId String
  recipe   Recipe @relation(fields: [recipeId], references: [id])
  bucket   Bucket @relation(fields: [bucketId], references: [id])
  @@id([recipeId, bucketId])
}

model Meal {
  id         String   @id @default(cuid())
  recipeId   String
  date       DateTime @default(now())
  servedAt   String?
  notes      String?
  recipe     Recipe   @relation(fields: [recipeId], references: [id])
}

model Preferences {
  id              String   @id @default(cuid())
  meatPerWeek     Int      @default(1)
  fishPerWeek     Int      @default(1)
  chickenPerWeek  Int      @default(3)
  veganPerWeek    Int      @default(2)
  cooldownDays    Int      @default(5)
  updatedAt       DateTime @updatedAt
}
```

---

### Task 4 — Prisma Client Helper
**Purpose:** Single shared Prisma client, dev‑safe.  
**Files:**
- `lib/db.ts`
**Contents:**
```ts
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```
**Acceptance:** Any import from `lib/db` works server‑side.

---

### Task 5 — Validation Schemas (Zod)
**Purpose:** Type‑safe forms & server actions.  
**Files:**
- `lib/validators.ts`
**Contents:**
```ts
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
```
**Acceptance:** Forms can use these types; invalid data rejected.

---

### Task 6 — Server Actions (CRUD + Preferences)
**Purpose:** Core data flows without client fetch boilerplate.  
**Files:**
- `app/actions/recipes.ts`
- `app/actions/meals.ts`
- `app/actions/preferences.ts`
**Minimum APIs:**
- `createRecipe(data)`, `updateRecipe(id,data)`, `deleteRecipe(id)`, `listRecipes(filters?)`
- `logMeal(recipeId, servedAt?, notes?)`, `listMeals(range?)`
- `getPreferences()`, `updatePreferences(data)`
**Acceptance:** Actions run on server; Prisma calls succeed; errors toast on UI.

---

### Task 7 — Cloudinary Upload Wiring
**Purpose:** Optional recipe photo with minimal friction.  
**Files:**
- `components/recipes/PhotoUpload.tsx` using `next-cloudinary`’s widget
- Add env keys locally; never hardcode
**Acceptance:** Selecting an image yields a hosted URL saved with the recipe.

---

### Task 8 — Core UI Components (mobile‑first)
**Files:**
- `components/common/Navbar.tsx`
- `components/common/BottomNav.tsx`
- `components/common/PageContainer.tsx`
- `components/recipes/RecipeCard.tsx`
- `components/recipes/IngredientChips.tsx`
- `components/recipes/BucketSelector.tsx` (meat/fish/chicken/vegan)
- `components/recipes/RecipeForm.tsx` (RHF + Zod + PhotoUpload)
- `components/suggest/SuggestCard.tsx`
- `components/suggest/SuggestionControls.tsx` (Accept / Decline / Another)
**Acceptance:**
- All components render on mobile; controls are ≥44px; dark mode looks good.

---

### Task 9 — Pages & Routes
**Files:**
- `app/page.tsx` — Home/hero + big buttons “Add Recipe”, “Suggest Meal”
- `app/(routes)/recipes/page.tsx` — searchable list (by title/bucket)
- `app/(routes)/recipes/new/page.tsx` — full create form
- `app/(routes)/recipes/[id]/page.tsx` — details + edit
- `app/(routes)/suggest/page.tsx` — single-card suggestion flow
- `app/(routes)/settings/page.tsx` — sliders/inputs for weekly targets + cooldown
- `app/(routes)/history/page.tsx` — meals eaten (reverse chrono)
**Acceptance:** Navigation via BottomNav; flows work end-to-end with server actions.

---

### Task 10 — Suggestion Engine v1
**Purpose:** Balance weekly targets and avoid repeats.  
**Files:**
- `lib/suggestion.ts`
**Algorithm (implement as pure functions):**
1. Determine current week range.  
2. Count meals per bucket within the week.  
3. Compute `deficit = target - consumed` for each bucket.  
4. Filter recipes eaten within `cooldownDays`.  
5. Rank candidates: highest bucket deficit → not recently eaten → favorites → shorter time on weekdays.  
6. Export `suggestNext()`, `declineSuggestion(id)`, `acceptSuggestion(id)`.**Acceptance:** Calling `suggestNext()` returns a valid recipe ID respecting constraints.

---

### Task 11 — Motion & Polish
**Purpose:** Premium feel with minimal code.  
**Actions:**
- Page fade transitions via Framer Motion layout wrapper.
- Staggered reveal for lists/cards.
- Lenis smooth scroll on long lists.
- Toasts for create/update/delete; skeletons for loading.
**Acceptance:** Smooth transitions; no layout jank; passes Lighthouse performance on mobile.

---

### Task 12 — QA Checklist
- All pages responsive at 320–768px width.  
- Forms validate and submit; Cloudinary uploads persist image URL.  
- Preferences update; meals log on accept; history displays correctly.  
- Dark/light modes look consistent; colors meet contrast AA.  
- No secrets in code; `.env` untracked.  
- `npm run build` passes; Prisma generate works.

---

### Task 13 — Deploy
**Actions:**
- Ensure Vercel env has `DATABASE_URL` (pooled Neon).  
- `npx prisma generate && npx prisma db push`.  
- Connect repo → Vercel; deploy.  
**Acceptance:** Live app functional; suggestion flow operational; images render.

---

## 4) Prompts for the Agent (copy blocks as needed)

**Generate Base Layout & Providers**
> Create `app/layout.tsx` using `next-themes`, `react-hot-toast` provider, and a Framer Motion page wrapper from `lib/motion.ts`. Include a sticky `BottomNav` for mobile and apply the warm organic Tailwind tokens. Add mobile viewport meta.

**Generate Prisma Schema & Client**
> Create `prisma/schema.prisma` exactly as specified, run Prisma generate, and create `lib/db.ts` singleton client. Do not leak env vars.

**Generate Recipe Form**
> Create `components/recipes/RecipeForm.tsx` using React Hook Form + Zod, fields: title, description, timeMinutes, cuisine, ingredient chips (name, amount), step list (order,text), bucket selector (meat/fish/chicken/vegan), and optional PhotoUpload via Cloudinary. On submit, call a server action `createRecipe`.

**Generate Suggestion Engine**
> Implement `lib/suggestion.ts` with pure helpers to compute weekly deficits, filter recent meals by cooldownDays, and rank candidates. Export `suggestNext`, `declineSuggestion`, `acceptSuggestion` (the latter logs a Meal and returns the next suggestion).

**Wire Server Actions**
> Implement `app/actions/recipes.ts`, `app/actions/meals.ts`, `app/actions/preferences.ts` using Prisma and the Zod validators. Return typed results; handle errors with toasts.

---

## 5) Success Criteria (Definition of Done for v1)
- Add/edit/delete recipes with image, ingredients, steps, and buckets.
- Weekly preferences and cooldown stored and respected.
- Accept/Decline suggestion loop works and logs meals.
- Mobile-first UX with bottom navigation and large tap targets.
- Theming matches warm organic palette in both light and dark.
- Deployed on Vercel with Neon; no runtime errors.

