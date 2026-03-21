# Data Fetching

## Rules (Non-Negotiable)

1. **Server Components only** — All data fetching must happen in React Server Components. Never fetch data in Client Components, Route Handlers, Server Actions, or anywhere else.
2. **Helper functions only** — All database queries must go through helper functions in the `/src/data/` directory. Do not write inline queries in components.
3. **Drizzle ORM only** — All queries must use Drizzle ORM. Never write raw SQL strings.
4. **User data isolation** — Every query that touches user-owned data **must** filter by `userId`. A logged-in user must only ever be able to access their own data. This is a security requirement.

---

## Directory Structure

```
src/
└── data/
    ├── workouts.ts        # Workout queries (getWorkoutsForUser, getWorkoutById, etc.)
    ├── exercises.ts       # Exercise library queries
    └── sets.ts            # Set queries
```

---

## How to Add a Data Fetch

### Step 1 — Write a helper in `/src/data/`

Helper functions must:
- Accept `userId` as a required parameter for any user-scoped data
- Always filter by `userId` when querying user-owned tables (`workouts`, etc.)
- Use Drizzle ORM (`db.query.*` or `db.select().from(...)`)
- Be `async` and return typed results inferred from the schema

```ts
// src/data/workouts.ts
import { db } from "@/src/index";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

export async function getWorkoutById(workoutId: string, userId: string) {
  // userId MUST be included — prevents a user from accessing another user's workout
  const result = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  return result[0] ?? null;
}
```

### Step 2 — Call the helper from a Server Component

Server Components can be `async`. Get the current user via Clerk's `auth()` server helper, then call the data helper.

```tsx
// src/app/dashboard/page.tsx  ← NO "use client" directive
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutsForUser } from "@/data/workouts";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const workouts = await getWorkoutsForUser(userId);

  return (
    <div>
      {workouts.map((w) => (
        <div key={w.id}>{w.name}</div>
      ))}
    </div>
  );
}
```

---

## What Is Forbidden

| Pattern | Why |
|---|---|
| `"use client"` + `fetch` / `useEffect` for data | Exposes data fetching to the client; can't safely enforce userId |
| Route Handlers (`app/api/*/route.ts`) for reading data | Unnecessary indirection; server components can query directly |
| Raw SQL strings (`sql\`SELECT * FROM workouts\``) | Use Drizzle ORM methods instead |
| Inline `db.select()` calls inside component files | All queries must live in `/src/data/` helpers |
| Querying without a `userId` filter on user-owned tables | Security violation — would allow cross-user data access |

---

## User Data Isolation

The `workouts` table has a `userId` column (mapped from Clerk's user ID). Every query against this table **must** include a `where` clause filtering by `userId`.

**Every** data helper for user-owned data must follow this pattern:

```ts
// CORRECT — always scoped to the authenticated user
.where(eq(workouts.userId, userId))

// WRONG — never query without userId filter
.where(eq(workouts.id, workoutId))  // missing userId check!
```

For related data (e.g. `workout_exercises`, `sets`), scope access by joining to `workouts` and filtering by `userId` there, or by resolving the parent workout first with a userId-checked helper before fetching children.

---

## Database Client

The Drizzle database client is exported from `src/index.ts`:

```ts
import { db } from "@/src/index";
```

It connects to Neon PostgreSQL via the HTTP adapter. It is a server-only module and must never be imported in Client Components.

---

## Schema Reference

See `src/db/schema.ts` for table definitions. Key tables:

| Table | User-scoped? | userId column |
|---|---|---|
| `workouts` | Yes | `userId` |
| `exercises` | No (global library) | — |
| `workout_exercises` | Via `workouts` join | — |
| `sets` | Via `workout_exercises` join | — |
