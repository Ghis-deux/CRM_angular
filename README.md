# Contact CRM

A complete, local-first mini CRM built with Angular. It manages a base of contacts and categories entirely in the browser — no external API, no database. All data is persisted in `localStorage`, so a page refresh never loses anything.

## Project Description

Contact CRM is a single-page application that demonstrates a clean, modular and strongly-typed Angular architecture. It provides:

- **Dashboard** — global statistics (total contacts, favorites, categories, uncategorized), the latest additions and a per-category breakdown.
- **Contacts** — full CRUD with a strictly validated Reactive Form, favorite toggling, filtering (search by name, by category, favorites only) and sorting (name A–Z / Z–A, date newest / oldest).
- **Categories** — full CRUD with a color picker; a category cannot be deleted while it still contains contacts (clear error message).
- **Favorites** — a dedicated view listing every favorite contact.
- **UX essentials** — confirmation dialogs before every deletion, toast notifications, unsaved-changes protection on forms, empty states and a responsive layout built with plain CSS only.

## Technologies

- [Angular 22](https://angular.dev) (standalone components, signals, zoneless change detection)
- TypeScript (strict mode, no `any`)
- Angular Router (lazy-loaded routes, resolvers, guards, route titles)
- Reactive Forms with custom validators
- ESLint (angular-eslint) + Prettier
- No external UI library — all components and styles are hand-written

## Installation

Prerequisites: [Node.js](https://nodejs.org) 20.19+ or 22.12+ and npm.

```bash
npm install
```

## Run the Project

```bash
npm start        # or: npm run dev
```

Then open [http://localhost:4200](http://localhost:4200) in your browser.

Other useful scripts:

```bash
npm run build    # production build (output in dist/)
npm test         # unit tests (Vitest)
npm run lint     # ESLint
npm run format   # Prettier (write)
```

## Architecture & Design Choices

The project follows a layered, feature-oriented structure:

```
src/app/
├── core/                    # Domain layer, framework-agnostic
│   ├── models/              # Strictly typed interfaces (Contact, Category) & payloads
│   ├── services/            # StorageService, ContactService, CategoryService,
│   │                        # ConfirmService, ToastService
│   ├── validators/          # Custom Reactive Forms validators (email, phone, notBlank)
│   ├── pipes/               # initials, categoryName, timeAgo
│   ├── directives/          # appHighlight (safe search highlighting), appAutofocus
│   ├── guards/              # unsavedChangesGuard (CanDeactivateFn)
│   ├── resolvers/           # contactResolver, categoryResolver (unknown id -> redirect)
│   ├── data/                # Seed data used on first launch
│   └── utils/               # UUID-like id generator
├── features/                # Independent feature areas (lazy-loaded)
│   ├── dashboard/
│   ├── contacts/            # list, detail, shared create/edit form
│   ├── categories/          # list, detail, shared create/edit form
│   └── favorites/
├── layout/                  # Header and Footer, common to every page
└── shared/                  # Reusable UI: ContactCard, ConfirmDialog, ToastContainer
```

Key decisions:

- **Persistence** — `StorageService` is the only place that touches `localStorage` (serialization, parse errors and write failures are handled centrally). `ContactService` and `CategoryService` expose signal-based, write-through state, so swapping localStorage for an HTTP backend later only requires changing one service.
- **State** — Angular signals everywhere (`signal`, `computed`, `input`, `output`) with `ChangeDetectionStrategy.OnPush` and zoneless change detection: filtering, sorting and statistics are derived reactively.
- **Routing** — each feature is lazy-loaded via `loadComponent`. `withComponentInputBinding` feeds resolved entities (`contact`, `category`) directly into component inputs. Resolvers redirect to the list with an explicit message when an id does not exist; a `CanDeactivate` guard protects unsaved form changes.
- **Forms** — Reactive Forms only, with custom validators (`emailFormat`, `phoneFormat`, `notBlank`), inline error messages and `markAllAsTouched` on invalid submit.
- **Typing** — `strict: true`, dedicated payload types (`ContactPayload`, `CategoryPayload`), no `any` (enforced by ESLint), exhaustive switch on sort options.
- **UI** — hand-crafted CSS with design tokens (CSS custom properties), dynamic category colors via `color-mix()`, responsive grid layout, and accessible markup (labels, `aria-*` attributes, keyboard-friendly dialogs).

## Author

Built as a technical demonstration of a modern, modular Angular architecture.
