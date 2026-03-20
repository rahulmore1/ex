# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm start        # Run production build
npm run lint     # Run ESLint
```

No test framework is configured yet.

## Architecture

This is a **Next.js 16 App Router** project with TypeScript and Tailwind CSS v4.

- `src/app/` — All routes and layouts using the App Router convention
  - `layout.tsx` — Root layout (HTML shell, Geist fonts, global CSS)
  - `page.tsx` — Home route (`/`)
  - `globals.css` — Global styles and Tailwind imports
- `public/` — Static assets served at the root path

**Path alias:** `@/*` maps to `./src/*` (configured in `tsconfig.json`).

**Styling:** Tailwind CSS v4 via PostCSS. Dark mode is handled with CSS media queries and CSS custom properties in `globals.css`.

This is a fresh boilerplate — no API routes, database, or auth are set up yet.

## Important: Documentation First

**Before generating any code**, always refer to the relevant documents in the `/docs` directory. These documents contain project-specific requirements, design decisions, and conventions that must be followed. Check `/docs` for any documentation related to the feature or area you are working on before writing or modifying code.

- /docs/ui.md
