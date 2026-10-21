# Dahab Dashboard: Planning Record

Last updated: 2026-10-18
Status: **All 7 planning steps done; spec written 2026-10-20** at `dahab-dashboard/docs/specs/2026-10-20-dashboard-phase-1-design.md`. Next: your review of the spec → implementation plan → scaffold the repo. Visual adjustments happen once the site runs.

---

## 0. Project

- **Client:** دهب (Dahab Sweets), a pastry chain in Egypt.
- **Team:** you build the admin dashboard · a friend builds the Vue storefront · a friend builds the NestJS backend.
- **Phase 1 dashboard scope:** Login, a welcome screen (landing page after sign-in), Team & access, Products, Categories, Home banners. The Overview page is not in phase 1.
- **Design source:** the screenshots only. No Figma, no designer input. We design the missing parts ourselves (section 10). The screenshots and logos are saved in `design/screenshots/` and `design/logos/` next to this file.
- **Sidebar items not in phase 1:** Overview, Orders, Customers, Delivery & offers, Social & contact. Kept in `constants/navigation.ts` but hidden (not shown in the sidebar), ready to switch on later. Decided 2026-10-15, replacing the earlier "greyed out with Soon".
- **Client bar:** seamless, smooth, clean, fast. Premium, nothing flashy. Mobile must work flawlessly. We design the Arabic version ourselves from the brand system.
- **Scope rule:** we only handle what changes a dashboard screen, a dashboard validation rule, or the API contract. Storefront and backend internals belong to their owners.

---

## 1. Planning steps

| Step | Status |
|---|---|
| 1. Stack | ✅ Locked |
| 2. Folder structure & layers | ✅ Locked |
| 3. Business rules → data model → API contract → mocking | ✅ Locked |
| 4. Sign-in, sessions & permissions | ✅ Locked |
| 5. Design system, Arabic/RTL, mobile | ✅ Done (5a–5f; visual adjustments once the site runs) |
| 6. Quality (lint, tests, CI) & performance | ✅ Done |
| 7. Environments & deployment | ✅ Done (hosting decided with the backend) |
| Then | Written spec → implementation plan → create the repo |

---

## 2. Step 1: Stack (locked)

**Foundation**
- Framework: Vue 3.5
- Build tool: Vite 8
- Language: TypeScript (strict) + vue-tsc
- Package manager: npm
- Scaffold: create-vue

**UI**
- Styling: Tailwind CSS v4
- Accessible UI behavior (no styling): Reka UI
- Icons: Lucide (`@lucide/vue`, the current official Vue package)

**Routing & data**
- Routing: Vue Router 5 (routes defined per feature)
- Server data: TanStack Vue Query v5
- Browser-only state: Pinia
- HTTP client: axios
- API types: openapi-typescript (generated from the OpenAPI contract)

**Forms**
- Form handling: VeeValidate 4.15 with `@vee-validate/zod` (changed 2026-10-21: v5 is still beta; move to v5 + Zod 4 once it is stable)
- Validation: Zod 3 (`@vee-validate/zod` 4.15 requires Zod ^3.24)

**Language**
- Interface translation: vue-i18n
- Dates & numbers: built-in Intl

**Utilities**
- Composables: VueUse

**Mocks & testing**
- API mocking: MSW v3 (changed 2026-10-21: current stable; needs Node ≥ 22.12)
- Unit/component tests: Vitest + Vue Testing Library
- End-to-end tests: Playwright

**Code quality**
- Lint & format: ESLint + Prettier + prettier-plugin-tailwindcss
- npm gaps (phantom deps, install scripts) are covered in Step 6 with lint rules and install settings.

**Repo**
- Separate dashboard repo
- Shared with backend (NestJS): OpenAPI contract
- Nothing shared with the storefront (decided 2026-10-15)

**Containment rule:** each library is imported in one place only. Reka UI and Lucide in `components/base/`, axios in `services/http.ts`, TanStack Query in `composables/`, MSW in `mocks/`.

**Deliberately left out:** Nuxt/SSR, date library, drag-and-drop library, tailwind-merge/cva, component auto-imports, runtime API response validation, error monitoring (Step 7 decision).

---

## 3. Step 2: Folder structure & layers (locked)

Organized by file type, with a feature subfolder inside each type folder.

```
dahab-dashboard/
├─ contract/                    # OpenAPI draft (moves to the backend's spec later)
├─ e2e/                         # Playwright tests
├─ public/
└─ src/
   ├─ main.ts                   # starts the app; global error handler (shows a toast); wires http hooks
   ├─ App.vue
   ├─ views/                    # route pages: thin
   │  ├─ auth/LoginView.vue · auth/ForgotPasswordView.vue
   │  ├─ WelcomeView.vue            # landing page after sign-in ("Welcome" text)
   │  ├─ team/TeamView.vue (+ thin drawer views)
   │  ├─ products/ProductsView.vue · products/ProductEditView.vue (/products/new, /products/:id)
   │  ├─ categories/CategoriesView.vue
   │  ├─ banners/BannersView.vue (+ thin drawer view)
   │  └─ NotFoundView.vue         # 404 (no-access and error pages deferred)
   ├─ components/
   │  ├─ base/                  # BaseButton, BaseDrawer, BaseSwitch, BaseIcon… (Reka + Lucide only here)
   │  ├─ layout/                # LayoutDashboard, LayoutSidebar, LayoutSidebarFooter, LayoutMobileNav, LayoutPageHeader
   │  └─ auth/ · team/ · products/ · categories/ · banners/
   ├─ composables/              # TanStack Query only here
   │  ├─ queryKeys.ts           # every feature's cache keys (prevents import cycles)
   │  ├─ auth/ · team/ · products/ · categories/ · banners/
   │  └─ common/
   ├─ services/                 # http.ts (axios + onUnauthorized + onForbidden), errors.ts, <feature>.service.ts
   ├─ stores/                   # Pinia, browser-only state: locale.ts
   ├─ schemas/                  # Zod: common.schema.ts + one per feature
   ├─ types/                    # api.d.ts (generated, never edited) + one per feature
   ├─ router/                   # index.ts, guards.ts, routes/<feature>.ts (every route lazy-loaded)
   ├─ i18n/                     # setup + locales/ar.json, en.json
   ├─ plugins/                  # pinia, vue-query, i18n, msw
   ├─ utils/
   ├─ constants/                # navigation.ts
   ├─ config/env.ts
   ├─ mocks/                    # browser.ts, db.ts, rules.ts, fixtures/, handlers/
   └─ assets/                   # styles/ (main.css, tokens.css), fonts/, logos/
```

**Import rules**

| Folder | May import | Must never import |
|---|---|---|
| `views` | components, composables | services |
| `components/<feature>` | `components/base`, composables, types, utils | services |
| `components/base` | utils | anything feature-specific, stores |
| `composables` | services, stores, schemas, types, utils | components |
| `services` | `http.ts`, types | composables, components, stores, router |
| `schemas` · `types` · `utils` | each other | anything Vue |
| `mocks` | types | imported only by `plugins/msw` + test setup |

**Data flow:** view → component → composable → service → `http.ts` → backend (or MSW).
**Feature dependencies:** banners → products, categories · products → categories · everything → auth · auth → nothing. No cycles.

**Naming (Vue style guide):** PascalCase files · multi-word names · `Base` prefix for the kit · child names start with the parent's name (`ProductsList` → `ProductsListItem`) · general word first (`ProductEditDrawer`) · full words · full names inside feature folders · composables are `useX.ts`, other files are `feature.type.ts`.

**Also decided:** drawers have their own URL (phone back button closes them) · a 404 screen, designed by us · unexpected errors show a "Something went wrong" toast · non-Super-Admins opening Team & access are sent to the welcome screen · no-access and error pages are deferred (section 11).

---

## 4. Step 3: Business rules (locked)

**Whole system**
1. Every content field requires Arabic + English. Optional fields are both-or-neither.
2. Prices can include piastres. Stored as whole piastres (12.50 → 1250), max 2 decimals in inputs, displayed in English digits. (Arabic-digit keyboard input not handled, your call. Revisit if testing on a staff phone shows it.)
3. Anything that breaks a guarantee (G1–G5) is blocked, with a message saying what to fix first.
4. Every delete asks for confirmation and names the item. No undo.
5. Two people editing the same item: last save wins.
6. New items and banners start switched off; the create form has the switch. New categories start on (the backend's create takes no switch, and a category without available items doesn't show in the store anyway; updated 2026-10-20).
7. Closing a drawer with unsaved changes asks first. A failed save keeps everything typed.
8. Every phase-1 feature works fully on mobile.
9. Language preference is saved per account. **New accounts start in Arabic** (backend default, accepted 2026-10-18); the login page is English until someone signs in; a language switched on the login page is saved to the account on sign-in.
10. Week starts Sunday. No time-zone handling (Egypt only).

**Categories**
11. Switched off: the category and all its products are hidden from the store.
12. Shows on the store only when it's on and has at least one product.
13. Dashboard order (up/down arrows) = store order.

**Products**
14. Each item is sold by **weight, size, flavor or pieces** (one type per item, backend model). **Flavors: up to 8. Weight, size and pieces: up to 4** (confirmed 2026-10-20). Each variant has an Arabic + English name, a price and a fixed ID.
15. Size names are unique within a product and shown in the order entered.
16. Unavailable items: how the store shows them is the storefront's and backend's call (backend design: left out of lists, the item page still loads and says it's unavailable).
17. Order on the store and in the dashboard list: by category order, then alphabetical in the current interface language.
18. The list shows every size's price, edited inline and saved instantly. A change of more than 50% asks for confirmation.
19. "Sold this week" is **hidden in phase 1** (it needs orders, which come later).

**Banners**
20. Live banners rotate on the home page in position order, top one first.

**Team & access**
21. Team & access is Super Admin only. Hidden for everyone else.
22. Sign in with email or username + password.
23. Usernames: **4–20 characters, starting with a letter** (backend rule, found 2026-10-21), lowercase English letters, numbers, `.` and `_`. Never `@`. Unique. Capitals ignored.
24. Wrong credentials show one generic message. A correct password on a suspended account shows "Your account is suspended, contact your admin".
25. Too many failed attempts: temporary lock (backend).
26. Passwords: **8–48 characters**, no forced symbol rules (the backend applies its own protections).
27. ~~Forced password change at next sign-in.~~ Removed 2026-10-15. A Super Admin sets a member's password only when creating the account; the backend has no admin reset.
28. One role per member. Permissions only come from roles. A role needs at least 1 permission. Role names are unique.
29. Members are suspended, never deleted. Suspended members are signed out everywhere immediately.
30. Super Admin is a system role: can't be edited or deleted.
31. Permission changes apply immediately. The member's dashboard refreshes access on tab focus and on any "forbidden" response.
32. **"Forgot password" is in phase 1** (brought back 2026-10-15): a code by email or WhatsApp, then a new password. Members still can't change their own password from inside the dashboard.
33. ~~Two-factor sign-in.~~ Dropped by the team on 2026-10-18.

**Guarantees (backend enforces, mocks copy, they define the 409 error codes)**
- **G1:** No banner points to something deleted. No live banner points to something hidden. (Sold out still counts as visible.)
- **G2:** At most 10 banners, at most 5 live. The last live banner can't be switched off or deleted.
- **G3:** At least one active Super Admin always exists.
- **G4:** Only Super Admins change anyone's access. Nobody changes their own role or suspends themselves.
- **G5:** A category with products can't be deleted. A role with members can't be deleted.

**Out of scope (not ours):** archiving deleted products, activity logs, availability per size, how "Sold this week" is calculated, image resizing.

---

## 5. Step 3: Data model (locked draft, will change when the backend lands)

> **Superseded 2026-10-18 for categories, items and banners** by the backend's design (`backend-architecture.md`, summarised in section 9c). Names and shapes follow the backend; the dashboard-only rules listed in 9c still apply.

Key: R required · O optional · RO read-only · numbers = max characters

```ts
type Id            = string                       // opaque
type LocalizedText = { ar: string; en: string }
type ImageRef      = { id: Id; url: string }

Category { id RO; name LocalizedText R 40; image ImageRef R; isVisible R (starts false);
           position RO; productCount RO }

Product  { id RO; categoryId R; name LocalizedText R 60; badge LocalizedText|null O 20;
           photo ImageRef R; optionType 'weight'|'size' R; options ProductOption[] R 1–4;
           allowCakeMessage R (starts false); description LocalizedText R 500;
           ingredients LocalizedText|null O 300; storage LocalizedText|null O 200;
           isAvailable R (starts false); soldThisWeek RO }

ProductOption { id RO; name LocalizedText R 30 (unique in product);
                pricePiastres R whole number 1–10,000,000 }

Banner   { id RO; position RO; isLive R (starts false); mainImage ImageRef R;
           smallCard { productId R; image ImageRef|null O; caption LocalizedText|null O 30 } | null;
           eyebrow LocalizedText|null O 40; headline LocalizedText R 80 (max 1 line break);
           text LocalizedText|null O 200; buttonText LocalizedText R 24;
           buttonTarget {type:'allProducts'} | {type:'product',productId} | {type:'category',categoryId} R }

Role     { id RO; name string R 40 unique (English only); description string|null O 160 (English only);
           color 'sage'|'sand'|'sky'|'butter'|'lilac' R (token names; asked of the backend, mocked until then: M13); permissionKeys string[] R ≥1;
           isSystem RO; memberCount RO }

Member   { id RO; firstName R 50; lastName R 50; displayName O 50 (empty → "First Last");
           username R 3–30; email R 254 unique; phone R (any country, stored as E.164; required by the backend);
           avatar ImageRef|null O; roleId R; isActive R (starts true);
           }   // no last-active date (the backend has none; removed 2026-10-20) · password: write-only, 8–48

CurrentUser { id, names, avatar, email, username, role {id,name,isSystem},
              permissionKeys, preferredLocale 'ar'|'en' }

Permission  { key, group }   // labels owned by dashboard i18n
```

---

## 6. Step 3: API contract (locked draft)

**Conventions**
- C1 Base path `/api/v1/admin/...`
- C2 JSON camelCase, plural URLs, opaque string IDs
- C3 GET / POST / PATCH (changed fields only) / DELETE · reorder = `PUT /…/order { ids }`
- C4 POST and PATCH return the full updated item
- C5 Lists are `{ items: [...] }`, no pagination in phase 1
- C6 One error shape: `{ code, message, fields, details }`. 400 = fix this field · 409 = fix something else first
- C7 Backend sends codes and keys. Dashboard owns all labels and messages in both languages
- C8 Money in whole piastres (`…Piastres` names) · dates ISO 8601 UTC
- C9 Images: `POST /uploads` first → `{ id, url }`, then forms send `…Id`. JPG/PNG/WebP up to 10 MB
- C10 Contract lives in `contract/openapi.yaml` now → backend's generated spec later. Types via `npm run api:types`
- C11 Sign-in: cookie session + CSRF (Step 4)

**Endpoints**
> **Superseded 2026-10-15 for auth, users, roles, permissions and uploads** by the real backend (`backend-openapi.json`, summarised in section 9b). This draft remains our proposal only for **products, categories and banners**.

- Auth: `POST /auth/login` · `POST /auth/logout` · `GET /me` · `PATCH /me` (preferredLocale)
- Uploads: `POST /uploads`
- Categories: `GET` · `POST` · `PATCH /:id` · `DELETE /:id` · `PUT /order`
- Products: `GET` · `GET /:id` · `POST` · `PATCH /:id` · `PATCH /:id/options/:optionId` (inline price) · `DELETE /:id`
- Banners: `GET` · `GET /:id` · `POST` · `PATCH /:id` · `DELETE /:id` · `PUT /order`
- Members: `GET` · `GET /:id` · `POST` · `PATCH /:id` · `POST /:id/password` (admin reset). No DELETE.
- Roles: `GET` · `GET /:id` · `POST` · `PATCH /:id` · `DELETE /:id` · Permissions: `GET /permissions`
- Overview: not in phase 1 (no endpoints).

**Error codes**
- 401: `INVALID_CREDENTIALS`, `UNAUTHENTICATED`
- 403: `ACCOUNT_SUSPENDED`, `FORBIDDEN`
- 429: `TOO_MANY_ATTEMPTS`
- 400 `VALIDATION_FAILED`, field codes: `REQUIRED`, `TOO_SHORT`, `TOO_LONG`, `INVALID_FORMAT`, `OUT_OF_RANGE`, `TAKEN`, `DUPLICATE`, `FILE_TOO_LARGE`, `UNSUPPORTED_FILE_TYPE`
- 409: `PRODUCT_USED_BY_BANNER`, `CATEGORY_USED_BY_BANNER`, `WOULD_HIDE_LIVE_BANNER_TARGET`, `BANNER_TARGET_HIDDEN`, `BANNER_LIMIT_REACHED`, `LIVE_BANNER_LIMIT_REACHED`, `LAST_LIVE_BANNER`, `LAST_SUPER_ADMIN`, `CANNOT_CHANGE_OWN_ACCESS`, `CATEGORY_HAS_PRODUCTS`, `ROLE_HAS_MEMBERS`, `SYSTEM_ROLE_LOCKED`, `ORDER_MISMATCH`
- 404 `NOT_FOUND` · 500 `INTERNAL_ERROR`

---

## 7. Step 3: Mocking (locked)

- One env flag `VITE_API_MOCKING`: on in local dev until the backend exists, off in staging/production. MSW never ships in the production build.
- `mocks/db.ts`: in-memory tables seeded from `mocks/fixtures/` (data from the designs). Resets on refresh.
- One handler file per feature, matching the contract exactly.
- Guarantees G1–G5 in one shared file, `mocks/rules.ts`.
- Mock sign-in with the demo credentials from the login design; sets a cookie, so a refresh keeps you signed in.
- Uploads return a temporary browser link to the picked file.
- Realistic delay on every response (MSW `delay()`).
- Unknown URLs fail loudly (`onUnhandledRequest: 'error'`).
- Demo credentials box shows only while mocking is on.
- Tests reuse the same handlers. The fake database resets before each test.

---

## 7b. Step 4: Sign-in, sessions & permissions

**Principle (revised 2026-10-15 to match the real backend):** the backend returns a short-lived **access token** and a **refresh token** in the response body.
- The access token lives **in memory only** and goes out as `Authorization: Bearer …` on every request.
- The refresh token is **stored in the browser** (decided 2026-10-15): `localStorage` when "Keep me signed in" is on, `sessionStorage` (cleared when the tab closes) when it's off.
- On a 401, `http.ts` calls `POST /auth/refresh` **once** (concurrent requests wait for that single refresh), then retries. If the refresh fails → flow 4.
- **Trade-off accepted:** a script injected into the page could read the stored refresh token. Mitigations (Step 6/7): a strict Content Security Policy, no `v-html` on user content, dependency hygiene, and the backend's refresh-token rotation.
- No cookies, so no CSRF protection is needed.

**Flows**
1. **App opens:** logo splash. Refresh token stored → refresh → `GET /me` → apply their language → open the requested page. Otherwise → login.
2. **Sign in:** "Email or username" + password (Show) + "Keep me signed in" (**off by default**) → `POST /auth/login` with `identifier`, `password`, `deviceType: 'web'`.
   - Success → the page they originally wanted, else the welcome screen. The redirect only accepts dashboard paths (no open redirect). A language switched on the login page is saved to the account on sign-in.
   - Errors: one generic message for wrong details · suspended message · "Try again in X minutes".
   - **"Forgot password?"** link (brought back 2026-10-15) → three steps on one screen: enter **email or phone** (the backend doesn't accept usernames here) and choose email or WhatsApp → enter the 6-digit code (valid 5 minutes) → set a new password (`/auth/forgot-password/request`, `/verify`, `/reset`). Details in 7g.
3. **Sign out:** `POST /auth/logout` with the refresh token, then the stored token and all cached data are wiped, then login.
4. **Session expires mid-work:** a sign-in dialog opens over the page (email pre-filled, "Not you?" signs out fully). The open drawer and everything typed stay in place; they press Save again.
5. **Access changes while signed in:** a 403 → reload `/me`, update the screen, toast "Your access has changed". `/me` also reloads when the tab regains focus.
6. **Suspended while signed in:** backend ends the session → flow 4 → signing in shows the suspended message.
7. **Two tabs:** each handles its own expiry. No cross-tab syncing in phase 1.

**Session lengths (updated 2026-10-20):** the dashboard enforces them itself, within whatever the backend's tokens allow. "Keep me signed in" off → signed out after 12 h without activity. On → signed out after 30 days.

**Route guards, in order:** wait for the start-up check → not signed in → login (remember destination) → Team & access without team-management permission → welcome screen → unknown URL → 404.

**`useCan()`** (`composables/auth/useCan.ts`): reads the permission keys from `/me`.
- Team & access visibility: **on now**, based on the team-management permission keys (never the role name). The exact keys come from the backend's permission list (backend question 6); the mock supplies them until then.
- `can('product:create')` for the other screens: built, **off** (M7). Permission keys then become a generated type.
- Read-only access = `can('x:read')` without `can('x:update')`: supported, unused.
- Display only. The backend checks every request.

**Local development:** Vite proxies `/api` to the backend, avoiding cross-origin setup.

---

## 7c. Step 5a: Tokens (from the screenshots)

**Fonts** (all OFL, self-hosted, only the weights we use)
- Headings and titles: **Montserrat** (700 / 800). Matched by measuring the login headline (width ratios and heights within 2%).
- Body, labels, inputs: **DM Sans** (400 / 500 / 700). Near-exact visual match on body text and subtitles.
- Banner eyebrow ("Dahab Sweets", "Eid edition"): **Fraunces**, closest visual match; used only in the banner preview and cards.
- Arabic: **resolved by the full design file** (see 7c-update): El Messiri, IBM Plex Sans Arabic, Aref Ruqaa.

**Colours** (exact values sampled from the screenshots)

| Token | Value | Use |
|---|---|---|
| `bg-page` | `#FAF5EC` | Page background, input fill on white cards |
| `bg-surface` | `#FFFFFF` | Cards, sidebar, drawer sections |
| `bg-muted` | `#F3ECE0` | Active nav item, icon tiles |
| `bg-subtle` | `#F6F1E8` | Permission group headers |
| `bg-track` | `#F1EBDF` | Tabs track, info boxes, key chips, dividers |
| `border` | `#ECE4D6` | Cards, sidebar edge |
| `border-input` | `#A39179` | Inputs, switch "off" track (darkened from `#D5C7AD` to meet 3:1, decided 2026-10-15) |
| `text` | `#2B1D15` | Main text |
| `text-secondary` | `#6E5847` | Subtitles, nav labels |
| `text-muted` | `#7A6555` | Meta text, section labels (replaces the design's `#8A7462`, which fails 4.5:1) |
| `link` | `#6B4E3D` | Links (logo brown) |
| `action` / `on-action` | `#2B1D15` / `#FAF5EC` | Primary buttons, active chips |
| `panel` / `panel-text` / `panel-body` / `gold` | `#2B1D15` / `#FAF5EC` / `#C9B99C` / `#D9C49A` | Login dark panel |
| `success` / `success-soft` / `success-dot` | `#4D6B2E` / `#E8EEDB` / `#9DBA6A` | Switch on, "Active", "Changes go live" |
| `danger` | `#A2362A` | Delete actions |
| `overlay` | `#2B1D15` at 40% | Page dimming behind drawers |
| Roles (bg / text) | sage `#E8EEDB`/`#3F5E25` · sand `#F1E3D3`/`#8A4B22` · sky `#E2EAEF`/`#2F5468` · butter `#F3E7C9`/(we define) · lilac `#EEE3EC`/(we define) | Role chips, avatars |

**Spacing, radius, shadows**
- Spacing: Tailwind's default 4 px scale.
- Radius: pill (buttons, chips, switches) · ~12 px inputs · ~16 px drawer sections · ~20 px page cards · arch shape for images.
- Shadows: almost flat. Cards use a 1 px `border`; one soft shadow for drawers and dialogs.
- Type sizes: measured against the screenshots while building the component kit.

---

### 7c-update. From the full design-system file (read 2026-10-15)

The file (`Desktop\Dahab\desing.png`, 4159 × 32768) is the **storefront's** design system v1.0: Arabic-first, desktop 1440 + mobile 390. It updates 7c as follows.

**Colour: adopt its official names.** Primitives: `espresso/900 #2B1D15` · `espresso/900-a45` (scrim, 45%) · `cocoa/700 #6B4E3D` (brand brown: logo, links, prices) · `cocoa/600 #6E5847` · `cocoa/500 #7A6555` · `gold/400 #D9C49A` · `sand/400 #D5C7AD` · `sand/300 #D8CBB4` · `sand/200 #E3D8C3` · `sand/100 #EAE0CB` · `sand/100-a20` · `cream/50 #FAF5EC` · `white` · `olive/600 #4D6B2E` · `brick/600 #A2362A`.
Semantic: `bg/page, bg/surface, bg/card, bg/inverse, bg/scrim` · `text/primary, secondary, tertiary, brand, accent, on-inverse, on-inverse-muted, on-surface-strong` · `border/default, subtle, strong, on-inverse` · `action/primary, primary-hover, brand, soft, on-primary` · `feedback/success, error`.
- The system's `text/tertiary` is `#7A6555`, which confirms our readability fix.
- Our darker input border (`#A39179`, decided 2026-10-15) is a deliberate dashboard deviation from `border/default` (`sand/400`).
- The dashboard screenshots use a few tones the system doesn't have (role colours, `#F3ECE0`, `#F1EBDF`, `#F6F1E8`, `#ECE4D6`, `#E8EEDB`, `#9DBA6A`, `#C9B99C`). They become a small set of dashboard extension tokens named in the same style.

**Arabic fonts (resolves the "font files" item):** **El Messiri** (display, headings, titles) · **IBM Plex Sans Arabic** (body, UI, prices; the file shows Noto Sans Arabic only as a Figma stand-in) · **Aref Ruqaa** (calligraphic eyebrow). All OFL.
Arabic type scale: Display 82/56 · H1–H5 48/40/34/26/23 · Title 22/19/17 · Body 19/18/17/16/15/14 · Label 17/15/14 · Price 26/20/16 · Caption 13 · Micro 12 (px).

**Radius:** sm 12 · md 14 · lg 20 · xl 24 · pill 999 · **arch-card: 180 px top, 14 px bottom**.
**Shadows:** floating `0 18 40` 18% · toast `0 14 40` 30% · drawer `0 0 60` 25%.
**Spacing:** 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96 (all on Tailwind's default scale).
**Responsive (input for 5b):** one breakpoint at **760 px** (phone below). Mobile artboard 390 with 16 px gutters. Fluid type and spacing with `clamp()`. Mobile menu = dark drawer from the start side, `min(360px, 90%)`.
**Components we can reuse:** pill buttons (primary, secondary 1.5 px outline, soft, on-dark × 3 sizes, with hover and disabled states) · filter chip · badge · nav item (2 px underline) · input and select (cream fill, sand border, brick-red error with message) · radio-style select cards (fits the role picker) · toast (dark pill with action) · round icon button.
**Imagery (input for 5e):** product photos always cropped into the arch; card images keep 4:5 or 3:4.
**Prices in Arabic** use Arabic-Indic digits in the storefront (`١٬٢٥٠ ج.م`). The dashboard rule is English digits; this is revisited in 5c.

---

## 7d. Step 5b: Mobile layout (decided 2026-10-18)

**Rules for every screen**
- Content switches to the phone layout below **760 px** (the design system's breakpoint).
- The sidebar is permanent only from **1100 px**. Below that it collapses into a **menu button + dark drawer** (the storefront's mobile-menu pattern); sign out, language and "Open store" sit at the bottom of the drawer.
- Drawers open **full-screen on phones**: pinned header (title, close) and pinned footer (Save / Delete), safe-area aware (notch, home bar). The phone's back button closes them (drawers have URLs).
- Tap targets at least **44 px** (the design's ~34 px round buttons keep their look; the hit area grows).
- Input text at least **16 px on phones** (prevents iPhone Safari zooming on focus).
- Table rows become stacked cards.

**Screen by screen**
- Login: dark brand panel shrinks to a slim strip with the logo; the form takes the full width.
- Products: one card per product (arch photo, name, category, Available switch, one inline price field per size). Category chips scroll sideways. "+ Add product" in the page header.
- Categories: list first; "+ Add category" opens a sheet with the form; each row shows the Arabic and English name fields stacked.
- Banners: one column. The banner editor has **Edit / Preview tabs**.
- Team members: rows become cards; search and the Members / Roles tabs full width.
- Team roles: one column of role cards. "Access at a glance" **scrolls sideways with the area column pinned**.
- Member and role drawers: full-screen; role picker cards and permission lists stack.

---

## 7e. Step 5c: Arabic / RTL (decided 2026-10-18)

**Mechanics:** `<html dir lang>` + Reka `ConfigProvider dir` switch together. Spacing and alignment use logical Tailwind classes only (`ms-`, `pe-`, `start-`, `text-end`); physical left/right classes are banned by lint (Step 6). Transforms (switch knob, chevrons) get explicit `rtl:` variants.

**Flips in Arabic:** layout (sidebar on the right), drawers slide in from the left, back/forward arrows and select chevrons, progress and permission bars fill from the right, switches, text alignment.
**Never flips:** logo and photos, numbers, phone numbers, emails, price fields, the vertical reorder arrows, "+" ✓ × icons, always-English content (role names, permission keys).

**Fonts:** Arabic glyphs always use El Messiri (headings) and IBM Plex Sans Arabic (rest); Latin glyphs always use Montserrat and DM Sans, whatever the interface language. Done with `unicode-range` on the Arabic `@font-face` rules (Arabic files download only when Arabic text appears). Line heights follow the design system (body 1.6) in both languages.

**Mixed direction:** emails, usernames, phones, prices, permission keys and English role names are isolated with `<bdi>`; text of unknown language (display names, search) uses `dir="auto"`.

**Content fields:** each input's direction follows its own language. Pairs are always Arabic then English (Arabic on the right in the Arabic UI, on top on phones).

**Digits:** **English digits everywhere**, in both interface languages (decided 2026-10-18). `Intl` formatters use `ar-EG-u-nu-latn` in Arabic.
**Currency:** "480 ج.م" / "480 EGP"; decimals only when there are piastres.
**Dates:** Egyptian Arabic month names, Gregorian calendar; relative times ("منذ 7 دقائق") via `Intl.RelativeTimeFormat`.

**Language:** the login page opens in **English**; after sign-in the **account's language** applies, and **new accounts start in Arabic** (backend default, accepted 2026-10-18). Switching is instant, no reload; the other language's strings load on first switch. Saved to the account once the backend accepts `ar`; until then saved in the browser (M14).

---

## 7f. Step 5d part 1: Component kit (approved 2026-10-18; adjustments once the site runs)

**Type scale (px, measured from the screenshots, shared with the Arabic scale):** 50 Montserrat 800 login headline · 30 Montserrat 700 page titles · 24 Montserrat 700 drawer and login titles · 17 Montserrat 700 card/section titles, product names · 16 DM Sans 400 inputs and body · 15 DM Sans 600 buttons, switch titles · 14 DM Sans 500–600 labels, nav, chips · 13 DM Sans 400 meta, helper, subtitles · 12 DM Sans 500 badges, keys, counters.

**Kit (`components/base/`):** BaseButton (primary, secondary, soft, danger; 48/40/32) · BaseIconButton (44 px target, required label) · BaseInput · BaseTextarea · BasePriceInput (piastres, EGP / ج.م suffix) · BaseFieldLocalized (ar + en pair) · BaseSelect (**native `<select>`**, for the phone's own picker) · BaseSwitch (Reka) · BaseCheckbox (Reka, with "some selected") · BaseRadioCards (Reka RadioGroup, role picker) · BaseChip (Reka ToggleGroup) · BaseBadge · BaseAvatar (Reka) · BaseArchImage · BaseImageUpload · BaseCodeInput (one field, one-time-code autofill) · BaseTabs (Reka) · BaseDrawer (Reka Dialog; side panel / full-screen) · BaseConfirmDialog (Reka AlertDialog) · BaseToast (Reka) · BaseSegmentBar · BaseSkeleton · BaseEmptyState · BaseSpinner · BaseIcon.

**States:** keyboard focus = 2 px espresso outline, 2 px offset (cream on dark), keyboard only · hover never carries information · disabled = 40% opacity · loading: button spinner keeps width and blocks double submit, skeletons on first load, silent background refresh · errors: brick border + linked message · motion 150–200 ms, fade-only when reduced motion is on.

---

## 7g. Step 5d part 2: Patterns and screens (decided 2026-10-18)

**Blocked actions:** limits show an always-visible counter next to the action ("5 of 5 live: switch one off first"). Rule-blocked actions look muted but stay tappable (`aria-disabled`, not `disabled`) and open a short dialog naming the blocker with a link to it. The same dialog handles 409 errors from the server.
**Empty states:** icon in a soft circle + title + hint + one action. Search with no results: "No members match 'xyz'" + Clear search.
**Load failure:** inline message + Retry in place of the content.
**Save feedback:** inline edits show "Saved ✓" next to the field for ~1.5 s; drawer saves close the drawer + one toast; errors always get a toast with Retry.
**Offline:** slim top banner "You're offline: changes won't save until you're back", gone on reconnect.

**Screens**
- Splash: cream background, brown logo, gentle fade; shown only if start-up takes over 0.2 s.
- Forgot password (3 steps): **email or phone** + choose email or WhatsApp → "We sent a code to em\*\*\*@example.com" + 6-digit code + 5-minute countdown with Resend → new password twice → back to sign in with "Password changed". Step 1 always answers "If an account exists, we sent a code".
- Session expired: dialog over the page, email locked, password, "Not you? Sign out"; the page underneath is untouched.
- 404: inside the dashboard layout, "This page doesn't exist" + button to the welcome screen.
- Welcome: greeting + name ("Good evening, Omar") + today's date, in the standard page-header style.
- Confirm dialogs: discard changes (Keep editing / Discard) · price jump showing old and new value · delete naming the item.

---

## 7h. Step 5e: Image specs (decided 2026-10-18)

| Slot | Shape | Recommended | Minimum |
|---|---|---|---|
| Product photo | 4:5 portrait, arch | 1600 × 2000 | 1080 × 1350 |
| Category image | 3:4 portrait, arch | 1200 × 1600 | 900 × 1200 |
| Main banner image | 4:5 portrait, arch beside the headline | 1600 × 2000 | 1200 × 1500 |
| Banner small card | 1:1 | 800 × 800 | 600 × 600 (falls back to the product photo, cropped square) |
| Member photo | 1:1, circle | 512 × 512 | 256 × 256 |

- One banner image serves desktop and phone (the photo sits in an arch beside the text, not full-width).
- Accepted: JPG, PNG, WebP (iPhones convert HEIC to JPEG on upload). Type and size are checked before uploading.
- **Wrong shape:** the photo fills the frame, centred, with a live preview in the drawer before saving. No crop tool.
- **Below minimum size:** a warning ("may look blurry"), saving still allowed.
- Each upload slot shows its guidance ("Portrait 4:5, at least 1080 × 1350").

---

## 7i. Step 5f: Visual reference (decided 2026-10-18)

- **`/dev/kit`**: a development-only page showing every `Base…` component in every state, with an Arabic/English switch. Its route (`router/routes/dev.ts`, view `views/dev/KitView.vue`) is registered only when `import.meta.env.DEV` is true, so it never reaches the production build. No new tools.
- **Automatic screenshot comparisons** (Playwright `toHaveScreenshot`: login, products, product drawer, team × English/Arabic × desktop/phone): added **after the visual adjustments settle**, run in CI only (consistent font rendering).

---

## 7j. Step 6a: Code rules (decided 2026-10-18)

**Lint (ESLint flat config + `eslint-plugin-vue` + `import-x`), type-aware TypeScript rules on:**
- Folder import rules (step 2 table) via per-folder `no-restricted-imports`.
- Library containment: `reka-ui` / Lucide only in `components/base`; `axios` only in `services/http.ts`; TanStack only in `composables` and `plugins`; `msw` and `@/mocks` only in `mocks`, `plugins/msw.ts` and test setup.
- `import-x/no-cycle` · `import-x/no-extraneous-dependencies` (no undeclared packages).
- `vue/no-restricted-class` bans physical classes (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`, `rounded-l/r`, `border-l/r`).
- `vue/no-v-html` (error) · `plugin:vue/recommended` (style-guide naming).
- `no-warning-comments` on `MOCK:`: warning in development, error in the pre-launch check.
- Imports auto-sorted (`simple-import-sort`).

**Style:** create-vue Prettier defaults: single quotes, **no semicolons** (interface members separated by line breaks), 2 spaces, 100-char lines, trailing commas, `prettier-plugin-tailwindcss`. LF line endings via `.gitattributes`; final newline via `.editorconfig` + Prettier.

**npm:** `.npmrc` `ignore-scripts=true` (setup run by hand: `npx msw init public`, `npx playwright install`) · CI installs with `npm ci` · `npm audit --omit=dev --audit-level=high` in CI.

**Security:** no `v-html` · Content Security Policy (headers set in step 7): scripts only from our origin, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, images from our origin + the API/upload host + `blob:` (upload previews), API calls only to our origin and the API · external links use `rel="noopener noreferrer"`.

---

## 7k. Step 6b: Tests, CI, performance (decided 2026-10-18)

**Tests**
- Unit (Vitest): Zod schemas, money conversion, error-code mapping, `useCan`, mock guarantees G1–G5.
- Component (Vitest + Vue Testing Library + MSW): inline price save / rollback / >50% confirm, product form and sizes, unsaved-changes guard, `BaseFieldLocalized`.
- End-to-end (Playwright, mock API): sign in, forgot password, price edit, create product, blocked category hide, 5-live banner limit, create member and role, switch to Arabic, phone menu. Later: a smoke run against staging.
- **Enough = rule-based:** every business rule (G1–G5, rules 1–33) and every bug fix has a test. No percentage gate.

**Browsers**
- Automated in all three engines: **Chromium** (Chrome, Edge, Brave, Opera, Android), **Firefox**, **WebKit** (Safari, all iPhone browsers), at desktop and phone sizes.
- Manual check on real devices before each release: Windows (Chrome, Firefox, Edge), Mac (Safari), iPhone, Android.
- **Supported versions:** Baseline Widely Available (Vite default): Chrome/Edge/Brave 107+, Firefox 104+, Safari/iOS 16+.

**Pre-commit (local):** format + lint the changed files (switched on once by hand, since install scripts are blocked).

**CI on every push (merge blocked unless green):** `npm ci` → `vue-tsc` → lint → unit + component tests → build → bundle-size check → end-to-end tests → `npm audit`.

**Performance budget (mid-range Android, 4G):** login route JS ≤ 170 KB gz · each page chunk ≤ 60 KB gz · CSS ≤ 25 KB gz · fonts woff2, used weights only · LCP ≤ 2.5 s · CLS ≤ 0.1 · INP ≤ 200 ms.
- Code size: checked automatically in CI.
- Page speed (Lighthouse, simulated mid-range phone): **checked by hand before each release**.

---

## 7l. Step 7: Environments & deployment (decided 2026-10-18)

**Environments:** local (`localhost:5173`, mocks on, demo credentials box) · staging (e.g. `staging-admin.dahabsweets.com`, staging backend) · production (e.g. `admin.dahabsweets.com`, production backend).
Settings: `VITE_API_BASE_URL`, `VITE_STOREFRONT_URL`, `VITE_API_MOCKING`, `VITE_APP_ENV`, `VITE_SENTRY_DSN`. `.env.example` committed; real values in git-ignored files. **`VITE_` values are public**: no secrets in them (the Sentry upload token lives only in CI secrets).

**Code:** GitHub + GitHub Actions. Dependabot: weekly grouped update PRs, 5-day cooldown after each new package version.

**Releases:** every merge to `main` deploys to **staging** automatically; **production** deploys only from a version tag (`v1.2.0`), after the manual device check and the Lighthouse check. Rollback = redeploy the previous tag.

**Hosting: decided together with the backend** (pending). Whatever the host, it must provide: every URL serving `index.html` · hashed assets cached 1 year (`immutable`), `index.html` never cached · headers: CSP (6a), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, location off), `X-Robots-Tag: noindex` · ideally a preview link per PR.

**Error monitoring: Sentry free tier**, staging and production only, loaded after start-up (protects the speed budget). Scrubs tokens and personal data before sending (member ID only). Source maps uploaded privately from CI, never served publicly. Needs the client's agreement to send error data to a third party.

**Blockers before production:** the backend needs a domain + HTTPS (an HTTPS dashboard can't call an `http://` API) and CORS allowing the dashboard's addresses; someone with access to `dahabsweets.com` DNS adds the `admin.` (and `api.`) addresses.

---

## 8. Mock registry: everything fake, and how it leaves

| # | Mocked now | Where it lives | Replaced by | Removal step |
|---|---|---|---|---|
| M1 | Whole API | `mocks/handlers/`, `mocks/db.ts`, `mocks/rules.ts` | Real backend, endpoint by endpoint. Auth, users, roles and permissions exist; products, categories and banners don't yet (section 9b) | Turn the flag off, regenerate types, fix what the build flags |
| M2 | Mock switch | `VITE_API_MOCKING` in env files + `config/env.ts` | — | Delete the flag everywhere |
| M3 | MSW startup | `plugins/msw.ts` + its call in `main.ts` + `public/mockServiceWorker.js` | — | Delete all three |
| M4 | Demo credentials box | Login view (shown only in mock mode) | — | Delete the box |
| M5 | Sample data (categories, products, banners, members, roles, sales numbers, images) | `mocks/fixtures/` | Real data from the API | Delete with the browser mock (tests may keep a copy, see note) |
| M6 | Permission list (sample from the designs) | `mocks/fixtures/` | `GET /permissions` from the backend | Delete |
| M7 | Permission checks not switched on | `useCan()` built, not used in screens | Backend permissions | Switch `useCan()` on in every screen (not a removal, a completion) |
| M8 | Sign-in, tokens, forgot password | `mocks/handlers/auth`: issues fake access/refresh tokens shaped like the backend's. Every sample member can sign in with the demo password; the forgot-password code is a fixed test value kept in `mocks/fixtures` | Backend auth | Delete with M1 |
| M9 | Image uploads | Temporary browser links | Backend `/uploads` | Delete with M1 |
| M10 | API types for categories, items, banners from our draft | `contract/openapi.yaml` → `types/api.d.ts`, written to match the backend's architecture doc (section 9c). (Auth, users, roles, permissions and uploads already generate from the backend spec.) | Backend spec once the catalog endpoints are built | Delete the draft; `npm run api:types` reads only the backend |
| M13 | Role colour | Mock adds `color` to roles; real backend doesn't have it yet | Backend `color` field (question 8) | Remove the mock field |
| M14 | Language preference saved in the browser | `stores/locale.ts`, marked `// MOCK:` | Backend accepting `ar` in the profile `language` (question 4) | Save to the account only; delete the browser fallback |
| M11 | Proposed text limits | Zod schemas + contract draft | Backend + designer's final limits | Update the schemas |
| M12 | `msw` npm package | `package.json` | — | Remove only if tests stop using it |

**Note:** MSW handlers used by tests are test infrastructure, not leftovers. Whether tests keep them is decided when the backend lands.

**Convention (locked 2026-10-15):** every mock-related line outside `mocks/` gets a `// MOCK:` comment, so a single search finds every leftover. Final check before launch: that search returns zero results.

---

**Placeholders:** none. (P1 removed 2026-10-15: the Overview page is out of phase 1, so the welcome screen is the real phase-1 landing page, not a stand-in.)

---

## 9. Waiting on

There is no Figma or designer input (the screenshots are the whole design) and nothing comes from the storefront. The backend's Swagger spec is saved as `backend-openapi.json` next to this file.

**Nothing is open** (all 21 questions settled 2026-10-20). Only two things to watch:
- **Role colour (M13):** the team added it to the backend, but the live API spec doesn't show it yet (checked 2026-10-20). The mock keeps it until it does.
- **Catalog endpoints:** designed, not built. Categories, items and banners stay on mocks (M1, M10).

**How the 21 questions were settled (2026-10-20)**

| # | Topic | Outcome |
|---|---|---|
| 1 | Error format | **Found by calling the live API:** `{ success: false, message, error: { code, details }, path, timestamp, requestId }`. Codes seen: `AUTH_TOKEN_INVALID` (401), `AUTH_INVALID_CREDENTIALS`, `RESOURCE_NOT_FOUND` (404), `VALIDATION_FAILED` (400) with `details` = `{ field: [English messages] }`. Top-level codes get translated; field messages are English sentences, so the dashboard shows its own translated messages for fields it validates and falls back to the backend's text otherwise. The API also rate-limits (100 requests/minute) and already allows `http://localhost:5173` (CORS). |
| 2 | Admin protections | Backend enforces them (G3, G4). |
| 3 | Last active | **No.** "7 min ago" / "Never signed in" removed from the members list. |
| 4 | Role colour | Added in the backend; not live yet (see above). |
| 5 | Token lifetimes | The dashboard enforces our decision itself: signed out after 12 h without activity, or after 30 days with "Keep me signed in", within whatever the backend's tokens allow. |
| 6 | Passwords, uploads | Passwords go to the backend as typed, **8–48 characters**. Upload limit **20 MB**. |
| 7 | Resized images | Agreed (backend). |
| 8 | Domain, HTTPS | Later, at deployment. |
| 9 | Staging | **The existing backend (`http://167.71.141.187`) is the one the dashboard hooks onto.** |
| 10 | Hosting | Later. |
| 11 | Timeline | Dropped. |
| 12, 13, 16 | Banner limits, banner link protection, variant limits | Backend enforces them. The dashboard still shows the counters and "blocked, here's why" messages, and maps the backend's errors. |
| 14 | Switched-off categories' items | Storefront's concern, not ours. Rule 11 is the store's behaviour. |
| 15 | Create forms | From the architecture doc: `POST /categories` takes only `{ name, imageKey }`, so **new categories start on**. That's harmless, because a category only shows in the store once it has an available item. New items send `isAvailable` with the form (it's part of the item); if the built API doesn't accept it, we create then switch off. New banners start hidden by default. |
| 17 | List size | **Found in the spec:** `limit` max 500 (default 100). The dashboard requests 500, so no pagination in phase 1. |
| 18 | DNS | Not needed to build; only at deployment. |
| 19 | Sentry | **Client agrees.** |
| 20 | Weight and pieces | **Up to 4**, like sizes. |
| 21 | Spec | **Write it**, in the new project folder. |

**Resolved on 2026-10-15:** icons are Lucide · logos are the two WebP files (brown and cream, transparent backgrounds; crop the empty canvas once at repo setup) · the product drawer ends at "Storage", then the footer buttons · our proposed text limits stand · the agreed design changes are ours to apply · the Overview page is out of phase 1 · no design tokens shared with the storefront.

---

## 9b. Backend review (route list received 2026-10-15)

**Biggest gap:** no Products, Categories or Banners routes. Three of the five phase-1 screens have no backend yet and stay on mocks. Our contract draft (section 6) for those three is the proposal to give the backend.

**Conflicts with locked decisions (need answers)**
1. **Sign-in uses access + refresh tokens** (`/auth/refresh`); Step 4 assumed a cookie session. Need to know whether tokens come back in the response body or as cookies. Preferred: refresh token in an httpOnly cookie, access token kept in memory only.
2. **Two-factor login exists** (`/auth/login/two-factor`). The dashboard has no OTP screen: either staff accounts never use 2FA, or we add an OTP step (we'd design it).
3. **No route for a Super Admin to set another member's password** (rule 30). The backend does have forgot-password and change-password, which we deferred. As it stands, a member who forgets their password has no way back.
4. **Roles:** "update role name or description". Is the role colour stored at all?
5. **`/users` may list everyone, customers included.** Team & access needs staff only: which filter?
6. **Username:** does the user have one, and does login accept email or username?
7. **Super Admin protections** (G3 last Super Admin, G4 own access, system role locked): does the backend enforce them?

**We just adapt (no decision needed)**
- No `/admin` prefix: paths are `/api/v1/users`, `/api/v1/roles`, etc. (convention C1 is replaced).
- Suspend / unsuspend are separate actions (`POST /users/{id}/suspend`, `/unsuspend`).
- Email and phone changes are separate endpoints (`PATCH /users/{id}/email`, `/phone`).
- Users can hold several roles; the dashboard keeps "one role per member" by always replacing the list with one role (`PUT /users/{userId}/roles`).
- Role permissions are saved with a separate call (`PUT /roles/{roleId}/permissions`), so saving a role is two requests. If the second fails, the drawer stays open with everything kept and the permissions can be retried.
- Uploads have "purposes" (`GET /uploads/purposes`), useful for per-slot image rules.

**In the backend, not in phase-1 dashboard (ignored for now):** notifications, broadcasts, device tokens, audit logs, session lists and force-logout, 2FA settings, email/phone verification, account deletion, registration. Forgot-password and change-password exist and can back the deferred features later.

**Answers from the Swagger spec** (`backend-openapi.json`, fetched 2026-10-15 from the docs server)
1. Tokens: **JWT access + refresh tokens in the response body**, sent back as `Authorization: Bearer`. Refresh and logout take `refreshToken` in the JSON body. No cookies, so CSRF protection isn't needed.
2. Two-factor is **per user** (`isTwoFactorOn`). Login answers `twoFactorRequired` + `transactionalToken` + `channel` (EMAIL or WHATSAPP); the code goes to `POST /auth/login/two-factor`.
3. **Confirmed: no admin "set password" route.** Forgot-password (request → verify code → reset) and change-password exist.
4. **Roles have no colour field** (`id, name, description, isSystem, userCount, permissionCount, permissions`).
5. `/users` filters: `search, status, roleId, permissionKey, emailVerified, phoneVerified`, with pagination. **No staff-only filter.**
6. **Username exists** and is required. Login takes `identifier` + `password` (+ optional device type and name).
7. Super Admin protections: **not documented**; ask the backend.

**New mismatches found**
- **Phone is required** when creating a user (we had it optional).
- **Name limits are 50** for first, last and display name (ours were 40 / 40 / 60).
- **Profile `language` only accepts `en`**, so the Arabic preference can't be saved yet (rule 9).
- **No "last active" on users**, but the members list design shows "7 min ago / Never signed in".
- **No status on create**: an inactive new member means create, then suspend (two calls).
- **Every response is wrapped** `{ success, message, data, path, timestamp, requestId }`; lists add `meta` (page, limit, total…). Our services unwrap `data`.
- **The error format isn't documented.** We need one real error example: is there a machine-readable code, or only an English message?
- **`/me` returns role names and permission keys.** We gate Team & access on permission keys, never on the role name, so we need the permission key list.
- **Upload purposes only include `USER_AVATAR`** (no product, category or banner images yet).

**Brand image colour check:** the swatches readable at 254 px confirm our tokens (espresso, logo brown, the three text browns, gold, input sand, cream, olive green, red). Four extra brand colours appear that the dashboard screenshots don't use: warm grey `#A09A95` and a sand ramp `#D8CCB5`, `#E2D8C0`, `#EAE0CB` (approximate: the image is heavily compressed).

---

## 9c. Backend architecture document (received 2026-10-18)

Saved as `backend-architecture.md`. It is the backend for **both the dashboard and the storefront**; only what touches the dashboard is listed here. Nothing in it is built yet.

**Adopted as-is**
- Names: items and variants; `isVisible` (banners), `isActive` (categories), `isAvailable` (items); banner `eyebrow`, `title` (multi-line), `body`, `buttonText`, `linkType` (ALL_ITEMS, CATEGORY, ITEM), `cardItemId`, `cardImageKey`, `cardCaption`; images sent as `imageKey`, returned as URLs.
- Variant types: WEIGHT, SIZE, **FLAVOR**, **PIECES**; one type per item.
- Optional fields: descriptions, ingredients, storage, banner button text and body.
- Items and banners save the whole form (`PUT`); inline edits stay small (`PATCH /items/:id/variants/:variantId {price}`, `PATCH /items/:id/availability`, `PATCH /banners/:id/visibility`).
- Reordering: `PUT /<resource>/order { ids }` (matches ours). Money: integer piasters (matches ours).
- A category with items can't be deleted (`422`), so G5 stands.
- Shared routes for store and dashboard: **the dashboard must send the token on every request**, or it gets the store's view. An expired token is a 401, not the store view, so our refresh flow works.
- Roles: System, Admin, Content Editor, Branch Manager (the design's example roles were placeholders).

**Decided 2026-10-18**
- **Branches and per-branch inventory: not in the dashboard's phase 1** (section 11).
- **Banner links (G1): keep "block and explain"** in the dashboard; asked the backend to enforce it too (question 16).
- **Language: follow the account** (new accounts start in Arabic).
- **Variants: up to 4 for sizes, up to 8 for flavors** (weight and pieces treated like sizes, pending confirmation).
- **Two-factor sign-in dropped** by the team.

**Dashboard-only rules we keep (stricter than the backend):** an optional text is filled in both languages or neither · a category needs an image · variant limits · banner limits (G2) until the backend enforces them.

**One limit to know:** an item has one variant type, so a cake can't have both sizes and flavors (e.g. "large, chocolate"). That would need a backend change.

---

## 9d. Full read of the API spec (2026-10-21)

All 78 routes read from `/api/docs-json` (the Swagger page shows the same document; the page itself is now password-protected, the raw spec isn't). Rendered as `dahab-dashboard/docs/backend-api-reference.md`. Nothing changed since 2026-10-15 (no catalog routes, no role colour yet). What it changes for the dashboard, all applied to the spec:
- Usernames: 4–20 characters, starting with a letter.
- The members list needs `include=roles`; only Active and Suspended members are shown.
- Creating a member is up to three calls (create → assign role → suspend if inactive), editing up to five (profile, email, phone, role, status), each only if changed; a partly failed create continues as an edit.
- Roles: create in one call with permissions; edit = name/description + replace permissions.
- Refresh tokens rotate on every refresh: the stored one is replaced, and refreshes never run in parallel.
- Permission labels come in English; the dashboard translates by key and group, falling back to English.
- Forgot password: `verify` returns a new token used by `reset`.
- Upload rules come from `GET /uploads/purposes` (20 MB is the fallback).
- Not used in phase 1: registration, re-auth, verification, sessions, account deletion, device tokens, notifications, broadcasts, audit logs.

---

## 10. Design work we own (Step 5)

1. ✅ Tokens taken from the screenshots (section 7c). Type sizes are measured during the component kit; breakpoints come in 5b.
2. ✅ Latin fonts identified (Montserrat, DM Sans, Fraunces). Arabic font: waiting on your files.
3. ✅ Mobile layout for every screen (section 7d).
4. ✅ The Arabic / RTL rules (section 7e).
5. ✅ Missing components and patterns (sections 7f, 7g).
6. ✅ (section 7g) The 404 screen, the logo splash shown while the app loads, the "session expired" sign-in dialog, and the three forgot-password steps.
7. ✅ Image specs (section 7h).
8. The agreed design changes:
    - Login label → "Email or username"
    - Available/On switch on New product and New category (starts off)
    - Hide "+ Add size or option" at 4 sizes
    - Banner disabled states + reasons (10 total, 5 live, last live)
    - One "blocked, here's why" message pattern
    - Confirmation for price changes over 50%
    - Sidebar: only Products, Categories, Home banners, and Team & access (Super Admins only). Out-of-scope items hidden. The logo takes you to the welcome screen.
9. ✅ Visual reference: the `/dev/kit` page (section 7i).

---

## 11. Deferred features (not in phase 1, recorded so nothing is forgotten)

- Members changing their own password from inside the dashboard (the backend has `/me/change-password`). Until then, a member's password is the one a Super Admin set at creation, unless they use "Forgot password".
- A no-access page (for now: non-Super-Admins opening Team & access are sent to the welcome screen).
- An error page (for now: unexpected errors show a "Something went wrong" toast).
- The Overview page (phase 2).
- **Branches and per-branch inventory screens** (the backend has them for the storefront; not in the dashboard's phase 1, decided 2026-10-18). Until then, branches are managed by the backend team, and the dashboard's Available switch is the only availability control.
- Two-factor sign-in (dropped by the team, 2026-10-18).
- Accepting Arabic-digit keyboard input in number fields (only if testing on a staff phone shows it).

---

## 12. Open items for the next steps

- **Step 5:** everything in section 10 · self-hosting fonts · Arabic numerals in Arabic UI text (prices stay English digits) · currency label (EGP vs ج.م) · RTL mirroring rules.
- **Step 6:** ESLint import-boundary rules · library containment (Reka/Lucide only in `components/base`, axios only in `http.ts`, TanStack only in `composables`, MSW only in `mocks`) · ban physical left/right classes (RTL) · npm hardening (undeclared dependencies, install scripts) · `// MOCK:` marker check · Content Security Policy and no `v-html` on user content (token storage trade-off) · test strategy · CI · performance budget · screenshot comparisons once visuals settle.
- **Step 7:** environments (dev with mocks, staging, production) · deployment · error monitoring decision · storefront URL for "Back to the store" and "Open store" · the `/api` dev proxy.
- **Git workflow & deployment (parked 2026-10-21, until the user has the hosting answers):**
  - Branch model is undecided:
    - **A** (recommended): `main` plus version tags, with per-PR preview deployments.
    - **B**: separate `staging` and `main` branches. B is right if the host has no previews, e.g. if the dashboard is served from the backend's own DigitalOcean server.
  - Question for the backend team: will the dashboard go on a static host (Cloudflare Pages or Netlify, which have previews) or on our own server (no previews)?
  - The backend has one server today (`167.71.141.187`, DigitalOcean). It serves the dashboard's staging. Production needs a production backend; when the backend team adds it, the current server should become their staging.
  - Until this is decided:
    - private GitHub repo `omenway/dahab-dashboard` (created 2026-10-21); scaffold commit on `main`, then one branch + PR per task, squash-merged into `main`;
    - no CI, branch protection or deploy set-up (Task 17 does only its local parts).
  - Commit norms the user asked to follow: atomic commits, Conventional Commits, ≤ ~400 changed lines per review unit (excluding generated files).
- **Stack simplified (user decisions, 2026-10-21):**
  - No TanStack Query. Each screen's composable loads its own data in refs. The signed-in user lives in a Pinia store (`stores/session.ts`). There are no automatic retries; failed loads show Retry.
  - No openapi-typescript. API types are written by hand in `types/<feature>.ts`, each naming the backend schema it mirrors.
  - The `contract/` folder is dropped.
  - `npm audit`: dev-only findings are accepted; production must stay at 0.
  - Spec sections 2, 3.1, 3.2, 3.4, 4.2 and 8 and registry row M10 are updated to match.
