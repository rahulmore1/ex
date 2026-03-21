# Data Mutations

## Rules (Non-Negotiable)

1. **Server Actions only** — All data mutations must be performed via Next.js Server Actions. Never mutate data from Client Components directly, Route Handlers, or inline in Server Components.
2. **Helper functions only** — All database write operations must go through helper functions in the `/src/data/` directory. Do not write inline Drizzle calls inside action files.
3. **Drizzle ORM only** — All mutations must use Drizzle ORM. Never write raw SQL strings.
4. **Typed params, no FormData** — Server Action parameters must be explicitly typed TypeScript types or interfaces. `FormData` must never be used as a parameter type.
5. **Zod validation** — Every Server Action must validate its arguments with Zod before touching the database.
6. **User data isolation** — Every mutation that touches user-owned data **must** verify `userId`. A user must only be able to mutate their own data. This is a security requirement.

---

## Directory Structure

```
src/
├── data/
│   ├── workouts.ts        # Workout queries AND mutations (createWorkout, deleteWorkout, etc.)
│   ├── exercises.ts       # Exercise mutations
│   └── sets.ts            # Set mutations
└── app/
    └── dashboard/
        └── workouts/
            ├── page.tsx
            └── actions.ts   # ← Server Actions colocated with the route
```

Server Actions live in `actions.ts` files colocated with the route segment they serve. Each action delegates database work to a helper in `/src/data/`.

---

## How to Add a Mutation

### Step 1 — Write a helper in `/src/data/`

Mutation helpers must:
- Accept `userId` as a required parameter for any user-scoped data
- Use Drizzle ORM (`db.insert()`, `db.update()`, `db.delete()`)
- Be `async` and return typed results inferred from the schema
- Never perform authorization — that is the action's responsibility

```ts
// src/data/workouts.ts
import { db } from "@/src/index";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(userId: string, name: string) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name })
    .returning();
  return workout;
}

export async function deleteWorkout(workoutId: string, userId: string) {
  // userId MUST be included — prevents a user from deleting another user's workout
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

export async function updateWorkout(
  workoutId: string,
  userId: string,
  data: { name: string }
) {
  const [updated] = await db
    .update(workouts)
    .set(data)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
  return updated ?? null;
}
```

### Step 2 — Write a Server Action in a colocated `actions.ts`

Actions must:
- Begin with `"use server"`
- Have explicitly typed parameters (no `FormData`)
- Validate all params with Zod before any database call
- Retrieve `userId` from Clerk's `auth()` and redirect to `/sign-in` if absent
- Delegate the actual DB operation to a `/src/data/` helper
- Call `revalidatePath` or `revalidateTag` after a successful mutation

```ts
// src/app/dashboard/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createWorkout, deleteWorkout, updateWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function createWorkoutAction(params: { name: string }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { name } = createWorkoutSchema.parse(params);

  await createWorkout(userId, name);
  revalidatePath("/dashboard/workouts");
}

const deleteWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
});

export async function deleteWorkoutAction(params: { workoutId: string }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { workoutId } = deleteWorkoutSchema.parse(params);

  await deleteWorkout(workoutId, userId);
  revalidatePath("/dashboard/workouts");
}

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
});

export async function updateWorkoutAction(params: {
  workoutId: string;
  name: string;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { workoutId, name } = updateWorkoutSchema.parse(params);

  await updateWorkout(workoutId, userId, { name });
  revalidatePath("/dashboard/workouts");
}
```

### Step 3 — Call the action from a Client Component

```tsx
// src/app/dashboard/workouts/NewWorkoutForm.tsx
"use client";

import { createWorkoutAction } from "./actions";

export function NewWorkoutForm() {
  async function handleSubmit(name: string) {
    await createWorkoutAction({ name });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const name = (e.currentTarget.elements.namedItem("name") as HTMLInputElement).value;
        handleSubmit(name);
      }}
    >
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  );
}
```

---

## What Is Forbidden

| Pattern | Why |
|---|---|
| `FormData` as a Server Action parameter type | Loses type safety; use typed params and Zod instead |
| Inline `db.insert/update/delete` calls inside `actions.ts` | All DB calls must live in `/src/data/` helpers |
| Raw SQL strings in mutations | Use Drizzle ORM methods instead |
| Skipping Zod validation | Arguments from the client are untrusted — always validate |
| Mutating without a `userId` filter on user-owned tables | Security violation — would allow cross-user data modification |
| Server Actions in files other than `actions.ts` | Actions must be colocated in a file named `actions.ts` |
| Route Handlers (`app/api/*/route.ts`) for mutations | Use Server Actions instead |

---

## Zod Validation Requirements

Every Server Action must define a Zod schema for its parameters and call `.parse()` (which throws on invalid input) before any database operation.

- Define one schema per action, named `<actionName>Schema`
- Use `.parse()`, not `.safeParse()`, so invalid input throws and halts execution
- Validate all fields, including IDs — use `z.string().uuid()` for UUID identifiers

```ts
// CORRECT
const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
});
const { name } = createWorkoutSchema.parse(params);

// WRONG — no validation
export async function createWorkoutAction(params: { name: string }) {
  await createWorkout(userId, params.name); // params.name is unvalidated client input
}
```

---

## User Data Isolation

Every mutation against a user-owned table must scope the operation to the authenticated user's `userId`. Pass `userId` to the `/src/data/` helper and include it in the `where` clause.

```ts
// CORRECT — scoped to the authenticated user
.where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))

// WRONG — allows any user to mutate any row
.where(eq(workouts.id, workoutId))
```

For nested data (`workout_exercises`, `sets`), resolve the parent workout first using a userId-checked helper, then mutate the child row — or join through `workouts` and filter by `userId` in the mutation itself.
