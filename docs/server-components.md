# Server Components

## Rules (Non-Negotiable)

1. **No `"use client"` directive** — Server Components must never include `"use client"`. Only move to a Client Component when you need interactivity (event handlers, hooks, browser APIs).
2. **`params` must be awaited** — In Next.js App Router, `params` is a Promise. Always `await` it before accessing any property.
3. **`auth()` must be awaited** — Clerk's `auth()` is async. Always `await` it and redirect to `/sign-in` if `userId` is absent.
4. **Data fetching via helpers only** — Never write inline `db.*` calls inside component files. All queries must go through helpers in `/src/data/`.
5. **No data fetching in Client Components** — All data fetching happens in Server Components. Pass data down as props to Client Components.

---

## `params` Must Be Awaited

In this Next.js project, `params` (and `searchParams`) are Promises and **must be awaited** before use.

### Type the prop correctly

```tsx
// CORRECT
interface PageProps {
  params: Promise<{ workoutid: string }>;
}

export default async function Page({ params }: PageProps) {
  const { workoutid } = await params;
}
```

```tsx
// WRONG — params is not a Promise here, will cause a type error and runtime warning
interface PageProps {
  params: { workoutid: string };
}

export default async function Page({ params }: PageProps) {
  const { workoutid } = params; // not awaited
}
```

### With `searchParams`

The same rule applies to `searchParams`:

```tsx
interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { q } = await searchParams;
}
```

---

## Standard Server Component Structure

Every page Server Component should follow this order:

1. Await `auth()` and redirect if unauthenticated
2. Await `params` / `searchParams`
3. Fetch data via `/src/data/` helpers (passing `userId`)
4. Handle not-found / empty states
5. Render markup and pass data to Client Components as props

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./EditWorkoutForm";

interface EditWorkoutPageProps {
  params: Promise<{ workoutid: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  // 1. Auth check
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 2. Await params
  const { workoutid } = await params;

  // 3. Fetch data
  const workout = await getWorkoutById(workoutid, userId);

  // 4. Not-found guard
  if (!workout) notFound();

  // 5. Render
  return (
    <EditWorkoutForm
      workoutId={workout.id}
      defaultName={workout.name}
      defaultStartedAt={workout.startedAt.toISOString()}
    />
  );
}
```

---

## What Is Forbidden

| Pattern | Why |
|---|---|
| `params.id` without awaiting | `params` is a Promise — accessing it directly returns `undefined` at runtime |
| `"use client"` on a data-fetching component | Moves fetching to the client; can't safely enforce `userId` |
| Inline `db.*` calls inside component files | All queries must live in `/src/data/` helpers |
| Fetching data in Client Components via `useEffect` | Bypasses server-side auth and data isolation |
| Skipping the `userId` check before fetching | Security violation — exposes other users' data |
