# Dahab Admin Dashboard — Phase 1 Design Spec

**Date:** 2026-10-20
**Status:** Approved 2026-10-21
**Owner:** dashboard (the storefront and the backend are separate projects with their own owners)

**Sources**
- Planning record: `docs/dahab-dashboard-planning.md` (full history of every decision and why).
- Design: the dashboard screenshots (`docs/design/screenshots/`), the logos (`docs/design/logos/`) and the storefront design system (`desing.png`, kept outside the repo in the client's asset folder). There is no Figma.
- Backend: `docs/backend-architecture.md` (the shared backend for the dashboard and the storefront) and the live Swagger spec at `http://167.71.141.187/api/docs-json` (snapshot: `docs/backend-openapi.json`).

Visual adjustments are expected once the site runs; this spec fixes structure and behaviour, not pixels.

---

## 1. Scope

**In phase 1**
- Sign in, forgot password, welcome screen.
- Items (المنتجات): list with inline price and availability edits, create/edit drawer.
- Categories: list with inline name edits, reorder, on/off, create, delete.
- Home banners: grid, reorder, visible on/off, create/edit drawer with live preview.
- Team & access: members and roles.
- Arabic and English, right-to-left and left-to-right, desktop and phone.

**Not in phase 1:** Overview, Orders, Customers, Delivery & offers, Social & contact (kept in the navigation config, hidden) · branches and per-branch inventory screens · two-factor sign-in · members changing their own password · a no-access page and an error page (see 4.4) · "Sold this week" (needs orders).

**Client bar:** seamless, smooth, clean, fast; premium, nothing flashy; mobile must work flawlessly.

---

## 2. Stack

| Area | Choice |
|---|---|
| Framework / build | Vue 3.5 · Vite 8 · TypeScript (strict) + `vue-tsc` |
| Package manager | npm |
| Scaffold | create-vue |
| Styling | Tailwind CSS v4 |
| Accessible behaviour | Reka UI |
| Icons | Lucide (`@lucide/vue`) |
| Routing | Vue Router 5 (routes defined per feature, not file-based) |
| Server data | By hand in composables, no data-fetching library (decided 2026-10-21) |
| Shared state | Pinia: the locale and the signed-in user |
| HTTP | axios |
| API types | Written by hand in `types/` from the backend reference (decided 2026-10-21) |
| Forms / validation | VeeValidate 4.15 · Zod 3 · `@vee-validate/zod` (decided 2026-10-21: VeeValidate 5 is still beta; move to v5 + Zod 4 once it's stable) |
| Translation | vue-i18n · dates and numbers via `Intl` |
| Utilities | VueUse |
| Mocking | MSW v3 in unit and component tests only; Playwright `page.route()` in end-to-end tests (decided 2026-10-22: the backend now has every route phase 1 uses) |
| Tests | Vitest + Vue Testing Library · Playwright |
| Lint / format | ESLint (flat config) + Prettier + prettier-plugin-tailwindcss |
| Error monitoring | Sentry (free tier) |

**Containment rule:** each library is imported in one place only — Reka UI and Lucide in `components/base`, axios in `services/http.ts`, MSW in `mocks`, Sentry in `plugins/sentry.ts`.

---

## 3. Architecture

### 3.1 Folder structure

Organised by file type, with a feature subfolder inside each type folder.

```
dahab-dashboard/
├─ docs/                # this spec, the implementation plan
├─ e2e/                 # Playwright
├─ public/              # static files (favicon)
└─ src/
   ├─ main.ts           # start-up, global error handler (toast), http hooks wiring
   ├─ App.vue
   ├─ views/            # route pages, thin
   │  ├─ auth/LoginView.vue · auth/ForgotPasswordView.vue
   │  ├─ WelcomeView.vue
   │  ├─ items/ItemsView.vue · items/ItemEditView.vue      # drawer routes /items/new, /items/:id
   │  ├─ categories/CategoriesView.vue
   │  ├─ banners/BannersView.vue · banners/BannerEditView.vue
   │  ├─ team/TeamView.vue (+ thin drawer views for members and roles)
   │  ├─ NotFoundView.vue
   │  └─ dev/KitView.vue                                  # development only
   ├─ components/
   │  ├─ base/          # the component kit (section 6.4)
   │  ├─ layout/        # LayoutDashboard, LayoutSidebar, LayoutSidebarFooter, LayoutMobileNav, LayoutPageHeader
   │  └─ auth/ · items/ · categories/ · banners/ · team/
   ├─ composables/
   │  ├─ auth/ · items/ · categories/ · banners/ · team/
   │  └─ common/
   ├─ services/         # http.ts, errors.ts, <feature>.service.ts
   ├─ stores/           # Pinia: locale.ts, session.ts (the signed-in user)
   ├─ schemas/          # Zod: common.schema.ts + one per feature
   ├─ types/            # one per feature, written from the backend reference
   ├─ router/           # index.ts, guards.ts, routes/<feature>.ts, routes/dev.ts (dev only)
   ├─ i18n/             # setup + locales/ar.json, en.json
   ├─ plugins/          # sentry
   ├─ utils/            # money, dates, localized text, digits
   ├─ constants/        # navigation.ts (incl. hidden out-of-scope items)
   ├─ config/env.ts
   ├─ mocks/            # test-only: MSW server and response helpers
   └─ assets/           # styles/ (main.css, tokens.css), fonts/, logos/
```

### 3.2 Layers and import rules

Data flows one way: **view → component → composable → service → `http.ts` → backend**.

| Folder | May import | Must never import |
|---|---|---|
| `views` | components, composables | services |
| `components/<feature>` | `components/base`, composables, stores, types, utils | services |
| `components/base` | utils | feature code, stores |
| `composables` | services, stores, schemas, types, utils | components |
| `stores` | types | services, composables, components (state only; composables do the fetching) |
| `services` | `http.ts`, types | composables, components, stores, router |
| `schemas` · `types` · `utils` | each other | anything Vue |
| `mocks` | types | — (imported only by tests) |

Feature dependencies: banners → items, categories · items → categories · everything → auth. No cycles.

`services/http.ts` never imports the router or auth: it exposes `onUnauthorized()` and `onForbidden()` hooks, wired in `main.ts`.

### 3.3 Naming (Vue style guide)

PascalCase component files · multi-word names · `Base` prefix for the kit · children prefixed with their parent's name (`ItemsList` → `ItemsListItem`) · general word first (`ItemEditDrawer`) · full words · full names inside feature folders · composables `useX.ts`; other files `feature.type.ts`.

### 3.4 Data

- **Server data is loaded by hand**; there's no data-fetching library.
  - Each screen's composable holds its data, loading and error state in refs, loads on mount and exposes `reload()`.
  - A failed load shows Retry. Nothing retries automatically.
  - A drawer fetches its own record by ID.
- **Pinia** holds the locale and the signed-in user (`/me`). The user is the only server data shared across the app.
- Where a screen can fire overlapping requests, the composable cancels the older one (`AbortController`), so a late response never overwrites a newer one.
- Lists are loaded whole (`limit=500`, the backend's maximum) and filtered and sorted in the browser.
- Inline edits update the local data immediately and roll back on failure.

### 3.5 Routing

- Every route is lazy-loaded. Drawers have their own URL, so refresh, sharing and the phone's back button work.
- Guards, in order: wait for the start-up check → not signed in → `/login` (remember the destination; only dashboard paths accepted) → Team & access without permission → welcome screen → unknown URL → 404.
- `/dev/kit` is registered only in development.

---

## 4. Sign-in, sessions and permissions

### 4.1 Tokens

- The backend returns an **access token** and a **refresh token** in the response body.
- The access token lives **in memory only** and is sent as `Authorization: Bearer …` on **every** request. (Catalog routes are shared with the storefront: a request without a token gets the store's view.)
- The refresh token is stored in the browser: `localStorage` with "Keep me signed in", `sessionStorage` without.
- On a 401, `http.ts` calls `POST /auth/refresh` once (concurrent requests wait for it) and retries; if refresh fails, the session-expired dialog opens. Every refresh returns a **new refresh token too** (rotation), so the stored one is replaced each time; that's why refreshing must never run twice in parallel.
- **Session length, enforced by the dashboard within the backend's own token lifetimes:** 12 h without activity, or 30 days with "Keep me signed in". "Keep me signed in" is off by default.
- Trade-off accepted: a script injected into the page could read the stored refresh token. Mitigations: strict Content Security Policy, no `v-html`, dependency hygiene (section 7).

### 4.2 Flows

1. **Start-up:** splash (only if it takes over 0.2 s) → refresh → `GET /me` → apply the account's language → open the requested page; otherwise `/login`.
2. **Sign in:** "Email or username" + password (Show) + "Keep me signed in" → `POST /auth/login` (`identifier`, `password`, `deviceType: 'web'`, `deviceName` from the browser, e.g. "Chrome on Windows"). Errors: one generic message for wrong details; a suspended account says so; too many attempts says when to try again. A language switched on the login page is saved to the account.
3. **Forgot password:** email or phone + choose email or WhatsApp → "We sent a code to em\*\*\*@…" + 6-digit code (5-minute countdown, Resend) → new password twice → back to sign in. Step 1 always answers "If an account exists, we sent a code".
4. **Sign out:** `POST /auth/logout` with the refresh token, wipe the stored token and the signed-in user, go to `/login`.
5. **Session expires mid-work:** a dialog over the page (email locked, password, "Not you? Sign out"); the page and any open drawer stay untouched.
6. **Access changes:** a 403 → reload `/me`, update the screen, toast "Your access has changed". `/me` also reloads when the tab regains focus.
7. Two tabs handle expiry independently.

### 4.3 Permissions

- `useCan()` reads the permission keys from `/me`. It only decides what to show; the backend checks every request.
- **On now:** Team & access visibility, based on the user/role management permissions (System and Admin roles).
- **Built, switched off:** `can('item:create')` etc. for the other screens, until we decide where to use it. Read-only access = `x:read` without `x:update`.

### 4.4 Fallbacks instead of pages

- No-access: members without permission who open Team & access are sent to the welcome screen.
- Unexpected errors: a "Something went wrong" toast from the global error handler.

---

## 5. Business rules

### 5.1 Whole system
1. Names are required in Arabic **and** English. Optional texts are filled in both languages or neither (dashboard rule).
2. Prices are integer piasters; inputs accept up to 2 decimals; English digits everywhere.
3. An action that would break a guarantee (5.6) is blocked with a message saying what to fix first.
4. Every delete asks for confirmation and names the item. No undo.
5. If two people edit the same thing, the last save wins.
6. New items and banners start switched off (the create form has the switch). New categories start on.
7. Closing a drawer with unsaved changes asks first; a failed save keeps everything typed.
8. Every phase-1 feature works fully on phones.
9. The language is saved per account; new accounts start in Arabic; the login page is English until sign-in.
10. The week starts on Sunday; no time-zone handling.

### 5.2 Categories
11. On/off switch (`isActive`); what the store shows is the store's concern.
12. Up/down arrows set the store order (`PUT /categories/order`).
13. A category needs an image (dashboard rule).
14. A category with items can't be deleted.

### 5.3 Items
15. Each item has one variant type — weight, size, flavor or pieces. **Flavors: 1–8 variants; weight, size, pieces: 1–4.** Each variant has an Arabic and English name (unique within the item) and a price, shown in the order entered.
16. The list shows every variant's price, editable inline and saved immediately; a change of more than 50% asks for confirmation, showing old and new values.
17. The Available switch is global (every branch).
18. List order: category order, then alphabetical in the interface language.
19. "Sold this week" is hidden in phase 1.

### 5.4 Banners
20. Visible banners rotate on the home page in their order (`PUT /banners/order`).
21. The button links to all items, a category, or an item. The small card is optional: it opens a chosen item and uses its photo unless another is uploaded; the caption is optional.

### 5.5 Team & access
22. Visible only to members who can manage users and roles.
23. Sign in with email or username (the backend also accepts phone).
24. Usernames: 4–20 characters, starting with a letter (backend rule); lowercase English letters, numbers, `.` and `_`; never `@`; unique.
25. Passwords: 8–48 characters, no forced symbol rules. Set by an admin at creation; members recover access through Forgot password.
26. One role per member (the dashboard always replaces the role list with one role).
27. Members are suspended (`POST /users/:id/suspend`), never deleted from the dashboard. A member created with "Account active" off is created, then suspended.
28. Roles need at least one permission; names are unique; name and description are English only; each role has one of five colours (sage, sand, sky, butter, lilac).
29. Permission changes apply immediately (4.2 flow 6).
30. Members have no "last active" date (removed from the members list).

### 5.6 Guarantees (enforced by the backend; the dashboard checks first and explains)
- **G1** No visible banner points to a hidden or deleted category, or a deleted item.
- **G2** At most 10 banners and 5 visible; the last visible banner can't be hidden or deleted.
- **G3** At least one admin always exists.
- **G4** Nobody changes their own role or suspends themselves; the System role can't be edited or deleted.
- **G5** A category with items can't be deleted.

### 5.7 Text limits (characters, per language; adjustable once the site runs)
| Field | Max | Field | Max |
|---|---|---|---|
| Category name | 40 | Banner eyebrow | 40 |
| Item name | 60 | Banner title | 80 (at most one line break) |
| Badge | 20 | Banner body | 200 |
| Variant name | 30 | Button text | 24 |
| Description | 500 | Card caption | 30 |
| Ingredients | 300 | Role name / description | 40 / 160 (English only) |
| Storage | 200 | First, last, display name | 50 each |
| Username | 4–20, starts with a letter | Email | 254 |
| Password | 8–48 | Phone | international format (E.164), required |

---

## 6. Design system

### 6.1 Tokens
Names follow the storefront design system (primitives + semantic tokens).

- **Primitives:** `espresso/900 #2B1D15` · `espresso/900-a45` · `cocoa/700 #6B4E3D` · `cocoa/600 #6E5847` · `cocoa/500 #7A6555` · `gold/400 #D9C49A` · `sand/400 #D5C7AD` · `sand/300 #D8CBB4` · `sand/200 #E3D8C3` · `sand/100 #EAE0CB` · `cream/50 #FAF5EC` · `white` · `olive/600 #4D6B2E` · `brick/600 #A2362A`.
- **Semantic:** `bg/page, surface, card, inverse, scrim` · `text/primary, secondary, tertiary, brand, accent, on-inverse, on-inverse-muted` · `border/default, subtle, strong, on-inverse` · `action/primary, primary-hover, brand, soft, on-primary` · `feedback/success, error`.
- **Dashboard extensions** (tones the dashboard screenshots use): `#F3ECE0` active nav / icon tiles · `#F1EBDF` tabs track / info boxes · `#F6F1E8` group headers · `#ECE4D6` card borders · `#E8EEDB` / `#9DBA6A` success soft / dot · `#C9B99C` login panel body · role colours (bg / text): sage `#E8EEDB`/`#3F5E25`, sand `#F1E3D3`/`#8A4B22`, sky `#E2EAEF`/`#2F5468`, butter `#F3E7C9`/`#7A5A12`, lilac `#EEE3EC`/`#6A3F62` (the last two text colours are ours, 5.2:1 and 6.7:1).
- **Deliberate deviation:** input borders and the switch-off track use `#A39179` (3:1 against white) instead of `sand/400`.
- **Radius:** 12 / 14 / 20 / 24 / pill 999 · arch: 180 px top, 14 px bottom.
- **Shadows:** floating `0 18 40` 18% · toast `0 14 40` 30% · drawer `0 0 60` 25%.
- **Spacing:** 4-based (4 … 96).

### 6.2 Typography
- Latin: **Montserrat** (titles) and **DM Sans** (everything else). Arabic: **El Messiri** (titles) and **IBM Plex Sans Arabic** (everything else). Banner eyebrow: **Fraunces** (Latin), **Aref Ruqaa** (Arabic). All OFL, self-hosted, used weights only; Arabic fonts limited to Arabic characters with `unicode-range`.
- Sizes (px): 50 login headline · 30 page titles · 24 drawer/login titles · 17 card and section titles, item names · 16 inputs and body · 15 buttons, switch titles · 14 labels, nav, chips · 13 meta, helper, subtitles · 12 badges, keys, counters. Body line height 1.6.

### 6.3 Arabic / RTL
- `<html dir lang>` and Reka's `ConfigProvider` switch together; logical Tailwind classes only (physical left/right banned by lint); transforms get `rtl:` variants.
- Flips: layout (sidebar on the right), drawers from the left, arrows and chevrons, progress bars, switches, alignment. Never flips: logo, photos, numbers, phones, emails, prices, the vertical reorder arrows, `+ ✓ ×`, English-only content.
- `<bdi>` isolates emails, usernames, phones, prices, permission keys and English role names; `dir="auto"` for text of unknown language.
- Content inputs follow their own language's direction; pairs are always Arabic then English.
- Currency: "480 ج.م" / "480 EGP"; decimals only when there are piasters. Dates: Egyptian Arabic month names, Gregorian calendar; `Intl` with `ar-EG-u-nu-latn`.

### 6.4 Component kit (`components/base`)
BaseButton (primary, secondary, soft, danger; 48/40/32) · BaseIconButton (44 px target, required label) · BaseInput · BaseTextarea · BasePriceInput · BaseFieldLocalized · BaseSelect (native `<select>`) · BaseSwitch · BaseCheckbox (with "some selected") · BaseRadioCards · BaseChip · BaseBadge · BaseAvatar · BaseArchImage · BaseImageUpload · BaseCodeInput · BaseTabs · BaseDrawer · BaseConfirmDialog · BaseToast · BaseSegmentBar · BaseSkeleton · BaseEmptyState · BaseSpinner · BaseIcon.

**States:** keyboard focus = 2 px espresso outline, 2 px offset (cream on dark), keyboard only · hover never carries information · disabled 40% · loading: button spinner keeps width and blocks double submit, skeletons on first load, silent background refresh · errors: brick border + linked message · motion 150–200 ms, fade-only with reduced motion.

### 6.5 Patterns
- **Blocked actions:** limits show an always-visible counter ("5 of 5 visible: hide one first"); rule-blocked actions look muted but stay tappable and open a dialog naming the blocker with a link to it. The same dialog handles backend refusals.
- **Empty states:** icon + title + hint + one action; search without results offers Clear search.
- **Load failure:** inline message + Retry.
- **Save feedback:** inline edits show "Saved ✓" for ~1.5 s; drawer saves close the drawer with one toast; errors get a toast with Retry.
- **Offline:** slim top banner until the connection returns.
- **Confirm dialogs:** discard changes · price jump (old → new) · delete (names the item).

### 6.6 Screens not in the designs
Splash · forgot password (3 steps) · session-expired dialog · 404 (inside the layout) · welcome ("Good evening, Omar" + today's date) · `/dev/kit` (every base component in every state, both languages).

### 6.7 Phone and tablet
- Phone layout below **760 px**; the sidebar is permanent only from **1100 px**, otherwise a menu button opens a dark drawer (sign out, language and "Open store" at its bottom).
- Drawers are full-screen on phones with pinned header and footer, safe-area aware.
- Tap targets ≥ 44 px; input text ≥ 16 px on phones.
- Items: one card per item (arch photo, name, category, Available switch, inline prices); category chips scroll sideways. Categories: "+ Add category" opens a sheet. Banners: one column; the editor has Edit / Preview tabs. Team: cards; the "Access at a glance" grid scrolls sideways with the area column pinned.

### 6.8 Images
| Slot | Shape | Recommended | Minimum |
|---|---|---|---|
| Item photo | 4:5, arch | 1600 × 2000 | 1080 × 1350 |
| Category image | 3:4, arch | 1200 × 1600 | 900 × 1200 |
| Banner main image | 4:5, arch beside the headline | 1600 × 2000 | 1200 × 1500 |
| Banner small card | 1:1 | 800 × 800 | 600 × 600 |
| Member photo | 1:1, circle | 512 × 512 | 256 × 256 |

JPG, PNG, WebP up to 20 MB, checked before upload. Wrong shape: fills the frame, centred, with a live preview. Below minimum: warning, saving allowed. One banner image serves desktop and phone. Upload flow: `POST /uploads { file, purpose }` → key, sent as `imageKey`.

---

## 7. Quality

### 7.1 Code rules
- **Lint (type-aware):** per-folder `no-restricted-imports` (3.2) and library containment · `import-x/no-cycle` · `import-x/no-extraneous-dependencies` · `vue/no-restricted-class` (physical left/right classes) · `vue/no-v-html` · `plugin:vue/recommended` · `no-warning-comments` on `MOCK:` (warning in development, error in the pre-launch check) · `simple-import-sort`.
- **Style:** create-vue Prettier defaults — single quotes, no semicolons, 2 spaces, 100-char lines, trailing commas, Tailwind class sorting; LF line endings (`.gitattributes`); final newline (`.editorconfig`).
- **npm:** `.npmrc` `ignore-scripts=true` (setup by hand: `npx playwright install`) · `npm ci` in CI · `npm audit --omit=dev --audit-level=high`.
- **Security:** no `v-html`; Content Security Policy (own scripts only, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, images from our origin + the API/upload host + `blob:`, API calls only to the API); `rel="noopener noreferrer"` on external links.

### 7.2 Tests
- **Unit:** Zod schemas, money, error-code mapping, `useCan`, the dashboard's own guarantee checks.
- **Component:** inline price save / rollback / >50% confirm, item form and variants, unsaved-changes guard, `BaseFieldLocalized`.
- **End-to-end (API stubbed with Playwright `page.route()`):** sign in, forgot password, price edit, create item, blocked category hide, banner limits, create member and role, switch to Arabic, phone menu.
- **Enough** = every business rule and guarantee, and every bug fix, has a test. No percentage gate.
- **Browsers:** automated in Chromium, Firefox and WebKit at desktop and phone sizes; manual check on Windows, Mac, iPhone and Android before each release. Supported: Chrome/Edge/Brave 107+, Firefox 104+, Safari/iOS 16+.
- **Screenshot comparisons:** added after the visual adjustments settle, run in CI only.

### 7.3 CI (GitHub Actions; merge blocked unless green)
`npm ci` → `vue-tsc` → lint → unit + component tests → build → bundle-size check → end-to-end → `npm audit`. Locally: a pre-commit hook formats and lints changed files.

### 7.4 Performance budget (mid-range Android, 4G)
Login route JS ≤ 170 KB gz · each page chunk ≤ 60 KB gz · CSS ≤ 25 KB gz · LCP ≤ 2.5 s · CLS ≤ 0.1 · INP ≤ 200 ms. Code size checked in CI; Lighthouse by hand before each release.

---

## 8. Backend integration

- **Backend:** `http://167.71.141.187` is the one the dashboard hooks onto (development and staging). Local development proxies `/api` through Vite.
- **Built and used now:** `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password/{request,verify,reset}`, `/me`, `/users` (+ `/suspend`, `/unsuspend`, `/email`, `/phone`), `/users/:userId/roles` (`PUT`), `/roles`, `/roles/:roleId/permissions` (`PUT`), `/permissions`, `/uploads`, `/categories` (+ `PUT /order`), `/items` (+ `PATCH /:id/variants/:variantId`), `/banners` (+ `PUT /order`). Everything phase 1 uses exists (2026-10-22).
- **Catalog writes:**
  - Items and banners save with **`PUT` and the whole form**; a text left out is cleared, so the drawers always send everything.
  - The list switches are `PATCH /items/:id { isAvailable }` and `PATCH /banners/:id { isVisible }`; categories change name, image and `isActive` with `PATCH /categories/:id`.
  - Creating an item has no `isAvailable` field: when the create form's switch is on, the dashboard creates the item, then switches it on (two calls).
  - Reordering sends every id once, in the new order.
  - The backend allows 1–20 variants and an optional category image; our tighter limits (5.3 rule 15, 5.2 rule 13) stay dashboard rules.
  - The 409 codes for blocked actions aren't documented: the dashboard checks first and explains (5.6); a backend refusal shows the backend's message.
- **Responses** are wrapped `{ success, message, data, … }` (lists add `meta`); services unwrap `data`.
- **Errors:** `{ success: false, message, error: { code, details }, path, timestamp, requestId }`. Codes are translated (`errors.<CODE>` in both locale files). `VALIDATION_FAILED` carries `details: { field: [English messages] }`; the dashboard shows its own translated messages for fields it validates and the backend's text otherwise. Rate limit: 100 requests per minute (429 shows a "wait a moment" toast).
- **Localized text:** `{ ar, en }` objects. **Money:** integer piasters. **IDs:** opaque strings.
- **Full route reference:** `docs/backend-api-reference.md` (all 98 routes with descriptions, parameters, schemas and examples, generated from the spec on 2026-10-22).
- **Members list:** `GET /users?include=roles&limit=500` (without `include=roles` only a role count comes back). Members with status `PENDING_DELETION` or `DELETED` are not shown; Active and Suspended are.
- **Creating a member** takes up to three calls: `POST /users` (username, email, phone, password, names, avatar key) → `PUT /users/:id/roles { roleIds: [roleId] }` → `POST /users/:id/suspend` if "Account active" is off. If a later call fails, the drawer switches to editing the member that now exists and offers to retry the missing step.
- **Editing a member** sends only what changed: `PATCH /users/:id` (username, names, avatar) · `PATCH /users/:id/email` · `PATCH /users/:id/phone` · `PUT /users/:id/roles` · suspend / unsuspend.
- **Roles:** creating is one call (`POST /roles` with `permissionKeys`); editing is `PATCH /roles/:id` (name, description) + `PUT /roles/:id/permissions`. The roles list already includes member counts, permission counts and the permissions, so "Access at a glance" needs no extra calls.
- **Permission labels:** the backend sends English `displayName`, `description` and `group`. The dashboard translates them by permission key and group in its locale files, falling back to the backend's English for any key it doesn't know yet.
- **Forgot password:** `verify` returns a new `transactionalToken`, and that one goes to `reset`.
- **Uploads:** `GET /uploads/purposes` says which file types and sizes each purpose allows; the dashboard reads it instead of hard-coding (20 MB is only the fallback). Purposes: `USER_AVATAR`, `CATEGORY_IMAGE`, `ITEM_IMAGE`, `BANNER_IMAGE` (the banner's small-card image uses `BANNER_IMAGE` too).
- **Not used in phase 1:** registration, re-authentication, email/phone verification, sessions and force-logout, account deletion, device tokens, notifications, broadcasts, audit logs.
- **Types:** written by hand in `types/<feature>.ts`. Each one names the backend schema it mirrors (e.g. `ProfileDto`) and is checked against `docs/backend-openapi.json` whenever the backend changes.

---

## 9. Mocking

- **No mock API inside the app** (decided 2026-10-22). Development talks to the real backend through the Vite proxy; staff sign in with their own accounts.
- Unit and component tests use MSW in Node: each test sets up only the responses it needs, and unknown URLs fail loudly.
- End-to-end tests stub the API with Playwright `page.route()`.
- **Every mock-related line outside `mocks/` carries `// MOCK:`**; before launch, a search for it must return nothing.

**Mock registry** (each removed when its replacement exists; M1–M6, M8–M10 and M12 retired 2026-10-22 with the in-app mock API)
| # | What | Replaced by |
|---|---|---|
| M7 | `can()` switched off on screens | Switching it on (completion, not removal) |
| M11 | Proposed text limits | Final limits |
| M13 | Role colour field | The backend's field once it's in the live spec |
| M14 | Language saved in the browser | Saving to the account once the backend accepts `ar` |

---

## 10. Environments and deployment

| | Local | Staging | Production |
|---|---|---|---|
| API | The existing backend (Vite proxy) | The existing backend | Decided later |

- **Settings:** `VITE_API_BASE_URL`, `VITE_STOREFRONT_URL`, `VITE_APP_ENV`, `VITE_SENTRY_DSN` — all public; no secrets.
- **Code:** GitHub; Dependabot weekly grouped updates with a 5-day cooldown.
- **Releases:** merges to `main` deploy to staging; production deploys from version tags after the manual device and speed checks; rollback = redeploy the previous tag.
- **Monitoring:** Sentry in staging and production, loaded after start-up, tokens and personal data scrubbed (member ID only), source maps uploaded privately (client agreed).
- **Hosting, domain and HTTPS:** decided later. The host must serve `index.html` for every route, cache hashed assets for a year and `index.html` never, and send the security headers (CSP, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Robots-Tag: noindex`).

---

## 11. Watch list
- The role colour field is added in the backend but not yet in the live spec (M13).
- The backend's 409 codes for blocked actions are undocumented; map them once they're known.
