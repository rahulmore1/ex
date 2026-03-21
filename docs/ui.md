# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI elements in this project.**

- Do not create custom UI components. If a UI element is needed, use the appropriate shadcn/ui component.
- Install shadcn/ui components via the CLI: `npx shadcn@latest add <component>`
- All shadcn/ui components live in `src/components/ui/` and should not be modified beyond the initial installation defaults unless strictly necessary.
- Compose pages and features by combining shadcn/ui primitives — do not build bespoke wrappers or abstractions on top of them.

## Date Formatting

All date formatting must use **date-fns**.

Dates must be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Oct 2023
```

Use `format` from `date-fns` with the `do MMM yyyy` format string:

```ts
import { format } from "date-fns";

format(new Date("2025-09-01"), "do MMM yyyy"); // "1st Sep 2025"
format(new Date("2025-08-02"), "do MMM yyyy"); // "2nd Aug 2025"
format(new Date("2023-10-03"), "do MMM yyyy"); // "3rd Oct 2023"
```

Do not use `Intl.DateTimeFormat`, `toLocaleDateString`, or any other date formatting utility.
