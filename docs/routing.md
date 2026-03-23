# Routing

All application routes live under `/dashboard`. The `/dashboard` segment and all sub-routes are protected — only authenticated users may access them.

---

## Rules (Non-Negotiable)

1. **All app routes under `/dashboard`** — Every feature route must be nested under `src/app/dashboard/`. There are no authenticated feature routes outside this segment.
2. **Route protection via middleware** — Use Clerk's `clerkMiddleware` in `middleware.ts` to protect the `/dashboard` segment at the edge. Do not rely solely on per-page `auth()` checks for route protection.
3. **`/dashboard` as the post-login destination** — After sign-in, redirect users to `/dashboard`. Set `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard` and `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`.
4. **Public routes are explicit opt-ins** — Only `/`, `/sign-in`, and `/sign-up` are public. Any new route is protected by default because the middleware guards all non-public paths.
5. **No per-page redirect as the only guard** — Server Components may still call `auth()` and redirect as a defense-in-depth measure (see `auth.md`), but this is secondary. Middleware is the primary enforcement point.

---

## Middleware Setup

```ts
// middleware.ts (project root)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

Any path that does not match `isPublicRoute` will be blocked by Clerk at the middleware layer before the page ever renders.

---

## Route Structure

```
src/app/
├── page.tsx                          # Public home page (/)
├── sign-in/[[...sign-in]]/page.tsx  # Public sign-in
├── sign-up/[[...sign-up]]/page.tsx  # Public sign-up
└── dashboard/
    ├── layout.tsx                    # Shared dashboard layout (nav, etc.)
    ├── page.tsx                      # /dashboard (main landing after login)
    └── [feature]/                    # All feature routes nested here
```

---

## Environment Variables

Add the following to `.env.local` to control post-auth redirects:

```
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## What Is Forbidden

| Pattern | Why |
|---|---|
| Feature routes outside `src/app/dashboard/` | Breaks the protected-route contract — middleware only guards known segments |
| Skipping middleware and relying only on per-page `auth()` | A misconfigured or missing check exposes the route; middleware is the first line of defense |
| Marking `/dashboard` or sub-routes as public in `isPublicRoute` | Removes protection for the entire authenticated section |
| Hardcoding redirect targets instead of using the Clerk env vars | Creates inconsistency if the post-login destination ever changes |
