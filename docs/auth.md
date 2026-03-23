# Authentication

This application uses **Clerk** for authentication. All auth logic must go through Clerk's official helpers — never roll custom auth.

---

## Rules (Non-Negotiable)

1. **Clerk only** — Do not implement custom authentication or session management. Use Clerk's SDK exclusively.
2. **Server-side auth in Server Components** — Always use `auth()` from `@clerk/nextjs/server` to get the current user in Server Components and layouts.
3. **Redirect unauthenticated users** — Any page that requires authentication must redirect to `/sign-in` when no `userId` is present. Use Next.js `redirect()` for this.
4. **Never trust client-supplied userId** — Always derive `userId` from Clerk's server helper, never from URL params, request bodies, or client state.
5. **Middleware for route protection** — Use Clerk's middleware (`clerkMiddleware`) in `middleware.ts` to protect routes at the edge.

---

## Getting the Current User

### In Server Components (pages, layouts)

```ts
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // userId is now safe to use for data queries
}
```

### In Middleware

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

---

## Sign In / Sign Up Pages

Use Clerk's hosted components. Create the following routes:

```
src/app/sign-in/[[...sign-in]]/page.tsx
src/app/sign-up/[[...sign-up]]/page.tsx
```

```tsx
// src/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}
```

```tsx
// src/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <SignUp />;
}
```

---

## User Button / Auth UI

Use Clerk's `<UserButton />` component for displaying the signed-in user and sign-out controls. Do not build a custom user menu.

```tsx
import { UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <nav>
      {/* ... */}
      <UserButton />
    </nav>
  );
}
```

---

## What Is Forbidden

| Pattern | Why |
|---|---|
| Custom session tokens or JWT handling | Clerk manages sessions — don't duplicate or override |
| Reading `userId` from URL params or request body | Can be spoofed — always use `auth()` server helper |
| Fetching user data without a `userId` check | Security violation — see `data-fetching.md` |
| Client Components calling `auth()` | `auth()` is server-only; use `useAuth()` from `@clerk/nextjs` if client-side auth state is needed (display only, not for data access) |
| Hardcoded user IDs in queries | Always derive from Clerk at runtime |

---

## Environment Variables

Clerk requires the following environment variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

These must be set in `.env.local` and in the deployment environment. Never commit secret keys.
