# Dahab Dashboard — Plan 1: Foundation

**Goal:** A running, tested dashboard shell that every later feature plugs into. It covers:
- sign-in against the real backend or the mock;
- sessions and permissions;
- routing;
- design tokens and the first kit components;
- the app frame in Arabic and English;
- CI.

**Architecture:** A create-vue scaffold, organised by file type with feature subfolders (spec 3.1). Data flows view → component → composable → service → `http.ts`. Lint enforces the layers and keeps each library inside one folder. Server data is loaded by hand in composables; Pinia holds the locale and the signed-in user. API types are written by hand. MSW serves the mock API in development and in tests.

**Tech Stack:** Vue 3.5 · Vite 8 · TypeScript · Tailwind CSS 4.3 · Reka UI 2 · `@lucide/vue` · Vue Router 5 · Pinia · axios · VeeValidate 4.15 + Zod 3 · vue-i18n 11 · VueUse · MSW 3 · Vitest + Testing Library · Playwright · Sentry.

**Spec:** `docs/specs/2026-10-20-dashboard-phase-1-design.md`

**Project rule:** for every task:
1. Show the code in chat and explain it, naming the layer each file belongs to.
2. Write files only after the user confirms.
3. Commit only when the user says so.

---

## Global Constraints

- **Node ≥ 24.12.** create-vue 3.24 declares `"engines": { "node": "^22.18.0 || >=24.12.0" }`, and MSW 3 needs ≥ 22.12. This machine has 24.11.1.
- **npm only.** `.npmrc` sets `ignore-scripts=true` and `engine-strict=true`. Install only the packages listed in Task 1.
- **Versions.** Keep create-vue 3.24.0's pins: Vue ^3.5, Vite ^8, TypeScript ~6.0, vue-tsc ^3.3, Vitest ^4.1, Pinia ^4, Vue Router ^5, Prettier 3.9.6, ESLint ^10. Added packages:
  - tailwindcss and @tailwindcss/vite ^4.3
  - reka-ui ^2.11
  - @lucide/vue ^1.60
  - axios ^1.20
  - vee-validate 4.15.1 and @vee-validate/zod 4.15.1
  - **zod ^3.25 (not 4)**
  - vue-i18n ^11
  - @vueuse/core ^15
  - msw ^3.0
  - @sentry/vue ^11
  - No TanStack Query and no openapi-typescript (user decisions, 2026-10-21): data loading and API types are written by hand.
- **Formatting.** Prettier `semi: false`, `singleQuote: true`, `printWidth: 100`, trailing commas (the Prettier default). LF line endings. Every file ends with a newline.
- **Layers.** Lint enforces the layer table (spec 3.2) and the containment rule (spec 2) from Task 2 on. Additions to the table:
  - `config/` and `constants/` may be imported from any layer;
  - `@/mocks` may be imported only from `src/plugins/msw.ts`, `src/**/__tests__/**` and `e2e/**`.
- **RTL-safe classes.** Use logical Tailwind classes only (`ms-`, `pe-`, `start-`, `text-start`, `rounded-s-`, `border-e`). Use `rtl:` for transforms.
- **Safety.** No `v-html`. External links get `target="_blank" rel="noopener noreferrer"`.
- **Number formatting.** `Intl` receives only `en-US` or `ar-EG-u-nu-latn`, always through `intlLocale()` (Task 4).
- **Copy.** Every user-facing string exists in both `en.json` and `ar.json` (parity test, Task 4). Zod messages are i18n keys.
- **Mock marker.** Every mock-related line outside `src/mocks/` carries `// MOCK: M<n>`, using the registry numbers from spec 9.
- **Breakpoints and sizing.** Breakpoints are `tablet` (760 px) and `desktop` (1100 px); phone styles have no prefix. Tap targets ≥ 44 px. Input text 16 px.
- **Tests.**
  - Unit and component tests: `src/<folder>/__tests__/<name>.spec.ts` (create-vue's `tsconfig.vitest.json` includes exactly these).
  - End-to-end tests: `e2e/<name>.spec.ts`.
  - Component tests query by role and label.
  - Test wrappers use render functions (`h`), not `template` strings: Vue's runtime build has no template compiler.
  - Use `screen` for anything that renders outside the container (dialogs, drawers, toasts, which portal to `body`).
- **Naming.** Spec 3.3.
- **Commits and PRs.** Conventional Commits; PR description = Summary + Changes. No AI attribution anywhere (no co-author trailers, no generated-with footers).
## Decisions this plan adds (not in the spec — review these)

| # | Decision | Why |
|---|---|---|
| D1 | Keep **Oxlint** next to ESLint | create-vue 3.24 always adds it with ESLint. It runs in milliseconds, and `eslint-plugin-oxlint` switches off the ESLint rules it already covers. |
| D2 | ~~Serve the MSW worker with its Vite plugin~~ **Retired 2026-10-22:** no mock API in the app. | The backend now has every route phase 1 uses. |
| D3 | Playwright runs against the **dev server**, with the API stubbed through `page.route()` | No mock code in the app; each test stubs only what it needs. |
| D4 | Committed `.env.development` and `.env.test`; personal overrides in `.env.local` (git-ignored); no `.env.example` | Vite's own convention. Values are public (spec 10). |
| D5 | `VITE_STOREFRONT_URL` is optional; "Open store" and "Back to the store" are hidden when it isn't set | The storefront URL isn't known yet, and we shouldn't invent one. |
| D6 | Semantic colours use Tailwind's per-utility namespaces (`--background-color-*`, `--text-color-*`, `--border-color-*`), so classes read `bg-page`, `text-primary`, `border-default` | Checked against Tailwind 4.3.3 on 2026-10-21. Avoids `bg-bg-page`. |
| D7 | Fonts load from Fontsource weight files, which include every subset, each with its own `unicode-range`. Font stacks list the Latin font first. | Arabic files download only when Arabic text appears; Latin glyphs always use Montserrat or DM Sans (spec 6.2). Fraunces and Aref Ruqaa arrive with Banners (Plan 5). |
| D8 | No `plugins/pinia.ts` or `plugins/i18n.ts` | They would only re-export. `plugins/` keeps msw and sentry. |
| D9 | The signed-in user lives in a Pinia store (`stores/session.ts`, state only). Components read it directly; composables do the fetching. | The only server data the whole app shares (spec 3.4). |
| D10 | The kit grows with its consumers. Plan 1 builds the base components its own screens use, plus two that aren't in spec 6.4: **BaseProvider** (wraps Reka's ConfigProvider and ToastProvider so `App.vue` doesn't import Reka) and **BaseDialog** (the session-expired dialog is a form; BaseConfirmDialog isn't). BaseDrawer starts with the mobile-navigation variant only. | Avoids building components before anything uses them. |
| D11 | Greeting hours: morning 05:00–11:59 · afternoon 12:00–16:59 · evening 17:00–04:59 | The spec gives the copy but not the hours. |
| D12 | "Keep me signed in": 30 days **from sign-in**. Without it: 12 h since the last API request. | The spec doesn't say what the 30 days are counted from. |
| D13 | A network failure during start-up **keeps** the stored refresh token and shows the login page | A network blip shouldn't end a 30-day session; reloading once online signs straight back in. |
| D14 | Login errors are chosen by HTTP status: 401 wrong details · 403 suspended · 429 too many attempts (minutes from `Retry-After` when present) | The live backend's codes for suspended and locked-out accounts aren't documented. |
| D15 | An account with two-step sign-in turned on gets a clear message instead of a broken sign-in | 2FA is out of phase 1, but the backend can still answer `twoFactorRequired: true`. |
| D16 | Team & access requires the permission keys `user:read` **and** `role:read` | Matches the Swagger key style. Plan 2 checks the keys against `GET /permissions`. |
| D17 | ~~Demo credentials through `app.provide`~~ **Retired 2026-10-22:** no demo login; staff sign in with their own accounts. | — |
| D18 | Forgot password accepts an email or an international phone number (`+20…`) | Same phone format as members (spec 5.7). |
| D19 | Resend is always available; the countdown shows when the code expires | The simplest version of "5-minute countdown, Resend". |
| D20 | The "Store is live" dot from the login design is left out | No data source. |
| D21 | Sentry source-map upload moves to the deployment plan | It needs a CI secret and the host, both decided later. |
| D22 | A toast with the same text as one already showing isn't added again | Repeated 403s would otherwise stack "Your access has changed". |
| D23 | axios timeout 30 s; nothing retries automatically (a failed load shows Retry) | The spec has no number for the timeout; no data library means no automatic retries. |

## Revision 2026-10-22: the backend built the catalog

The live spec now has categories, items and banners (98 routes). The user decided: **development uses the real backend; MSW only in unit and component tests; end-to-end tests stub the API with Playwright `page.route()`.** The in-app mock API is gone, which retires registry rows M1–M6, M8–M10 and M12.

Changes to the tasks below:
- **Task 6:** unchanged.
- **Task 7:** `types/auth.ts` and `authService` only. No `mocks/db.ts`, fixtures, auth handlers or `browser.ts`. Tests use inline `server.use()` handlers with small test fixtures.
- **Task 8:** `signInAs()` stubs `/auth/login` and `/me` with `server.use()` instead of using a mock database.
- **Task 12:** no demo-credentials box (`AuthDemoCredentials`, `demoCredentialsKey`).
- **Task 13:** forgot-password tests stub the three routes inline.
- **Task 14:** no `plugins/msw.ts` and no MSW Vite plugin; `main.ts` starts no mocks. `.env.development` gains `API_PROXY_TARGET` for the dev proxy. The manual check signs in with the user's own account.
- **Task 16:** e2e tests stub routes with `page.route()`; `e2e/fixtures.ts` holds the response builders.
- **Task 17:** no "MSW never ships" grep in CI (lint already keeps `msw` out of app code).

## Review Focus

1. **Several requests get 401 while the refresh token rotates.** Exactly one `POST /auth/refresh` goes out; every waiting request retries with the new token, and the stored refresh token is the newest one. *Test: Task 6, "three concurrent 401s refresh once".*
2. **The network is down during start-up.** The stored session isn't wiped and the app shows login. A reload once online signs back in without a password. *Test: Task 6, "unreachable refresh keeps the stored token"; Task 8, "restoreSession keeps the token when unreachable".*
3. **Hostile or odd `?redirect=` values** (`https://evil.example`, `//evil.example`, `/\evil.example`, `javascript:…`, `/login`). After sign-in they all land on the welcome screen, never off-site. *Test: Task 9, "safeRedirect rejects…".*
4. **An admin whose account has two-step sign-in turned on.** The login screen explains why sign-in can't finish; it doesn't fail silently or crash on a missing token. *Test: Task 7, "login with twoFactorRequired throws TWO_FACTOR_UNSUPPORTED"; Task 12, "two-step account sees the explanation".*
5. **Permission removed while on Team & access** (a 403, or `/me` reloading on focus). The member is moved to the welcome screen and sees "Your access has changed" once. *Test: Task 8, "useAccessGuard leaves a team route when permission is lost"; Task 10, "duplicate toast is not stacked".*

---

## File map (what Plan 1 creates)

```
dahab-dashboard/
├─ .github/workflows/ci.yml · .github/dependabot.yml
├─ .env.development · .env.test · .npmrc · .size-limit.json
├─ docs/ (existing) + design/screenshots/ + planning record, backend docs (moved in)
├─ e2e/ auth.spec.ts · frame.spec.ts · fixtures.ts
├─ index.html (splash) · vite.config.ts · vitest.config.ts · playwright.config.ts · eslint.config.ts
└─ src/
   ├─ main.ts · App.vue
   ├─ __tests__/ setup.ts · helpers.ts
   ├─ assets/ styles/{main.css,tokens.css} · logos/{dahab-logo-brown,dahab-logo-cream}.webp
   ├─ components/
   │  ├─ base/ BaseProvider · BaseIcon (+ icons.ts) · BaseSpinner · BaseButton · BaseIconButton · BaseToast
   │  │        BaseInput · BaseSwitch · BaseRadioCards · BaseCodeInput · BaseDialog · BaseDrawer
   │  ├─ auth/ AuthPanel · AuthSignInForm · AuthDemoCredentials · AuthLanguageSwitch · AuthForgotPasswordFlow
   │  │        AuthResetRequestStep · AuthResetCodeStep · AuthResetPasswordStep · AuthSessionExpiredDialog
   │  └─ layout/ LayoutDashboard · LayoutSidebar · LayoutSidebarFooter · LayoutMobileNav · LayoutPageHeader
   │             LayoutOfflineBanner · LayoutToasts
   ├─ composables/
   │  ├─ auth/ useCan · useSession · useSessionExpiredDialog · useAccessGuard
   │  │        useSignInErrorMessage · usePasswordReset
   │  └─ common/ useToast · useApiErrorMessage · useDocumentLocale
   ├─ config/env.ts · constants/{navigation.ts,injectionKeys.ts}
   ├─ i18n/ index.ts · locales/{en.json,ar.json}
   ├─ mocks/ db.ts · respond.ts · server.ts · browser.ts · fixtures/users.ts · handlers/{index.ts,auth.handlers.ts}
   ├─ plugins/ msw.ts · sentry.ts
   ├─ router/ index.ts · guards.ts · routes/{auth.ts,app.ts,dev.ts}
   ├─ schemas/ common.schema.ts · auth.schema.ts
   ├─ services/ http.ts · errors.ts · tokenStorage.ts · auth.service.ts
   ├─ stores/ locale.ts · session.ts
   ├─ types/ http.ts · auth.ts · locale.ts · icons.ts · router.d.ts
   ├─ utils/ locale.ts · dates.ts · device.ts · person.ts
   └─ views/ auth/{LoginView,ForgotPasswordView}.vue · WelcomeView.vue · NotFoundView.vue · dev/KitView.vue
```

---

### Task 1: Scaffold the project

**Files:**
- Create: everything create-vue generates in `C:\Users\shbee\Desktop\Dahab\dahab-dashboard\` (the existing `docs/` stays)
- Create: `.npmrc`
- Modify: `.editorconfig`, `.gitignore`, `package.json`
- Move into `docs/`: `dahab-dashboard-planning.md`, `backend-architecture.md`, `backend-openapi.json` (from `Desktop\Dahab\`) and `design/screenshots/` → `docs/design/screenshots/`
- Delete: `src/stores/counter.ts`, `src/__tests__/App.spec.ts`, `e2e/vue.spec.ts`

**Interfaces:** Produces the npm scripts every later task uses: `dev`, `build`, `build-only`, `type-check`, `lint`, `test:unit`, `test:e2e`, `format`.

- [ ] **Step 1: The user installs Node 24 LTS ≥ 24.12.**
  - Run: `node -v`
  - Expected: `v24.12.0` or later.
- [ ] **Step 2: Generate the scaffold in the scratchpad.** create-vue `--force` empties its target directory, so never point it at `dahab-dashboard`.
  - Run, in a scratch folder: `npx create-vue@3.24.0 --ts --router --pinia --vitest --playwright --eslint --prettier --bare dahab-dashboard`
  - Copy the generated contents into `Desktop\Dahab\dahab-dashboard\`.
- [ ] **Step 3: Project files.**
  - `.npmrc`: `ignore-scripts=true` and `engine-strict=true`.
  - `.editorconfig`: change the first section header to `[*]`, so JSON, Markdown, YAML and HTML also get LF and a final newline.
  - `.gitignore`: add `/test-results/`, `/playwright-report/` and `/blob-report/` if they're missing.
  - `package.json`: set `"name": "dahab-dashboard"`.
  - Delete the three sample files listed under **Files**.
- [ ] **Step 4: Move the planning sources into `docs/`.** Update the spec's **Sources** paths to `docs/…`, and update the memory note that points at the planning record.
- [ ] **Step 5: Install the plan's packages.** Then do the manual set-up steps, which `ignore-scripts` doesn't run.
  - Runtime packages: `npm i tailwindcss@^4.3 @tailwindcss/vite@^4.3 reka-ui@^2.11 @lucide/vue@^1.60 @tanstack/vue-query@^5 axios@^1.20 vee-validate@4.15.1 @vee-validate/zod@4.15.1 zod@^3.25 vue-i18n@^11 @vueuse/core@^15 @sentry/vue@^11 @fontsource/montserrat @fontsource/dm-sans @fontsource/el-messiri @fontsource/ibm-plex-sans-arabic`
  - Dev packages: `npm i -D msw@^3 openapi-typescript@^7 @testing-library/vue @testing-library/user-event @testing-library/jest-dom eslint-plugin-import-x eslint-import-resolver-typescript eslint-plugin-simple-import-sort prettier-plugin-tailwindcss size-limit @size-limit/file simple-git-hooks lint-staged`
  - Manual set-up: `npx playwright install`
- [ ] **Step 6: Verify the scaffold.**
  - `npm run type-check` passes.
  - `npm run lint` passes.
  - `npm run build` passes.
  - `npx vitest run --passWithNoTests` exits 0.
  - `npm run dev` serves `http://localhost:5173`.
- [ ] **Step 7: Commit.**

```bash
git init -b main
git add -A
git commit -m "chore: scaffold dashboard with create-vue"
git remote add origin https://github.com/omenway/dahab-dashboard.git
git push -u origin main
```

**Git workflow from Task 2 on** ("main with branches", decided 2026-10-21):
1. Cut a branch from an up-to-date `main`, named `<type>/<one concise word>` (e.g. `feat/tokens`); no numbers, no dashes.
2. Commit the approved work, then push.
3. Open a PR into `main`. The user reviews it and squash-merges it (or asks for it to be merged with `gh pr merge --squash`).
4. Pull `main` before the next task.

CI and deployment stay parked until the hosting answers come in (planning record, section 12).

---

### Task 2: Lint rules that enforce the architecture

**Files:**
- Modify: `eslint.config.ts`
- Modify: `package.json` (scripts `lint`, `lint:check`, `lint:launch`)
- Modify: `package.json` (remove `@tanstack/vue-query`)

**Interfaces:**
- Consumes the Task 1 scaffold.
- Produces:
  - `npm run lint:check`: Oxlint, then ESLint, no `--fix`; used in CI.
  - `npm run lint:launch`: the same check with `MOCK:` raised to an error.

- [ ] **Step 1: Switch the base configs.**
  - Replace `pluginVue.configs['flat/essential']` with `['flat/recommended']`.
  - Replace `vueTsConfigs.recommended` with `vueTsConfigs.recommendedTypeChecked` (spec 7.1: type-aware).
  - Add `playwright-report/**` and `test-results/**` to `globalIgnores`.
- [ ] **Step 2: Imports.**
  - Register the `import-x` plugin with `settings['import-x/resolver-next'] = [createTypeScriptImportResolver()]` and no preset. The presets mostly repeat what TypeScript already checks and break on `.vue` files.
  - `import-x/no-cycle: 'error'`.
  - `import-x/no-extraneous-dependencies: ['error', { devDependencies: ['**/__tests__/**', 'e2e/**', 'src/mocks/**', '*.config.ts'] }]`.
  - `simple-import-sort/imports` and `simple-import-sort/exports`: `'error'`.
- [ ] **Step 3: Folder rules with `import-x/no-restricted-paths`.** Each zone means "files in `target` must not import from `from`". Paths are relative to the repo root.

| target | from | except |
|---|---|---|
| `./src/views` | `./src/services` | |
| `./src/components` | `./src/services` | |
| `./src/components/base` | `./src/components` | `['./base']` |
| `./src/components/base` | `./src/composables`, `./src/stores`, `./src/router` | |
| `./src/composables` | `./src/components`, `./src/views` | |
| `./src/services` | `./src/composables`, `./src/components`, `./src/stores`, `./src/router`, `./src/views` | |
| `./src/schemas`, `./src/types`, `./src/utils` | `./src/components`, `./src/composables`, `./src/services`, `./src/stores`, `./src/router`, `./src/views`, `./src/plugins`, `./src/i18n` | |
| every `./src/*` folder except `plugins`, plus `./src/main.ts` and `./src/App.vue` | `./src/mocks` | |
| `./src/mocks` | every `./src/*` folder except `types` | |

- [ ] **Step 4: Library containment with `no-restricted-imports`.** Flat config doesn't merge one rule's options across blocks (the last matching block wins). So the config is generated from one map in `eslint.config.ts`, which lists the files allowed to import each library:

```ts
const libraryOwners: Record<string, string[]> = {
  axios: ['src/services/http.ts'],
  'reka-ui': ['src/components/base/**'],
  '@lucide/vue': ['src/components/base/**'],
  msw: ['src/mocks/**', 'src/**/__tests__/**'],
  '@sentry/vue': ['src/plugins/sentry.ts'],
}
const pureFolders = ['src/schemas/**', 'src/types/**', 'src/utils/**'] // also may not import vue, vue-router, pinia, vue-i18n
```

  Generate the blocks in this order:
  1. One block for `src/**/*.{ts,vue}` that forbids every library in the map.
  2. One block per distinct owner glob and per pure folder. Each forbids the libraries that glob doesn't own; pure folders also forbid the four Vue libraries.
  3. The `src/**/__tests__/**` block last.

  Each forbidden library is a pattern `{ group: [lib, `${lib}/*`], message: 'Only <owners> may import <lib> (spec 2, containment)' }`.
- [ ] **Step 5: Template and comment rules.**
  - `vue/no-v-html: 'error'`.
  - `vue/no-restricted-class`, with these physical-direction patterns (each allows a variant prefix):
    - `'/^(?:.+:)?-?[mp][lr]-/'`
    - `'/^(?:.+:)?-?(?:left|right)-/'`
    - `'/^(?:.+:)?(?:border|rounded)-(?:[lr]|[tb][lr])(?:-|$)/'`
    - `'/^(?:.+:)?text-(?:left|right)$/'`
    - `'/^(?:.+:)?(?:float|clear)-(?:left|right)$/'`
    - `'/^(?:.+:)?scroll-[mp][lr]-/'`
  - `no-warning-comments: [isLaunchCheck ? 'error' : 'warn', { terms: ['MOCK:'], location: 'anywhere' }]`, where `const isLaunchCheck = process.env.npm_lifecycle_event === 'lint:launch'`. npm sets that variable to the running script's name, so this works the same on Windows, macOS and CI.
- [ ] **Step 6: Scripts.**
  - `"lint": "run-s lint:oxlint lint:eslint"`. The scaffold's `run-s "lint:*"` would also run `lint:launch`.
  - `"lint:check": "oxlint . && eslint ."`
  - `"lint:launch": "oxlint . && eslint ."`
  - The two commands are identical. `lint:launch` turns `MOCK:` into an error only because of its script name (Step 5).
- [ ] **Step 7: Check the rules fire.** Create two throw-away files:
  - `src/services/probe.ts`:
    ```ts
    export const probe = 1 // MOCK: M1
    ```
  - `src/components/probe/ProbeCard.vue`: imports `axios` and `@/services/probe`; its template has `<div class="ml-4" v-html="'x'" />`.

  Then:
  - Run: `npx eslint src/components/probe src/services/probe.ts`
  - Expected errors:
    - `no-restricted-imports` (axios);
    - `import-x/no-restricted-paths` (services);
    - `vue/no-restricted-class` (`ml-4`);
    - `vue/no-v-html`.
  - Expected warning: `no-warning-comments`.
  - Run: `npm run lint:launch`
  - Expected: the `MOCK:` line is now an error.
  - Delete both files. `npm run lint:check` passes.
- [ ] **Step 8: Commit.** `git commit -m "chore(lint): enforce layers, library containment and RTL-safe classes"`

---

### Task 3: Design tokens, fonts, splash

**Files:**
- Create: `src/assets/styles/tokens.css`, `src/assets/styles/main.css`
- Create: `src/assets/logos/dahab-logo-brown.webp`, `src/assets/logos/dahab-logo-cream.webp` (copied from `docs/design/logos/`)
- Modify: `vite.config.ts` (add `tailwindcss()`), `.prettierrc.json`, `index.html`, `src/main.ts` (import `./assets/styles/main.css`)
- Delete: `public/favicon.ico`

**Interfaces:** Produces the utility classes every component uses:
- colours: `bg-page`, `bg-surface`, `bg-card`, `bg-inverse`, `bg-scrim`, `bg-muted`, `bg-track`, `bg-subtle`, `text-primary`, `text-secondary`, `text-tertiary`, `text-brand`, `text-accent`, `text-on-inverse`, `text-on-inverse-muted`, `text-panel-body`, `border-default`, `border-subtle`, `border-strong`, `border-on-inverse`, `border-card`, `border-control`, `bg-control`, `bg-action-primary`, `bg-action-primary-hover`, `bg-action-brand`, `bg-action-soft`, `text-on-primary`, `text-success`, `bg-success`, `bg-success-soft`, `bg-success-dot`, `text-error`, `border-error`;
- fonts: `font-display`, `font-sans`;
- type sizes: `text-headline` 50 · `text-page-title` 30 · `text-title` 24 · `text-card-title` 17 · `text-body` 16 · `text-button` 15 · `text-label` 14 · `text-meta` 13 · `text-badge` 12;
- radius: `rounded-md` 12 · `rounded-lg` 14 · `rounded-xl` 20 · `rounded-2xl` 24 · `rounded-full`;
- shadows: `shadow-floating`, `shadow-toast`, `shadow-drawer`;
- breakpoint variants: `tablet:`, `desktop:`;
- animation: `animate-splash`.

- [ ] **Step 1: `tokens.css`, one `@theme` block.** Use the names from Interfaces, which follow the spec 6.1 names.

  **Primitives** (spec 6.1 values):
  - `--color-espresso-900` … `--color-brick-600`;
  - `--color-espresso-900-a45` = `rgb(43 29 21 / 0.45)`.

  **Semantic mappings already known:**

  | Token | Value |
  |---|---|
  | page | cream-50 |
  | surface, card | white |
  | inverse | espresso-900 |
  | scrim | espresso-900-a45 |
  | primary | espresso-900 |
  | secondary | cocoa-600 |
  | tertiary | cocoa-500 |
  | brand | cocoa-700 |
  | on-inverse | cream-50 |
  | border default | sand-400 |
  | action primary | espresso-900 |
  | on-primary | cream-50 |
  | success | olive-600 |
  | error | brick-600 |

  The remaining semantic values (`card`, `accent`, `on-inverse-muted`, `subtle`, `strong`, the `on-inverse` border, `primary-hover`, action `brand`, `soft`) come from the Colour page of `desing.png`.

  **Dashboard extensions:**

  | Token | Value |
  |---|---|
  | muted | `#F3ECE0` |
  | track | `#F1EBDF` |
  | subtle bg | `#F6F1E8` |
  | border card | `#ECE4D6` |
  | success-soft | `#E8EEDB` |
  | success-dot | `#9DBA6A` |
  | panel-body text | `#C9B99C` |
  | `--color-control` (input borders, switch-off track) | `#A39179` |

  **Type sizes:** the nine `--text-*` sizes above. `--text-body--line-height: 1.6`.

  **Radius:** `--radius-*: initial` first, then the four radius values above.

  **Shadows:**
  - `0 18px 40px rgb(43 29 21 / .18)`
  - `0 14px 40px rgb(43 29 21 / .30)`
  - `0 0 60px rgb(43 29 21 / .25)`

  **Breakpoints:** `--breakpoint-*: initial; --breakpoint-tablet: 760px; --breakpoint-desktop: 1100px`.

  **Fonts:**
  - `--font-display: 'Montserrat', 'El Messiri', sans-serif`
  - `--font-sans: 'DM Sans', 'IBM Plex Sans Arabic', sans-serif`

  **Splash animation:** `--animate-splash: splash-in 300ms ease-out 200ms both`, plus `@keyframes splash-in` (opacity 0 → 1).
- [ ] **Step 2: `main.css`.**
  - Imports: `@import 'tailwindcss'`, `@import './tokens.css'`.
  - Font weights: Montserrat 700 and 800; DM Sans 400, 500, 600 and 700; El Messiri 700; IBM Plex Sans Arabic 400, 500, 600 and 700. Import each as `@fontsource/<font>/<weight>.css` (D7).
  - Base layer: `body { @apply bg-page text-primary font-sans text-body }`.
  - Global focus ring: `:focus-visible { outline: 2px solid var(--color-espresso-900); outline-offset: 2px }`.
  - Reduced motion: `@media (prefers-reduced-motion: reduce)` keeps fades only (spec 6.4).
- [ ] **Step 2b: Logos.** Crop the empty canvas around both WebP logos before copying them in (planning record, 2026-10-15). Show the user the before/after sizes and the cropped images for approval.
- [ ] **Step 3: `.prettierrc.json`.** Add `"plugins": ["prettier-plugin-tailwindcss"]` and `"tailwindStylesheet": "./src/assets/styles/main.css"`.
- [ ] **Step 4: `index.html`.**
  - `<html lang="en" dir="ltr">`
  - `<title>Dahab Admin</title>`
  - `<meta name="robots" content="noindex">`
  - `<link rel="icon" type="image/webp" href="/src/assets/logos/dahab-logo-brown.webp">`
  - Inside `#app`, the splash: a full-screen `bg-page` centred brown logo with `animate-splash motion-reduce:animate-none`. Vue's mount replaces it.
- [ ] **Step 5: Verify.**
  - `npm run build` passes.
  - Run: `grep -c "espresso-900" dist/assets/*.css`. Expected: ≥ 1.
  - Run: `npx prettier --check index.html`. Expected: passes.
  - `npm run dev` shows the splash fading in only after 0.2 s. Throttle the network to "Slow 4G" in devtools to see it.
- [ ] **Step 6: Commit.** `git commit -m "feat(design): tokens, fonts and splash"`

---

### Task 4: Translation, locale store, date and device utilities

**Files:**
- Create:
  - `src/types/locale.ts`
  - `src/i18n/index.ts`
  - `src/i18n/locales/en.json`, `src/i18n/locales/ar.json`
  - `src/stores/locale.ts`
  - `src/composables/common/useDocumentLocale.ts`
  - `src/utils/locale.ts`, `src/utils/dates.ts`, `src/utils/device.ts`
- Test:
  - `src/i18n/__tests__/locales.spec.ts`
  - `src/stores/__tests__/locale.spec.ts`
  - `src/utils/__tests__/dates.spec.ts`, `src/utils/__tests__/device.spec.ts`
  - `src/composables/common/__tests__/useDocumentLocale.spec.ts`

**Interfaces:**
- Produces:
  - `type AppLocale = 'ar' | 'en'` (`types/locale.ts`).
  - `i18n`: `createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: { en, ar } })`, typed with `type MessageSchema = typeof en`.
  - `intlLocale(locale: AppLocale): 'en-US' | 'ar-EG-u-nu-latn'`.
  - `formatPageDate(date: Date, locale: AppLocale): string`: weekday, month name, day; no year.
  - `greetingKey(date: Date): 'greeting.morning' | 'greeting.afternoon' | 'greeting.evening'` (D11).
  - `describeDevice(userAgent: string): string`, e.g. `"Chrome on Windows"`.
  - `useLocaleStore()` (Pinia, setup store), with:
    - `locale: Ref<AppLocale>`
    - `dir: ComputedRef<'rtl' | 'ltr'>`
    - `setLocale(next: AppLocale): void`
    - `applyAccountLocale(userId: string): void`
    - `resetToLoginLocale(): void`
  - `useDocumentLocale(): void`. Called once in `App.vue`. It watches the store and sets the global vue-i18n `locale`, `document.documentElement.lang` and `.dir`.
- Locale store rules (spec 5.1 rule 9; M14):
  - The login page is `en` until sign-in.
  - A locale chosen while signed out is remembered and saved for the account on `applyAccountLocale`.
  - Otherwise the saved value for that user applies, and a new account gets `ar`.
  - Storage key: `dahab.locale.<userId>` in `localStorage`. Every line that touches it carries `// MOCK: M14`.

- [ ] **Step 1: Write the failing tests.**

```ts
// locales.spec.ts
it('ar.json and en.json have the same keys', () => {
  expect(flatKeys(ar).sort()).toEqual(flatKeys(en).sort())
})

// dates.spec.ts
const evening = new Date(2026, 9, 10, 20, 0) // Saturday 10 October 2026, 8 pm
it('formats the page date in English', () =>
  expect(formatPageDate(evening, 'en')).toBe('Saturday, October 10'))
it('formats the page date in Arabic with English digits', () =>
  expect(formatPageDate(evening, 'ar')).toBe('السبت، 10 أكتوبر'))
it.each([
  [5, 0, 'greeting.morning'], [11, 59, 'greeting.morning'], [12, 0, 'greeting.afternoon'],
  [16, 59, 'greeting.afternoon'], [17, 0, 'greeting.evening'], [4, 59, 'greeting.evening'],
])('%i:%i → %s', (h, m, key) => expect(greetingKey(new Date(2026, 9, 10, h, m))).toBe(key))

// device.spec.ts — Brave reports itself as Chrome
it.each([
  [WINDOWS_CHROME_UA, 'Chrome on Windows'], [MAC_SAFARI_UA, 'Safari on Mac'],
  [IPHONE_SAFARI_UA, 'Safari on iPhone'], [ANDROID_CHROME_UA, 'Chrome on Android'],
  [WINDOWS_EDGE_UA, 'Edge on Windows'], [MAC_FIREFOX_UA, 'Firefox on Mac'], ['', 'Web browser'],
])('%s', (ua, expected) => expect(describeDevice(ua)).toBe(expected))

// locale.spec.ts (fresh Pinia + cleared localStorage per test)
it('starts in English for the login page', () => {
  expect(store.locale).toBe('en'); expect(store.dir).toBe('ltr')
})
it('gives a new account Arabic', () => { store.applyAccountLocale('u1'); expect(store.locale).toBe('ar') })
it('saves a language chosen on the login page to the account', () => {
  store.setLocale('ar'); store.applyAccountLocale('u1'); store.resetToLoginLocale()
  store.applyAccountLocale('u1'); expect(store.locale).toBe('ar')
})
it('keeps an account’s saved English', () => {
  store.applyAccountLocale('u1'); store.setLocale('en'); store.resetToLoginLocale()
  store.applyAccountLocale('u1'); expect(store.locale).toBe('en')
})
it('returns to English after sign-out', () => {
  store.applyAccountLocale('u1'); store.resetToLoginLocale(); expect(store.locale).toBe('en')
})

// useDocumentLocale.spec.ts (Task 8's helpers don't exist yet, so mount directly)
it('switches html dir/lang and i18n with the store', async () => {
  render(defineComponent({ setup() { useDocumentLocale(); return () => null } }), { global: { plugins: [i18n] } })
  store.setLocale('ar'); await nextTick()
  expect(document.documentElement.dir).toBe('rtl'); expect(document.documentElement.lang).toBe('ar')
  expect(i18n.global.locale.value).toBe('ar')
})
```

  Test-local definitions:
  - the user-agent constants are real strings, declared at the top of the test file;
  - `flatKeys(obj)` returns dotted key paths;
  - the store tests call `setActivePinia(createPinia())` in `beforeEach`.
- [ ] **Step 2: Run the tests and watch them fail.**
  - Run: `npx vitest run src/i18n src/stores src/utils src/composables/common`
  - Expected: FAIL, because the modules don't exist yet.
- [ ] **Step 3: Implement the modules from Interfaces.**
  - Seed `en.json`/`ar.json` with `app.name` and the three `greeting.*` keys: "Good morning / Good afternoon / Good evening" and "صباح الخير / مساء الخير / مساء الخير".
  - `describeDevice` checks for: `Edg/` → `Firefox|FxiOS` → `Chrome|CriOS` → `Safari`. Then the OS: `iPhone` → `iPad` → `Android` → `Windows` → `Mac` → `Linux`. If it can't tell, it returns `'Web browser'`.
- [ ] **Step 4: Run the tests and see them pass.** Same command. Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "feat(i18n): locales, locale store, date and device utils"`

---

### Task 5: Environment, API errors, token storage

**Files:**
- Create:
  - `src/config/env.ts`
  - `env.d.ts` (add `ImportMetaEnv` typings)
  - `.env.development`, `.env.test`
  - `src/types/http.ts`
  - `src/services/errors.ts`, `src/services/tokenStorage.ts`
- Test: `src/config/__tests__/env.spec.ts`, `src/services/__tests__/errors.spec.ts`, `src/services/__tests__/tokenStorage.spec.ts`

**Interfaces:**
- **Environment** (`config/env.ts`):
  - `readEnv(source: Record<string, string | undefined>): AppEnv`. Throws `Error('Missing VITE_API_BASE_URL')`.
  - `env: AppEnv = readEnv(import.meta.env)`, where `AppEnv` is `{ apiBaseUrl: string; storefrontUrl: string | null; apiMocking: boolean; appEnv: 'local' | 'staging' | 'production'; sentryDsn: string | null }`.
  - The `apiMocking` line carries `// MOCK: M2`.
- **Env files:**
  - `.env.development`:
    ```
    VITE_API_BASE_URL=/api/v1
    VITE_API_MOCKING=true
    VITE_APP_ENV=local
    API_PROXY_TARGET=http://167.71.141.187
    ```
    `API_PROXY_TARGET` has no `VITE_` prefix, so it never reaches the browser.
  - `.env.test`: `VITE_API_BASE_URL=/api/v1` and `VITE_APP_ENV=local`.
- **Response types** (`types/http.ts`): `ApiEnvelope<T> = { success: true; message: string; data: T; path: string; timestamp: string; requestId: string }` and `ApiErrorBody = { success: false; message: string; error: { code: string; details?: Record<string, string[]> }; path: string; timestamp: string; requestId: string }`.
- **Errors** (`services/errors.ts`):
  - `class ApiError extends Error`, built with `new ApiError(init: { status: number; code: string; message?: string; details?: Record<string, string[]>; requestId?: string; retryAfterSeconds?: number })`. Every `init` field becomes a `readonly` property; `status` 0 means there was no response.
  - `CLIENT_ERROR_CODES = { network: 'NETWORK_ERROR', unknown: 'UNKNOWN_ERROR', twoFactorUnsupported: 'TWO_FACTOR_UNSUPPORTED' } as const`.
  - `parseErrorBody(status: number, body: unknown, retryAfter?: string | null): ApiError`.
- **Token storage** (`services/tokenStorage.ts`): `tokenStorage` with:
  - `getAccessToken(): string | null`
  - `getRefreshToken(now?: number): string | null`. Returns null when the token is missing or expired; an expired token is also wiped.
  - `isKeepSignedIn(): boolean`. The mode of the current or most recent session in this page; it survives `clear()`.
  - `start(tokens: SessionTokens, keepSignedIn: boolean, now?: number): void`
  - `rotate(tokens: SessionTokens, now?: number): void`. Keeps the mode and the sign-in time.
  - `touch(now?: number): void`. Writes at most once a minute.
  - `clear(): void`
  - Supporting definitions: `SessionTokens = { accessToken: string; refreshToken: string }`; `IDLE_LIMIT_MS = 12 * 3_600_000`; `KEEP_LIMIT_MS = 30 * 86_400_000`; storage key `dahab.session`, holding `{ refreshToken, keepSignedIn, signedInAt, lastActiveAt }`.
  - The access token is held in a module variable only.

- [ ] **Step 1: Write the failing tests.**

```ts
// env.spec.ts
it('requires the API base URL', () => expect(() => readEnv({})).toThrow('Missing VITE_API_BASE_URL'))
it('reads mocking as a boolean and the storefront as optional', () => {
  expect(readEnv({ VITE_API_BASE_URL: '/api/v1', VITE_API_MOCKING: 'true' })).toMatchObject({
    apiMocking: true, storefrontUrl: null, appEnv: 'local', sentryDsn: null })
})

// errors.spec.ts
it('reads the backend envelope', () => {
  const e = parseErrorBody(400, { success: false, message: 'Validation failed', error: {
    code: 'VALIDATION_FAILED', details: { email: ['email must be an email'] } }, path: '/x',
    timestamp: 't', requestId: 'req-1' })
  expect(e).toMatchObject({ status: 400, code: 'VALIDATION_FAILED', requestId: 'req-1',
    details: { email: ['email must be an email'] } })
})
it('survives a non-JSON body', () =>
  expect(parseErrorBody(502, '<html>')).toMatchObject({ status: 502, code: 'UNKNOWN_ERROR' }))
it('reads Retry-After seconds', () =>
  expect(parseErrorBody(429, {}, '600').retryAfterSeconds).toBe(600))

// tokenStorage.spec.ts
const tokens = { accessToken: 'a1', refreshToken: 'r1' }
it('keeps the refresh token in localStorage with Keep me signed in', () => {
  tokenStorage.start(tokens, true); expect(localStorage.getItem('dahab.session')).toContain('r1')
  expect(sessionStorage.getItem('dahab.session')).toBeNull()
})
it('uses sessionStorage without it', () => {
  tokenStorage.start(tokens, false); expect(sessionStorage.getItem('dahab.session')).toContain('r1')
})
it('never writes the access token to storage', () => {
  tokenStorage.start(tokens, true)
  expect(JSON.stringify({ ...localStorage, ...sessionStorage })).not.toContain('a1')
})
it('rotation replaces the refresh token and keeps the mode', () => {
  tokenStorage.start(tokens, true); tokenStorage.rotate({ accessToken: 'a2', refreshToken: 'r2' })
  expect(tokenStorage.getRefreshToken()).toBe('r2'); expect(tokenStorage.isKeepSignedIn()).toBe(true)
})
it('expires after 12 h idle without Keep me signed in', () => {
  tokenStorage.start(tokens, false, 0)
  expect(tokenStorage.getRefreshToken(IDLE_LIMIT_MS - 1)).toBe('r1')
  expect(tokenStorage.getRefreshToken(IDLE_LIMIT_MS + 1)).toBeNull()
  expect(sessionStorage.getItem('dahab.session')).toBeNull()
})
it('activity extends the idle window', () => {
  tokenStorage.start(tokens, false, 0); tokenStorage.touch(IDLE_LIMIT_MS - 1)
  expect(tokenStorage.getRefreshToken(IDLE_LIMIT_MS + 1)).toBe('r1')
})
it('Keep me signed in ends 30 days after sign-in even when active', () => {
  tokenStorage.start(tokens, true, 0); tokenStorage.touch(KEEP_LIMIT_MS - 1)
  expect(tokenStorage.getRefreshToken(KEEP_LIMIT_MS + 1)).toBeNull()
})
it('remembers the last mode after clear', () => {
  tokenStorage.start(tokens, true); tokenStorage.clear()
  expect(tokenStorage.getRefreshToken()).toBeNull(); expect(tokenStorage.isKeepSignedIn()).toBe(true)
})
```

- [ ] **Step 2: Run the tests and watch them fail.**
  - Run: `npx vitest run src/config src/services`
  - Expected: FAIL.
- [ ] **Step 3: Implement the modules from Interfaces.**
- [ ] **Step 4: Run the tests and see them pass.** Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "feat(core): env config, API errors and token storage"`

---

### Task 6: HTTP client, MSW test harness, API types

**Files:**
- Create:
  - `src/services/http.ts`
  - `src/mocks/server.ts`, `src/mocks/respond.ts`, `src/mocks/handlers/index.ts`
  - `src/__tests__/setup.ts`
- Modify:
  - `vitest.config.ts`: `setupFiles: ['./src/__tests__/setup.ts']`
- Test: `src/services/__tests__/http.spec.ts`

**Interfaces:**
- Consumes: `env`, `tokenStorage`, `parseErrorBody`, `ApiError`, `CLIENT_ERROR_CODES` (Task 5).
- Produces (`services/http.ts`):
  - `api.get<T>(path, options?)`, `api.post<T>(path, body?, options?)`, `api.patch<T>(…)`, `api.put<T>(…)`, `api.delete<T>(path, options?)`. Each returns `Promise<T>`, the envelope's `data`, and rejects with `ApiError` only.
  - `ApiRequestOptions = { params?: Record<string, string | number | boolean | undefined>; signal?: AbortSignal; skipAuth?: boolean }`. Use `skipAuth: true` for login, refresh and the forgot-password calls: no bearer token, and no refresh on 401.
  - `refreshSession(): Promise<RefreshResult>`, where `RefreshResult = 'refreshed' | 'expired' | 'unreachable'`. Single-flight.
  - `onUnauthorized(handler: () => void): void` and `onForbidden(handler: () => void): void`, one handler each.
- Produces (mocks):
  - `apiPath(path: string): string`. Returns `` `*/api/v1${path}` ``.
  - `ok<T>(data: T, init?: ResponseInit): Response`. Builds the envelope.
  - `fail(status: number, code: string, message: string, details?: Record<string, string[]>): Response`.
  - `server` (msw/node).
  - `handlers: HttpHandler[]`. Empty in this task.
- Behaviour of `http.ts`:
  - baseURL `env.apiBaseUrl`, timeout 30 000 ms.
  - Every request attaches `Authorization: Bearer` when an access token exists, and calls `tokenStorage.touch()`.
  - **401** on a non-`skipAuth` request that hasn't been retried yet: `await refreshSession()`.
    - `'refreshed'`: retry once with the new token.
    - `'expired'`: call the unauthorized handler, then reject with `new ApiError({ status: 401, code: 'AUTH_TOKEN_INVALID' })`.
    - `'unreachable'`: reject with `new ApiError({ status: 0, code: CLIENT_ERROR_CODES.network })`.
  - **403**: call the forbidden handler, then reject with the parsed error.
  - **No response**: `new ApiError({ status: 0, code: CLIENT_ERROR_CODES.network })`.
- Behaviour of `refreshSession`:
  - No stored refresh token: `'expired'`.
  - `POST /auth/refresh` succeeds: `tokenStorage.rotate`.
  - 400 or 401 from refresh: `tokenStorage.clear()`, then `'expired'`.
  - Network error or 5xx: `'unreachable'`, and storage stays untouched.
  - Concurrent callers share one in-flight promise.
- Test setup (`src/__tests__/setup.ts`):
  - imports `@testing-library/jest-dom/vitest`;
  - `server.listen({ onUnhandledRequest: 'error' })`;
  - after each test: `server.resetHandlers()`, `localStorage.clear()`, `sessionStorage.clear()`, `tokenStorage.clear()`;
  - after all tests: `server.close()`.

- [ ] **Step 2: Write the failing tests.** Handlers are declared inline with `server.use(...)`.

```ts
it('sends the bearer token and unwraps data', async () => {
  tokenStorage.start({ accessToken: 'a1', refreshToken: 'r1' }, false)
  server.use(http.get(apiPath('/me'), ({ request }) =>
    ok({ auth: request.headers.get('authorization') })))
  expect(await api.get('/me')).toEqual({ auth: 'Bearer a1' })
})
it('three concurrent 401s refresh once and all retry with the new token', async () => {
  tokenStorage.start({ accessToken: 'old', refreshToken: 'r1' }, true)
  let refreshCalls = 0
  server.use(
    http.post(apiPath('/auth/refresh'), async () => { refreshCalls++; await delay(20)
      return ok({ accessToken: 'new', refreshToken: 'r2' }) }),
    http.get(apiPath('/x/:n'), ({ request, params }) =>
      request.headers.get('authorization') === 'Bearer new' ? ok(params.n) : fail(401, 'AUTH_TOKEN_INVALID', 'x')),
  )
  expect(await Promise.all(['1', '2', '3'].map((n) => api.get(`/x/${n}`)))).toEqual(['1', '2', '3'])
  expect(refreshCalls).toBe(1); expect(tokenStorage.getRefreshToken()).toBe('r2')
})
it('expired refresh calls onUnauthorized once and clears storage', async () => {
  const handler = vi.fn(); onUnauthorized(handler)
  tokenStorage.start({ accessToken: 'a1', refreshToken: 'r1' }, true)
  server.use(http.get(apiPath('/me'), () => fail(401, 'AUTH_TOKEN_INVALID', 'x')),
    http.post(apiPath('/auth/refresh'), () => fail(401, 'AUTH_TOKEN_INVALID', 'x')))
  await expect(api.get('/me')).rejects.toMatchObject({ status: 401 })
  expect(handler).toHaveBeenCalledOnce(); expect(tokenStorage.getRefreshToken()).toBeNull()
})
it('unreachable refresh keeps the stored token', async () => {
  tokenStorage.start({ accessToken: 'a1', refreshToken: 'r1' }, true)
  server.use(http.post(apiPath('/auth/refresh'), () => HttpResponse.error()))
  expect(await refreshSession()).toBe('unreachable'); expect(tokenStorage.getRefreshToken()).toBe('r1')
})
it('403 calls onForbidden', async () => {
  const handler = vi.fn(); onForbidden(handler)
  server.use(http.get(apiPath('/users'), () => fail(403, 'FORBIDDEN', 'x')))
  await expect(api.get('/users')).rejects.toMatchObject({ status: 403 }); expect(handler).toHaveBeenCalledOnce()
})
it('a failed connection becomes NETWORK_ERROR', async () => {
  server.use(http.get(apiPath('/me'), () => HttpResponse.error()))
  await expect(api.get('/me')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' })
})
it('skipAuth requests never trigger a refresh', async () => {
  const refresh = vi.fn(() => ok({ accessToken: 'n', refreshToken: 'n' }))
  server.use(http.post(apiPath('/auth/login'), () => fail(401, 'AUTH_INVALID_CREDENTIALS', 'x')),
    http.post(apiPath('/auth/refresh'), refresh))
  await expect(api.post('/auth/login', {}, { skipAuth: true })).rejects.toMatchObject({ status: 401 })
  expect(refresh).not.toHaveBeenCalled()
})
it('a retried request that 401s again does not refresh twice', async () => {
  tokenStorage.start({ accessToken: 'a1', refreshToken: 'r1' }, true)
  let refreshCalls = 0
  server.use(http.get(apiPath('/me'), () => fail(401, 'AUTH_TOKEN_INVALID', 'x')),
    http.post(apiPath('/auth/refresh'), () => { refreshCalls++; return ok({ accessToken: 'a2', refreshToken: 'r2' }) }))
  await expect(api.get('/me')).rejects.toMatchObject({ status: 401 }); expect(refreshCalls).toBe(1)
})
```

- [ ] **Step 3: Run the tests and watch them fail.**
  - Run: `npx vitest run src/services/__tests__/http.spec.ts`
  - Expected: FAIL.
- [ ] **Step 4: Implement `http.ts`, `respond.ts`, `server.ts`, `handlers/index.ts` and the test setup.**
- [ ] **Step 5: Run all the tests and see them pass.**
  - Run: `npx vitest run`
  - Expected: PASS.
  - Also run `npm run lint:check`. Expected: clean (axios only in `http.ts`; msw only in mocks and tests).
- [ ] **Step 6: Commit.** `git commit -m "feat(core): http client with single-flight refresh and MSW test harness"`

---

### Task 7: Mock auth API and auth service

**Files:**
- Create:
  - `src/types/auth.ts`
  - `src/mocks/db.ts`, `src/mocks/fixtures/users.ts`, `src/mocks/handlers/auth.handlers.ts`, `src/mocks/browser.ts`
  - `src/services/auth.service.ts`
- Modify:
  - `src/mocks/handlers/index.ts`: add `...authHandlers`
  - `src/__tests__/setup.ts`: `resetDb()` after each test
- Test: `src/services/__tests__/auth.service.spec.ts`, `src/mocks/__tests__/auth.handlers.spec.ts`

**Interfaces:**
- Consumes: `api`, `ApiError`, `CLIENT_ERROR_CODES`, `apiPath`, `ok`, `fail` (Tasks 5–6).
- Produces (`types/auth.ts`). These are written by hand from `docs/backend-api-reference.md` and cover only the fields the dashboard reads:
  - `Profile` (mirrors `ProfileDto`): `id`, `username`, `email`, `phone`, `displayName`, `firstName?`, `lastName?`, `avatar?`, `language`, `status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_DELETION' | 'DELETED'`, `roles: string[]`, `permissions: string[]`.
  - `OtpChannel = 'EMAIL' | 'WHATSAPP'`
  - `PasswordResetChallenge = { target: string; channel: OtpChannel; expiresIn: number; transactionalToken: string }`
  - `DemoCredentials = { identifier: string; password: string }`
- Produces (`services/auth.service.ts`), `authService` with:
  - `login(input: { identifier: string; password: string; deviceName: string }): Promise<SessionTokens>`. Sends `deviceType: 'web'`. The session reads the user from `/me` afterwards. Throws `ApiError(code: TWO_FACTOR_UNSUPPORTED)` when `twoFactorRequired` is true (D15).
  - `logout(refreshToken: string): Promise<void>`
  - `getMe(): Promise<Profile>`
  - `requestPasswordReset(input: { identifier: string; channel: OtpChannel }): Promise<PasswordResetChallenge>`
  - `verifyResetCode(input: { transactionalToken: string; code: string }): Promise<{ transactionalToken: string }>`
  - `resetPassword(input: { transactionalToken: string; newPassword: string }): Promise<void>`
  - Login, refresh and the forgot-password calls use `skipAuth: true`.
- Produces (mocks):
  - `db`: `users`, `accessTokens: Map<token, userId>`, `refreshTokens: Map<token, userId>`, `resetChallenges: Map<token, { userId; verified: boolean }>`.
  - `resetDb(): void`.
  - `MockUser = Profile & { password: string }`.
  - Fixtures (M5, M8), using names from the team screenshot:
    - `demoAdmin`: Omar Hassan, `@omar`, the email and password printed on `docs/design/screenshots/login.png`, role `Super Admin`, permissions including `user:read`, `user:create`, `user:update`, `role:read`, `role:create`, `role:update`, `role:delete`, `upload:create`.
    - `demoEditor`: Karim Fawzy, Content Editor, no `user:*` or `role:*` keys.
    - `suspendedMember`: Nada Samir, status `SUSPENDED`.
    - `RESET_CODE = '123456'`.
  - `worker` (msw/browser).
- Mock behaviour mirrors the live contract (`docs/backend-api-reference.md`):
  - every response passes through `await delay()`;
  - wrong details: 401 `AUTH_INVALID_CREDENTIALS`;
  - suspended account: 403 `AUTH_ACCOUNT_SUSPENDED`;
  - a refresh token works once (rotation), and reusing it gives 401 `AUTH_TOKEN_INVALID`;
  - `/me` without a valid bearer token: 401 `AUTH_TOKEN_INVALID`;
  - forgot request always returns 200 (an unknown identifier gets a challenge that no code matches);
  - `verify` returns a **new** token, and only that token works for `reset`.

- [ ] **Step 1: Write the failing tests.**

```ts
// auth.service.spec.ts
it('logs in the demo admin', async () => {
  const result = await authService.login({ identifier: demoAdmin.email, password: demoAdmin.password, deviceName: 'Chrome on Windows' })
  expect(result.accessToken).toBeTruthy(); expect(result.refreshToken).toBeTruthy()
})
it('wrong details → 401 AUTH_INVALID_CREDENTIALS', async () => {
  await expect(authService.login({ identifier: demoAdmin.email, password: 'nope', deviceName: 'x' }))
    .rejects.toMatchObject({ status: 401, code: 'AUTH_INVALID_CREDENTIALS' })
})
it('suspended → 403', async () => {
  await expect(authService.login({ identifier: suspendedMember.email, password: suspendedMember.password, deviceName: 'x' }))
    .rejects.toMatchObject({ status: 403 })
})
it('login with twoFactorRequired throws TWO_FACTOR_UNSUPPORTED', async () => {
  server.use(http.post(apiPath('/auth/login'), () => ok({ twoFactorRequired: true, accountRestored: false })))
  await expect(authService.login({ identifier: 'a', password: 'b', deviceName: 'x' }))
    .rejects.toMatchObject({ code: 'TWO_FACTOR_UNSUPPORTED' })
})
it('forgot password: verify returns a new token and only it resets', async () => {
  const challenge = await authService.requestPasswordReset({ identifier: demoAdmin.email, channel: 'EMAIL' })
  expect(challenge.target).toMatch(/\*\*\*/)
  const verified = await authService.verifyResetCode({ transactionalToken: challenge.transactionalToken, code: RESET_CODE })
  expect(verified.transactionalToken).not.toBe(challenge.transactionalToken)
  await expect(authService.resetPassword({ transactionalToken: challenge.transactionalToken, newPassword: 'n3wPassword' })).rejects.toBeInstanceOf(ApiError)
  await authService.resetPassword({ transactionalToken: verified.transactionalToken, newPassword: 'n3wPassword' })
})
it('forgot request answers 200 for an unknown account', async () => {
  await expect(authService.requestPasswordReset({ identifier: 'nobody@example.com', channel: 'EMAIL' })).resolves.toBeTruthy()
})

// auth.handlers.spec.ts
it('a refresh token works once (rotation)', async () => {
  const { refreshToken } = await authService.login({ identifier: demoAdmin.email, password: demoAdmin.password, deviceName: 'x' })
  await api.post('/auth/refresh', { refreshToken }, { skipAuth: true })
  await expect(api.post('/auth/refresh', { refreshToken }, { skipAuth: true })).rejects.toMatchObject({ status: 401 })
})
```

- [ ] **Step 2: Run the tests and watch them fail.**
  - Run: `npx vitest run src/services/__tests__/auth.service.spec.ts src/mocks`
  - Expected: FAIL.
- [ ] **Step 3: Implement the types, fixtures, db, handlers, browser worker and `authService`.**
- [ ] **Step 4: Run the tests and see them pass.**
  - Run: `npx vitest run`
  - Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "feat(auth): auth service and mock auth API"`

---

### Task 8: Session, current user, permissions

**Files:**
- Create:
  - `src/stores/session.ts`
  - `src/composables/auth/useCan.ts`, `useSession.ts`, `useSessionExpiredDialog.ts`, `useAccessGuard.ts`
  - `src/types/router.d.ts`
  - `src/__tests__/helpers.ts`
- Modify: `src/__tests__/setup.ts`:
  - before each test: `setActivePinia(createPinia())`;
  - after each test: `i18n.global.locale.value = 'en'`, `document.documentElement.dir = 'ltr'`.
- Test: `src/composables/auth/__tests__/useCan.spec.ts`, `useSession.spec.ts`, `useAccessGuard.spec.ts`

**Interfaces:**
- Consumes: `authService`, `tokenStorage`, `refreshSession`, `useLocaleStore`, `describeDevice`, fixtures.
- Session store (`stores/session.ts`, Pinia setup store, state only, D9): `useSessionStore()` with:
  - `user: Ref<Profile | null>`
  - `permissions: ComputedRef<readonly string[]>`
  - `setUser(user: Profile): void`
  - `clear(): void`
- Route meta (`types/router.d.ts`): `RouteMeta { public?: boolean; access?: 'team' }`.
- Permissions (`useCan.ts`):
  - `TEAM_PERMISSIONS = ['user:read', 'role:read'] as const` (D16).
  - `hasPermission(permissions: readonly string[], key: string): boolean`.
  - `canManageTeam(permissions: readonly string[]): boolean`.
  - `useCan(): { can: (key: string) => boolean; canManageTeam: ComputedRef<boolean> }`. Only `canManageTeam` is used in phase 1 (M7).
- Session (`useSession.ts`):
  - `restoreSession(): Promise<boolean>`. Steps: refresh, then `getMe()` into the store, then `applyAccountLocale(me.id)`. Returns false when there's no session or it can't be reached; tokens stay as `refreshSession` left them.
  - `useSession()` returns three functions:
    - `signIn(input: { identifier: string; password: string; keepSignedIn: boolean }): Promise<void>`. Logs in, calls `tokenStorage.start`, loads `/me` into the store, then calls `applyAccountLocale`.
    - `resume(password: string): Promise<void>`. Signs in again as the stored user's email with `tokenStorage.isKeepSignedIn()`, reloads `/me`, then closes the expired dialog. The page's own data stays as it is; the member presses Save or Retry again (spec 4.2 flow 5).
    - `signOut(): Promise<void>`. Calls `logout` (failures ignored), then `tokenStorage.clear()`, `useSessionStore().clear()`, `resetToLoginLocale()` and `router.replace({ name: 'login' })`.
- Expired dialog state (`useSessionExpiredDialog.ts`): `useSessionExpiredDialog = createGlobalState(() => ({ isOpen: Ref<boolean>, open(): void, close(): void }))`.
- Access guard (`useAccessGuard.ts`):
  - `useAccessGuard(): void`. Called once by the layout. It does two things:
    - reloads `/me` whenever the window regains focus (VueUse `useEventListener(window, 'focus', …)`, spec 4.2 flow 6);
    - watches `canManageTeam`; when it's false and `route.meta.access === 'team'`, calls `router.replace({ name: 'welcome' })`.
  - `reloadAccess(): Promise<void>`. `getMe()` into the store. A network failure is ignored (the next focus tries again); a 401 goes through `http.ts` as usual.
- Test helpers (`src/__tests__/helpers.ts`):
  - `renderWithApp(component, options?: { props?; slots?; routes?: RouteRecordRaw[]; path?: string; provide?: Record<symbol, unknown> }): Promise<RenderResult & { router: Router; user: UserEvent }>`.
    - Installs the active Pinia (the one the test setup created), `i18n` and a memory-history router.
    - The router always includes empty stub routes named `login` (`/login`), `forgot-password` (`/forgot-password`), `welcome` (`/`) and `not-found` (catch-all), plus `options.routes`.
    - It awaits `router.isReady()` before returning.
  - `runInApp<T>(composable: () => T, options?: same as renderWithApp): Promise<{ result: T; router: Router }>`. Mounts an empty component that runs the composable in `setup`.
  - `signInAs(user: MockUser, keepSignedIn = false): Promise<void>`. Logs in through `authService` and puts the user in the session store.

- [ ] **Step 1: Write the failing tests.**

```ts
// useCan.spec.ts
it.each([
  [['user:read', 'role:read'], true], [['user:read'], false], [['role:read'], false], [[], false],
])('canManageTeam(%j) → %s', (keys, expected) => expect(canManageTeam(keys)).toBe(expected))
it('useCan follows /me', async () => {
  await signInAs(demoEditor); const { result } = await runInApp(() => useCan())
  expect(result.canManageTeam.value).toBe(false)
})

// useSession.spec.ts
it('restoreSession signs back in from a stored refresh token', async () => {
  await signInAs(demoAdmin, true); useSessionStore().clear()
  expect(await restoreSession()).toBe(true); expect(useSessionStore().user?.id).toBe(demoAdmin.id)
})
it('restoreSession applies Arabic for a new account', async () => {
  await signInAs(demoAdmin, true); useSessionStore().clear(); await restoreSession()
  expect(useLocaleStore().locale).toBe('ar')
})
it('restoreSession returns false with nothing stored', async () => expect(await restoreSession()).toBe(false))
it('restoreSession keeps the token when unreachable', async () => {
  await signInAs(demoAdmin, true); server.use(http.post(apiPath('/auth/refresh'), () => HttpResponse.error()))
  expect(await restoreSession()).toBe(false); expect(tokenStorage.getRefreshToken()).not.toBeNull()
})
it('signIn with Keep me signed in stores in localStorage', async () => {
  const { result } = await runInApp(() => useSession())
  await result.signIn({ identifier: demoAdmin.email, password: demoAdmin.password, keepSignedIn: true })
  expect(localStorage.getItem('dahab.session')).not.toBeNull()
})
it('signOut wipes tokens, the user and locale even if logout fails', async () => {
  await signInAs(demoAdmin); server.use(http.post(apiPath('/auth/logout'), () => HttpResponse.error()))
  const { result, router } = await runInApp(() => useSession()); await result.signOut()
  expect(tokenStorage.getRefreshToken()).toBeNull(); expect(useSessionStore().user).toBeNull()
  expect(useLocaleStore().locale).toBe('en'); expect(router.currentRoute.value.name).toBe('login')
})

// useAccessGuard.spec.ts
it('useAccessGuard leaves a team route when permission is lost', async () => {
  await signInAs(demoAdmin)
  const { router } = await runInApp(() => useAccessGuard(), {
    routes: [{ path: '/team', name: 'team', component: { render: () => null }, meta: { access: 'team' } }], path: '/team' })
  const store = useSessionStore(); store.setUser({ ...store.user!, permissions: [] }); await flushPromises()
  expect(router.currentRoute.value.name).toBe('welcome')
})
it('reloads /me when the window regains focus', async () => {
  await signInAs(demoAdmin); await runInApp(() => useAccessGuard())
  server.use(http.get(apiPath('/me'), () => ok({ ...demoAdmin, permissions: [] })))
  window.dispatchEvent(new Event('focus')); await flushPromises()
  expect(useSessionStore().permissions).toEqual([])
})
```

- [ ] **Step 2: Run the tests and watch them fail.**
  - Run: `npx vitest run src/composables/auth`
  - Expected: FAIL.
- [ ] **Step 3: Implement the modules from Interfaces.** `deviceName` comes from `describeDevice(navigator.userAgent)`.
- [ ] **Step 4: Run the tests and see them pass.** Run `npx vitest run` and `npm run lint:check`. Expected: PASS and clean.
- [ ] **Step 5: Commit.** `git commit -m "feat(auth): session lifecycle, current user and permissions"`

---

### Task 9: Route guards and navigation config

**Files:**
- Create: `src/router/guards.ts`, `src/constants/navigation.ts`, `src/types/icons.ts`
- Test: `src/router/__tests__/guards.spec.ts`

**Interfaces:**
- Guards (`router/guards.ts`):
  - `safeRedirect(value: unknown): string | null`. Accepts only strings that start with a single `/`: not `//`, not `/\`, not `/login`, not `/forgot-password`. Anything else gives `null`.
  - `GuardDeps = { isSignedIn(): boolean; canManageTeam(): boolean }`.
  - `installGuards(router: Router, deps: GuardDeps): void`. `main.ts` injects the dependencies, so the router never imports auth. The start-up check finishes before the router is installed (Task 13), which covers "wait for the start-up check" in spec 3.5.
  - Guard order, as a `beforeEach`:
    1. A `meta.public` route: if signed in and the route is `login` or `forgot-password`, go to `safeRedirect(query.redirect) ?? { name: 'welcome' }`. Otherwise allow it.
    2. Not signed in: go to `{ name: 'login', query: to.fullPath === '/' ? {} : { redirect: to.fullPath } }`.
    3. `meta.access === 'team'` without `canManageTeam()`: go to `{ name: 'welcome' }`.
    4. Allow. Unknown URLs reach the catch-all `not-found` route.
- Icons (`types/icons.ts`): `IconName` is a union of the icon names Plan 1 uses: `'overview' | 'orders' | 'customers' | 'items' | 'categories' | 'banners' | 'delivery' | 'social' | 'team' | 'store' | 'language' | 'signOut' | 'menu' | 'close' | 'externalLink' | 'mail' | 'whatsapp' | 'wifiOff'`. Each later plan extends it.
- Navigation (`constants/navigation.ts`):
  - `NavItem = { key: string; labelKey: string; icon: IconName; to: string; access?: 'team'; hidden?: true }`.
  - `navigation: readonly NavItem[]`, in design order: overview (hidden), orders (hidden), customers (hidden), items `/items`, categories `/categories`, banners `/banners`, delivery (hidden), social (hidden), team `/team` (access team).
  - Paths, not route names: until Plans 2–5 add those routes, the links open the 404 page instead of throwing.

- [ ] **Step 1: Write the failing tests.** Add a test-local `makeRouter(deps: GuardDeps): Router`:
  - a memory-history router with empty-component routes: `login` (public), `forgot-password` (public), `welcome` `/`, `items` `/items/:id?`, `team` (access team) and `not-found` (catch-all);
  - it calls `installGuards(router, deps)`.

```ts
it('sends signed-out visitors to login with the destination', async () => {
  const router = makeRouter({ isSignedIn: () => false, canManageTeam: () => false })
  await router.push('/items/42?tab=1')
  expect(router.currentRoute.value).toMatchObject({ name: 'login', query: { redirect: '/items/42?tab=1' } })
})
it('returns a signed-in visitor of /login to the redirect target', async () => {
  const router = makeRouter({ isSignedIn: () => true, canManageTeam: () => true })
  await router.push('/login?redirect=/team'); expect(router.currentRoute.value.name).toBe('team')
})
it.each(['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '/login', '', 42])(
  'safeRedirect rejects %j', (value) => expect(safeRedirect(value)).toBeNull())
it('keeps members without team permission out of Team & access', async () => {
  const router = makeRouter({ isSignedIn: () => true, canManageTeam: () => false })
  await router.push('/team'); expect(router.currentRoute.value.name).toBe('welcome')
})
it('shows the 404 for unknown URLs when signed in', async () => {
  const router = makeRouter({ isSignedIn: () => true, canManageTeam: () => true })
  await router.push('/nope'); expect(router.currentRoute.value.name).toBe('not-found')
})
```

- [ ] **Step 2: Run the tests and watch them fail.**
  - Run: `npx vitest run src/router`
  - Expected: FAIL.
- [ ] **Step 3: Implement `guards.ts`, `navigation.ts` and `icons.ts`.** Add the `nav.*` labels to both locale files.
- [ ] **Step 4: Run the tests and see them pass.** Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "feat(router): guards, safe redirect and navigation config"`

---

### Task 10: Kit part 1 — provider, icons, buttons, toasts

**Files:**
- Create:
  - `src/components/base/BaseProvider.vue`, `BaseIcon.vue`, `icons.ts`, `BaseSpinner.vue`, `BaseButton.vue`, `BaseIconButton.vue`, `BaseToast.vue`
  - `src/composables/common/useToast.ts`, `useApiErrorMessage.ts`
  - `src/components/layout/LayoutToasts.vue`
- Modify: `src/__tests__/helpers.ts`. `renderWithApp` and `runInApp` now wrap the component in `BaseProvider` (with `dir` from the locale store), so tests run inside the same providers as the app (Reka toasts need `ToastProvider`).
- Test:
  - `src/components/base/__tests__/BaseButton.spec.ts`, `BaseIcon.spec.ts`
  - `src/composables/common/__tests__/useToast.spec.ts`, `useApiErrorMessage.spec.ts`
  - `src/components/layout/__tests__/LayoutToasts.spec.ts`

**Interfaces:**
- **`BaseProvider`**: prop `dir: 'ltr' | 'rtl'`, default slot. Wraps Reka's `ConfigProvider` and `ToastProvider` (D10).
- **Icons:**
  - `icons: Record<IconName, Component>` maps each `IconName` to a Lucide component.
  - `directionalIcons: ReadonlySet<IconName>`.
  - `BaseIcon`: props `name: IconName`, `size?: number` (default 20). Always `aria-hidden="true"`. Directional icons get `rtl:-scale-x-100`.
- **`BaseSpinner`**: props `size?: number`, `label?: string`. With a label it renders `role="status"` and visually hidden text.
- **`BaseButton`**:
  - Props:
    - `variant?: 'primary' | 'secondary' | 'soft' | 'danger'` (default `primary`)
    - `size?: 'lg' | 'md' | 'sm'` (48/40/32 px, default `lg`)
    - `type?: 'button' | 'submit'` (default `button`)
    - `to?: RouteLocationRaw`
    - `loading?: boolean`
    - `disabled?: boolean`
    - `block?: boolean`
  - Default slot.
  - With `to`, it renders a `RouterLink` with the same styles. Later plans need this too, e.g. "Add member" opens a drawer URL.
  - While loading: `disabled` and `aria-busy="true"`; the label stays in place (`invisible`), so the width holds; the spinner is centred.
  - Disabled: 40% opacity (spec 6.4).
- **`BaseIconButton`**: props `icon: IconName`, `label: string` (required; becomes `aria-label`), `variant?: 'ghost' | 'soft'`. Hit area 44 × 44.
- **`BaseToast`**: props `tone: ToastTone`, `message: string`, `actionLabel?: string`; emits `action` and `close`. Built on Reka `ToastRoot`, duration 5 000 ms (10 000 ms with an action).
- **Toast queue** (`useToast`, a global state composable):
  - `useToast(): { toasts: Readonly<Ref<ToastItem[]>>; show(input: { message: string; tone?: ToastTone; action?: { label: string; onClick: () => void } }): void; dismiss(id: number): void }`.
  - `ToastTone = 'info' | 'success' | 'error'`.
  - `show` ignores a message identical to one already showing (D22).
- **`LayoutToasts`**: renders `useToast().toasts` with `BaseToast` and the Reka viewport. Mounted once in `App.vue` (Task 13).
- **`useApiErrorMessage(): (error: unknown) => string`**, checked in this order:
  1. An `ApiError` with an `errors.<CODE>` key in the locale files: that message.
  2. Status 0: `errors.network`.
  3. Status 429: `errors.rateLimited` ("Too many requests: wait a moment and try again").
  4. Anything else: `errors.unexpected` ("Something went wrong").

- [ ] **Step 1: Write the failing tests.**

```ts
// BaseButton.spec.ts
it('blocks a second submit while loading and keeps its label for width', async () => {
  const { getByRole, rerender } = await renderWithApp(BaseButton, { props: { type: 'submit' }, slots: { default: 'Save' } })
  await rerender({ loading: true })
  const button = getByRole('button', { name: /save/i })
  expect(button).toBeDisabled(); expect(button).toHaveAttribute('aria-busy', 'true')
})
it('renders a link when given a route', async () => {
  const { getByRole } = await renderWithApp(BaseButton, { props: { to: { name: 'welcome' } }, slots: { default: 'Home' } })
  expect(getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
})

// BaseIcon.spec.ts
it('is hidden from assistive tech', async () => {
  const { container } = await renderWithApp(BaseIcon, { props: { name: 'menu' } })
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
})

// useToast.spec.ts
it('duplicate toast is not stacked', () => {
  const { show, toasts } = useToast(); show({ message: 'Your access has changed' }); show({ message: 'Your access has changed' })
  expect(toasts.value).toHaveLength(1)
})

// useApiErrorMessage.spec.ts
it.each([
  [new ApiError({ status: 401, code: 'AUTH_INVALID_CREDENTIALS' }), 'errors.AUTH_INVALID_CREDENTIALS'],
  [new ApiError({ status: 0, code: 'NETWORK_ERROR' }), 'errors.network'],
  [new ApiError({ status: 429, code: 'X' }), 'errors.rateLimited'],
  [new ApiError({ status: 500, code: 'NOT_A_KNOWN_CODE' }), 'errors.unexpected'],
  [new TypeError('boom'), 'errors.unexpected'],
])('%o → %s', async (error, key) => {
  const { result } = await runInApp(() => useApiErrorMessage()); expect(result(error)).toBe(i18n.global.t(key))
})

// LayoutToasts.spec.ts
it('runs the toast action', async () => {
  const onClick = vi.fn(); const { user } = await renderWithApp(LayoutToasts)
  useToast().show({ message: 'Could not save', tone: 'error', action: { label: 'Retry', onClick } })
  await user.click(await screen.findByRole('button', { name: 'Retry' })); expect(onClick).toHaveBeenCalledOnce()
})
```
- [ ] **Step 2: Run the tests and watch them fail.**
  - Run: `npx vitest run src/components src/composables/common`
  - Expected: FAIL.
- [ ] **Step 3: Implement the components and composables from Interfaces.**
  - Styles come from the tokens in Task 3 and the screenshots in `docs/design/screenshots/`.
  - Add `kit.*` and `errors.*` keys to both locale files: `errors.network`, `errors.rateLimited`, `errors.unexpected`, `errors.AUTH_INVALID_CREDENTIALS`, `errors.AUTH_TOKEN_INVALID`, `errors.VALIDATION_FAILED`, `errors.RESOURCE_NOT_FOUND`, `errors.TWO_FACTOR_UNSUPPORTED`.
- [ ] **Step 4: Run the tests and see them pass.** Expected: PASS. `npm run lint:check` is clean: Reka and Lucide appear only under `components/base`.
- [ ] **Step 5: Commit.** `git commit -m "feat(kit): provider, icons, buttons and toasts"`

---

### Task 11: Kit part 2 — form controls and dialog

**Files:**
- Create: `src/components/base/BaseInput.vue`, `BaseSwitch.vue`, `BaseRadioCards.vue`, `BaseCodeInput.vue`, `BaseDialog.vue`
- Test: `src/components/base/__tests__/BaseInput.spec.ts`, `BaseSwitch.spec.ts`, `BaseCodeInput.spec.ts`, `BaseDialog.spec.ts`

**Interfaces:**
- **`BaseInput`**:
  - Props:
    - `modelValue: string`
    - `label: string`
    - `type?: 'text' | 'email' | 'password' | 'tel'`
    - `error?: string`
    - `hint?: string`
    - `autocomplete?: string`
    - `inputmode?: string`
    - `dir?: 'ltr' | 'rtl' | 'auto'`
    - `readonly?: boolean`
    - `disabled?: boolean`
    - `name?: string`
  - Emits `update:modelValue`.
  - The id comes from `useId()`. The label is linked to the input.
  - With an error: `aria-invalid="true"`, `aria-describedby` pointing at the error, and a brick border.
  - The input border uses `border-control`. Text is 16 px.
  - Password type: a trailing "Show"/"Hide" text button with `aria-pressed` toggles the type.
- **`BaseSwitch`** (Reka `SwitchRoot`):
  - Props: `modelValue: boolean`, `label: string`, `description?: string`, `disabled?: boolean`.
  - Off track `bg-control`; on track `bg-success`. The thumb moves to the end in RTL.
- **`BaseRadioCards`** (Reka `RadioGroupRoot`, generic over the value type `T extends string`):
  - Props: `modelValue: T`, `label: string`, `options: { value: T; label: string; description?: string; icon?: IconName }[]`.
- **`BaseCodeInput`**: one `<input>` with `inputmode="numeric"`, `autocomplete="one-time-code"` and `maxlength` = `length`.
  - Props: `modelValue: string`, `label: string`, `error?: string`, `length?: number` (default 6).
  - Keeps digits only.
  - Emits `update:modelValue`, plus `complete(code: string)` when `length` digits are entered.
- **`BaseDialog`** (Reka `DialogRoot`; `role="dialog"`, `aria-modal`):
  - Props: `open: boolean`, `title: string`, `description?: string`, `dismissible?: boolean` (default `true`).
  - Emits `update:open`. Slots: `default`, `actions`.
  - When `dismissible` is false, Escape and outside clicks are prevented and there's no close button.
  - Centred card; on phones, full width with a 16 px margin.

- [ ] **Step 1: Write the failing tests.**

```ts
// BaseInput.spec.ts
it('links the error to the field', async () => {
  const { getByLabelText, getByText } = await renderWithApp(BaseInput, { props: { modelValue: '', label: 'Email', error: 'Required' } })
  const input = getByLabelText('Email'); expect(input).toHaveAttribute('aria-invalid', 'true')
  expect(input).toHaveAccessibleDescription('Required'); expect(getByText('Required')).toBeVisible()
})
it('Show reveals the password', async () => {
  const { getByLabelText, getByRole, user } = await renderWithApp(BaseInput, { props: { modelValue: 'x', label: 'Password', type: 'password' } })
  await user.click(getByRole('button', { name: 'Show' })); expect(getByLabelText('Password')).toHaveAttribute('type', 'text')
})

// BaseSwitch.spec.ts
it('toggles with its label', async () => {
  const { getByRole, emitted, user } = await renderWithApp(BaseSwitch, { props: { modelValue: false, label: 'Keep me signed in' } })
  await user.click(getByRole('switch', { name: 'Keep me signed in' })); expect(emitted()['update:modelValue']).toEqual([[true]])
})

// BaseCodeInput.spec.ts
it('keeps digits and emits complete at six', async () => {
  const { getByLabelText, emitted, user } = await renderWithApp(BaseCodeInput, { props: { modelValue: '', label: 'Code' } })
  const input = getByLabelText('Code'); expect(input).toHaveAttribute('autocomplete', 'one-time-code')
  await user.type(input, '12a3456'); expect(emitted().complete).toEqual([['123456']])
})

// BaseDialog.spec.ts
it('a non-dismissible dialog ignores Escape', async () => {
  const { getByRole, emitted, user } = await renderWithApp(BaseDialog, { props: { open: true, title: 'Session expired', dismissible: false } })
  await user.keyboard('{Escape}'); expect(getByRole('dialog', { name: 'Session expired' })).toBeVisible()
  expect(emitted()['update:open']).toBeUndefined()
})
```

- [ ] **Step 2: Run the tests and watch them fail.**
  - Run: `npx vitest run src/components/base`
  - Expected: FAIL.
- [ ] **Step 3: Implement the components from Interfaces.**
- [ ] **Step 4: Run the tests and see them pass.** Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "feat(kit): input, switch, radio cards, code input and dialog"`

---

### Task 12: Sign-in screen

**Files:**
- Create:
  - `src/schemas/common.schema.ts`, `src/schemas/auth.schema.ts`
  - `src/composables/auth/useSignInErrorMessage.ts`
  - `src/constants/injectionKeys.ts`
  - `src/components/auth/AuthPanel.vue`, `AuthSignInForm.vue`, `AuthDemoCredentials.vue`, `AuthLanguageSwitch.vue`
  - `src/views/auth/LoginView.vue`
  - `src/router/routes/auth.ts`
- Test:
  - `src/schemas/__tests__/auth.schema.spec.ts`
  - `src/composables/auth/__tests__/useSignInErrorMessage.spec.ts`
  - `src/views/auth/__tests__/LoginView.spec.ts`

**Interfaces:**
- Consumes: `useSession().signIn`, `useLocaleStore`, `env.storefrontUrl`, the kit (Tasks 10–11), `demoAdmin`/`suspendedMember` in tests.
- **Schemas.** Messages are i18n keys.
  - `common.schema.ts`: `passwordSchema = z.string().min(8, 'validation.passwordMin').max(48, 'validation.passwordMax')`.
  - `auth.schema.ts`: `signInSchema = z.object({ identifier: z.string().trim().min(1, 'validation.required'), password: z.string().min(1, 'validation.required'), keepSignedIn: z.boolean() })`. Sign-in doesn't check password length: the backend decides.
  - `type SignInValues = z.infer<typeof signInSchema>`.
- **Demo credentials key:** `demoCredentialsKey: InjectionKey<DemoCredentials>` in `constants/injectionKeys.ts`, marked `// MOCK: M4`.
- **`useSignInErrorMessage(): (error: unknown) => string`** (D14, D15), checked in this order:
  1. 401: `auth.errors.invalidCredentials` ("Those details don't match an account").
  2. 403: `auth.errors.suspended`.
  3. 429 with `retryAfterSeconds`: `auth.errors.tooManyAttemptsIn` with `{ minutes }` (rounded up).
  4. 429 without it: `auth.errors.tooManyAttempts`.
  5. `TWO_FACTOR_UNSUPPORTED`: `auth.errors.twoFactor` ("This account uses two-step sign-in, which the dashboard doesn't support yet. Ask an admin to turn it off.").
  6. Anything else: falls back to `useApiErrorMessage()`.
- **`AuthSignInForm`**:
  - Props: `lockedIdentifier?: string`, `showKeepSignedIn?: boolean` (default `true`), `loading?: boolean`, `error?: string`.
  - Emits `submit(values: SignInValues)`.
  - Uses VeeValidate `useForm` with `toTypedSchema(signInSchema)`. The error renders in a `role="alert"` box above the button.
  - Fields: "Email or username" (`autocomplete="username"`, `dir="ltr"`), Password (`autocomplete="current-password"`), and "Keep me signed in on this device" (off).
- **`AuthPanel`**: the split layout from `login.png`. Dark brand side: cream logo, "DAHAB BACK OFFICE", headline, subtitle. Form side: the default slot. Below 760 px the brand side becomes a top band with the logo only.
- **`AuthLanguageSwitch`**: the "العربية / English" pill. Calls `setLocale`.
- **`AuthDemoCredentials`**: `inject(demoCredentialsKey, null)`. Renders the box only when injected (M4).
- **`LoginView`**: `AuthPanel`, title "Admin sign in", subtitle, `AuthSignInForm`, a "Forgot password?" link, the demo box, and "Back to the store" (only when `env.storefrontUrl` is set; D5). On success it goes to `safeRedirect(route.query.redirect) ?? { name: 'welcome' }`.
- **Routes** (`router/routes/auth.ts`): `authRoutes` = `/login` (name `login`, `meta.public`, lazy-imported). Task 13 adds `/forgot-password`. The "Forgot password?" link uses `{ name: 'forgot-password' }`; in tests the helper's stub route covers it.

- [ ] **Step 1: Write the failing tests.**

```ts
// auth.schema.spec.ts
it('requires identifier and password', () => {
  const r = signInSchema.safeParse({ identifier: ' ', password: '', keepSignedIn: false })
  expect(r.success).toBe(false); expect(r.error?.flatten().fieldErrors).toEqual({ identifier: ['validation.required'], password: ['validation.required'] })
})
it.each([['1234567', false], ['12345678', true], ['x'.repeat(48), true], ['x'.repeat(49), false]])(
  'password %s valid=%s', (value, valid) => expect(passwordSchema.safeParse(value).success).toBe(valid))

// useSignInErrorMessage.spec.ts
it('says when to try again', async () => {
  const { result } = await runInApp(() => useSignInErrorMessage())
  expect(result(new ApiError({ status: 429, code: 'X', retryAfterSeconds: 540 }))).toBe(i18n.global.t('auth.errors.tooManyAttemptsIn', { minutes: 9 }))
})

// LoginView.spec.ts
it('signs in and goes to the remembered page', async () => {
  const { getByLabelText, getByRole, router, user } = await renderWithApp(LoginView, {
    routes: [{ path: '/items', name: 'items', component: { render: () => null } }], path: '/login?redirect=/items' })
  expect(getByRole('switch', { name: /keep me signed in/i })).not.toBeChecked()
  await user.type(getByLabelText(/email or username/i), demoAdmin.email)
  await user.type(getByLabelText(/^password$/i), demoAdmin.password)
  await user.click(getByRole('button', { name: /sign in/i }))
  await waitFor(() => expect(router.currentRoute.value.name).toBe('items'))
})
it('shows one generic message for wrong details', async () => { /* type wrong password → alert has auth.errors.invalidCredentials */ })
it('tells a suspended member', async () => { /* suspendedMember → alert has auth.errors.suspended */ })
it('two-step account sees the explanation', async () => {
  server.use(http.post(apiPath('/auth/login'), () => ok({ twoFactorRequired: true, accountRestored: false })))
  /* submit → alert has auth.errors.twoFactor */
})
it('a language chosen here is saved to the account', async () => {
  /* click العربية → html dir rtl; sign in as demoAdmin; resetToLoginLocale(); applyAccountLocale(demoAdmin.id) → 'ar' */
})
it('shows demo credentials only when provided', async () => { /* render with and without provide(demoCredentialsKey) */ })
```

  Write out the commented test bodies in full when you implement them. Each follows the first test's pattern and asserts the stated message with `getByRole('alert')`.
- [ ] **Step 2: Run the tests and watch them fail.**
  - Run: `npx vitest run src/schemas src/composables/auth src/views/auth`
  - Expected: FAIL.
- [ ] **Step 3: Implement the modules from Interfaces.** Add the `auth.*` and `validation.*` keys to both locale files. The copy comes from `login.png`; write the Arabic yourself and list it for the user to review.
- [ ] **Step 4: Run the tests and see them pass.** Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "feat(auth): sign-in screen"`

---

### Task 13: Forgot password and the session-expired dialog

**Files:**
- Create:
  - `src/composables/auth/usePasswordReset.ts`
  - `src/components/auth/AuthForgotPasswordFlow.vue`, `AuthResetRequestStep.vue`, `AuthResetCodeStep.vue`, `AuthResetPasswordStep.vue`, `AuthSessionExpiredDialog.vue`
  - `src/views/auth/ForgotPasswordView.vue`
- Modify: `src/schemas/auth.schema.ts`, `src/router/routes/auth.ts`
- Test:
  - `src/schemas/__tests__/auth.schema.spec.ts` (extend)
  - `src/composables/auth/__tests__/usePasswordReset.spec.ts`
  - `src/views/auth/__tests__/ForgotPasswordView.spec.ts`
  - `src/components/auth/__tests__/AuthSessionExpiredDialog.spec.ts`

**Interfaces:**
- **Schemas:**
  - `resetRequestSchema = z.object({ identifier: emailOrPhone, channel: z.enum(['EMAIL', 'WHATSAPP']) })`, where `emailOrPhone` accepts `z.string().email()` or `/^\+[1-9]\d{7,14}$/`, with the message `validation.emailOrPhone` (D18).
  - `resetCodeSchema = z.object({ code: z.string().regex(/^\d{6}$/, 'validation.code') })`.
  - `newPasswordSchema = z.object({ password: passwordSchema, confirm: z.string() })`, refined so that `confirm === password`; otherwise the message is `validation.passwordsDontMatch` on `confirm`.
- **`usePasswordReset()`** returns:
  - `step: Ref<'request' | 'code' | 'password'>`
  - `target: Ref<string | null>`
  - `secondsLeft: Ref<number>`
  - `request(input: { identifier: string; channel: OtpChannel }): Promise<void>`
  - `resend(): Promise<void>`
  - `verify(code: string): Promise<void>`
  - `reset(newPassword: string): Promise<void>`

  Rules (spec 4.2 flow 3; D19):
  - `request` always moves to `code`. On 404 it shows the same screen; the token stays null and `verify` then fails with `auth.reset.invalidCode` without calling the backend.
  - The countdown starts from `expiresIn` (300 s).
  - `resend` repeats the last request and restarts the countdown.
  - `verify` stores the **new** token.
  - `reset` shows a success toast `auth.reset.done` ("Password changed — sign in with your new password") and calls `router.replace({ name: 'login' })`.
- **Step components:**
  - `AuthResetRequestStep`: identifier, plus `BaseRadioCards` for Email / WhatsApp.
  - `AuthResetCodeStep`: "We sent a code to {target}" (target inside `<bdi>`), `BaseCodeInput`, countdown `m:ss`, and a Resend link. When the countdown reaches 0: "Code expired".
  - `AuthResetPasswordStep`: new password twice.
  - `AuthForgotPasswordFlow`: switches between the three steps on `step`.
  - Step 1's helper text always reads "If an account exists, we'll send a code".
- **`AuthSessionExpiredDialog`**: `BaseDialog` (`dismissible: false`), opened by `useSessionExpiredDialog().isOpen`.
  - Body: `AuthSignInForm` with `lockedIdentifier = useSessionStore().user.email` and `showKeepSignedIn = false`. Submitting calls `useSession().resume(password)`.
  - Actions: "Not you? Sign out" → `signOut()`.
  - It's mounted in `LayoutDashboard` (Task 14), so the page underneath never unmounts.

- [ ] **Step 1: Write the failing tests.**

```ts
// auth.schema.spec.ts (extend)
it.each([['admin@dahabsweets.com', true], ['+201012345678', true], ['01012345678', false], ['omar', false]])(
  'reset identifier %s valid=%s', (identifier, valid) =>
    expect(resetRequestSchema.safeParse({ identifier, channel: 'EMAIL' }).success).toBe(valid))
it('passwords must match', () => expect(newPasswordSchema.safeParse({ password: 'abcdefgh', confirm: 'abcdefgx' })
  .error?.flatten().fieldErrors.confirm).toEqual(['validation.passwordsDontMatch']))

// usePasswordReset.spec.ts
it('walks request → code → password and resets with the verified token', async () => {
  const { result, router } = await runInApp(() => usePasswordReset())
  await result.request({ identifier: demoAdmin.email, channel: 'EMAIL' }); expect(result.step.value).toBe('code')
  expect(result.secondsLeft.value).toBe(300); await result.verify(RESET_CODE); expect(result.step.value).toBe('password')
  await result.reset('n3wPassword!'); expect(router.currentRoute.value.name).toBe('login')
})
it('an unknown account sees the same code step', async () => {
  server.use(http.post(apiPath('/auth/forgot-password/request'), () => fail(404, 'RESOURCE_NOT_FOUND', 'x')))
  const { result } = await runInApp(() => usePasswordReset())
  await result.request({ identifier: 'nobody@example.com', channel: 'EMAIL' }); expect(result.step.value).toBe('code')
  await expect(result.verify('123456')).rejects.toBeTruthy()
})
it('counts down and resend restarts', async () => {
  vi.useFakeTimers(); const { result } = await runInApp(() => usePasswordReset())
  await result.request({ identifier: demoAdmin.email, channel: 'EMAIL' }); vi.advanceTimersByTime(61_000)
  expect(result.secondsLeft.value).toBe(239); await result.resend(); expect(result.secondsLeft.value).toBe(300)
})

// AuthSessionExpiredDialog.spec.ts
it('signing in again keeps the page and what was typed', async () => {
  await signInAs(demoAdmin)
  const Page = defineComponent({ setup: () => () =>
    h('div', [h('label', ['Note ', h('input')]), h(AuthSessionExpiredDialog)]) })
  const { getByLabelText, user } = await renderWithApp(Page)
  await user.type(getByLabelText('Note'), 'half-written'); useSessionExpiredDialog().open()
  const dialog = await screen.findByRole('dialog'); expect(within(dialog).getByLabelText(/email or username/i)).toHaveValue(demoAdmin.email)
  await user.type(within(dialog).getByLabelText(/^password$/i), demoAdmin.password)
  await user.click(within(dialog).getByRole('button', { name: /sign in/i }))
  await waitFor(() => expect(useSessionExpiredDialog().isOpen.value).toBe(false))
  expect(getByLabelText('Note')).toHaveValue('half-written')
})
it('Not you? signs out', async () => { /* open → click "Not you? Sign out" → route login, tokens cleared */ })

// ForgotPasswordView.spec.ts
it('completes the three steps', async () => { /* type email, pick Email, continue → masked target shown;
  type RESET_CODE → password step; type mismatched → error; matching → login route + success toast */ })
```

- [ ] **Step 2: Run the tests and watch them fail.**
  - Run: `npx vitest run src/schemas src/composables/auth src/components/auth src/views/auth`
  - Expected: FAIL.
- [ ] **Step 3: Implement the modules from Interfaces.** Register `/forgot-password` in `authRoutes`. Add the `auth.reset.*` and `auth.expired.*` keys.
- [ ] **Step 4: Run the tests and see them pass.** Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "feat(auth): forgot password and session-expired dialog"`

---

### Task 14: Start-up, routing and the welcome screen

**Files:**
- Create:
  - `src/router/index.ts`, `src/router/routes/app.ts`, `src/router/routes/dev.ts`
  - `src/plugins/msw.ts`
  - `src/utils/person.ts`
  - `src/components/layout/LayoutPageHeader.vue`, `LayoutDashboard.vue`
  - `src/views/WelcomeView.vue`, `src/views/NotFoundView.vue`
- Modify: `src/main.ts`, `src/App.vue`, `vite.config.ts`, `env.d.ts`
- Test:
  - `src/utils/__tests__/person.spec.ts`
  - `src/views/__tests__/WelcomeView.spec.ts`, `NotFoundView.spec.ts`

**Interfaces:**
- **`startMockApi(): Promise<DemoCredentials>`** (`plugins/msw.ts`): `worker.start({ onUnhandledRequest: 'error', quiet: true })` and returns the demo admin's credentials. Every line carries `// MOCK: M3`.
- **Vite config** (`vite.config.ts`):
  - `msw({ mode: 'worker-only' })` from `msw/vite`, wrapped as `{ ...msw({ mode: 'worker-only' }), apply: 'serve' }` (D2, M3).
  - `server.proxy['/api'] = { target: loadEnv(mode, cwd, '').API_PROXY_TARGET, changeOrigin: true }`.
- **`env.d.ts`:** adds `/// <reference types="msw/vite/client" />`. The mock plugin uses only `msw/browser`, but the reference keeps the types consistent with the plugin.
- **Routes:**
  - `appRoutes` (`router/routes/app.ts`): one layout route, `{ path: '/', component: LayoutDashboard, children: [welcome '' (name `welcome`), …feature routes from later plans…, not-found '/:pathMatch(.*)*' (name `not-found`)] }`. Every view is lazy-imported (`() => import(...)`); the layout itself is not.
  - `devRoutes` (`router/routes/dev.ts`): `/dev/kit` (name `dev-kit`, `meta.public`). Imported only when `import.meta.env.DEV` is true.
  - `router` (`router/index.ts`): `createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes: [...authRoutes, ...appRoutes, ...devRoutes] })`, plus `scrollBehavior`, which returns to the top unless only the query changed.
- **Name helpers** (`utils/person.ts`):
  - `firstNameOf(p: { firstName?: string; displayName: string }): string`
  - `fullNameOf(p: { firstName?: string; lastName?: string; displayName: string }): string`
  - `initialsOf(p): string`. Two letters, uppercase.
- **`LayoutPageHeader`**:
  - Props: `title: string`, `eyebrow?: string`. The default eyebrow is `"{greeting} · {date}"`, from `greetingKey` and `formatPageDate` with `useNow({ interval: 60_000 })`.
  - Slot `actions`.
  - The title is an `<h1>` (`text-page-title font-display`).
- **`LayoutDashboard`** (this task's version): a `<main>` landmark that renders `<RouterView>`, `AuthSessionExpiredDialog` and `useAccessGuard()`. Task 15 adds the frame around it.
- **`WelcomeView`**: `LayoutPageHeader` with title `t('welcome.title', { greeting: t(greetingKey(now)), name: firstNameOf(user) })` and eyebrow = today's date only.
  - English: `"{greeting}, {name}"` → "Good evening, Omar".
  - Arabic: `"{greeting}، {name}"`.
  - The name sits inside `<bdi>`, because names may be in either script.
- **`NotFoundView`**: "This page doesn't exist" and a `BaseButton` back to `welcome`.
- **`App.vue`**: `BaseProvider :dir="store.dir"`, `<RouterView />`, `LayoutToasts`, `useDocumentLocale()`.
- **`main.ts`**, in order:
  1. `createApp(App)`; `app.use(createPinia())`, `app.use(i18n)`.
  2. If `import.meta.env.DEV && env.apiMocking`: `app.provide(demoCredentialsKey, await (await import('./plugins/msw')).startMockApi())` (`// MOCK: M3, M4`).
  3. `onUnauthorized(() => { if (useSessionStore().user) useSessionExpiredDialog().open() })`.
  4. `onForbidden(() => { void reloadAccess(); useToast().show({ message: i18n.global.t('auth.accessChanged') }) })`.
  5. `await restoreSession()`.
  6. `installGuards(router, { isSignedIn: () => useSessionStore().user !== null, canManageTeam: () => canManageTeam(useSessionStore().permissions) })`.
  7. `app.use(router)`; `app.config.errorHandler = () => useToast().show({ tone: 'error', message: i18n.global.t('errors.unexpected') })`.
  8. `await router.isReady()`; `app.mount('#app')`.

- [ ] **Step 1: Write the failing tests.**

```ts
// person.spec.ts
it('builds names and initials', () => {
  const omar = { firstName: 'Omar', lastName: 'Hassan', displayName: 'omar' }
  expect(firstNameOf(omar)).toBe('Omar'); expect(fullNameOf(omar)).toBe('Omar Hassan'); expect(initialsOf(omar)).toBe('OH')
  expect(fullNameOf({ displayName: 'Omar' })).toBe('Omar')
})

// WelcomeView.spec.ts
it('greets by first name with today’s date', async () => {
  vi.useFakeTimers({ now: new Date(2026, 9, 10, 20, 0), toFake: ['Date'] }); await signInAs(demoAdmin)
  const { getByRole, getByText } = await renderWithApp(WelcomeView)
  expect(getByRole('heading', { level: 1, name: 'Good evening, Omar' })).toBeVisible()
  expect(getByText('Saturday, October 10')).toBeVisible()
})
it('greets in Arabic', async () => { /* same clock; setLocale('ar') → heading "مساء الخير، Omar" (name as stored) */ })

// NotFoundView.spec.ts
it('offers a way back to the welcome screen', async () => {
  const { getByRole, router, user } = await renderWithApp(NotFoundView, { path: '/nope' })
  await user.click(getByRole('link', { name: /back to the dashboard/i })); expect(router.currentRoute.value.name).toBe('welcome')
})
```

- [ ] **Step 2: Run the tests and watch them fail.**
  - Run: `npx vitest run src/utils src/views`
  - Expected: FAIL.
- [ ] **Step 3: Implement the modules from Interfaces.** Add the `welcome.*`, `notFound.*` and `auth.accessChanged` keys.
- [ ] **Step 4: Run the tests and see them pass.** `npx vitest run`, `npm run type-check` and `npm run lint:check` all pass.
- [ ] **Step 5: Check by hand in development** (`npm run dev`, mocks on):
  1. The splash shows only on a throttled load.
  2. `/items` redirects to `/login?redirect=/items`.
  3. The demo box shows; signing in as the demo admin opens `/items`, which shows the 404 inside the layout until Plan 4.
  4. Reload: still signed in (sessionStorage).
  5. `/` shows the welcome screen.
- [ ] **Step 6: Check against the real backend.** Set `VITE_API_MOCKING=false` in `.env.local` and restart.
  1. The demo box is gone.
  2. Sign in with a real staff account (the user signs in with their own account).
  3. The network tab shows `/api/v1/auth/login` and then `/api/v1/me` through the proxy.
  4. Delete `.env.local`.
- [ ] **Step 7: Commit.** `git commit -m "feat(app): start-up, routing, welcome and 404"`

---

### Task 15: Dashboard frame — sidebar, phone menu, offline banner

**Files:**
- Create:
  - `src/components/base/BaseDrawer.vue`
  - `src/components/layout/LayoutSidebar.vue`, `LayoutSidebarFooter.vue`, `LayoutMobileNav.vue`, `LayoutOfflineBanner.vue`
- Modify:
  - `src/components/layout/LayoutDashboard.vue`
  - `src/__tests__/setup.ts`: stub `window.matchMedia` so it reports `matches: false` by default
- Test:
  - `src/components/layout/__tests__/LayoutSidebar.spec.ts`, `LayoutSidebarFooter.spec.ts`, `LayoutDashboard.spec.ts`, `LayoutOfflineBanner.spec.ts`

**Interfaces:**
- **`BaseDrawer`** (Reka `DialogRoot`; this task's variant):
  - Props: `open: boolean`, `title: string` (visually hidden), `side?: 'start' | 'end'` (default `end`), `tone?: 'light' | 'dark'`.
  - Emits `update:open`. Default slot.
  - Slides in from `side`. Width `min(320px, 85vw)`. Pads for the safe area. Escape and the scrim close it.
  - Plan 2 adds the editing-panel variant: pinned header and footer, full screen on phones.
- **`LayoutSidebar`**:
  - Logo linking to `welcome`, then the "ADMIN DASHBOARD" tag.
  - A `<nav>` with `navigation` items, filtered by `!hidden` and by `access` through `useCan().canManageTeam`.
  - The active item uses `bg-muted`, matched by path prefix.
  - Emits `navigate`, which the phone menu uses to close itself.
- **`LayoutSidebarFooter`** (prop `tone: 'light' | 'dark'`):
  - Avatar initials, `fullNameOf(user)` and `user.roles[0]`. The role name is English-only, so it goes inside `<bdi>` (spec 6.3).
  - "Open store" (only with `env.storefrontUrl`; external, `noopener noreferrer`).
  - Language row: shows the other language's name and calls `setLocale`.
  - "Sign out" → `useSession().signOut()`.
- **`LayoutMobileNav`**: below 1100 px, a top bar with the logo and a `BaseIconButton icon="menu"` labelled "Open menu". It opens a `BaseDrawer side="start" tone="dark"` holding `LayoutSidebar` and `LayoutSidebarFooter tone="dark"` (spec 6.7). The menu closes when the user navigates.
- **`LayoutOfflineBanner`**: VueUse `useOnline()`. While offline, a slim `role="status"` bar reads "You're offline: changes won't save until you're back".
- **`LayoutDashboard`** (final):
  - From 1100 px (`desktop:`): a fixed sidebar column (`border-e border-card bg-surface`, sidebar then footer) and a content column.
  - Below 1100 px: `LayoutMobileNav` on top.
  - The offline banner sits above everything.
  - The content column holds `<main>` with `<RouterView>`.
  - It keeps the session-expired dialog and `useAccessGuard()` from Task 14.

- [ ] **Step 1: Write the failing tests.**

```ts
// LayoutSidebar.spec.ts
it('shows only phase-1 items, and Team only to team managers', async () => {
  await signInAs(demoEditor); const { getByRole, queryByRole } = await renderWithApp(LayoutSidebar)
  const nav = getByRole('navigation')
  expect(within(nav).getAllByRole('link').map((l) => l.textContent?.trim())).toEqual(['Products', 'Categories', 'Home banners'])
  expect(queryByRole('link', { name: 'Orders' })).toBeNull()
})
it('admins see Team & access', async () => {
  await signInAs(demoAdmin); const { getByRole } = await renderWithApp(LayoutSidebar)
  expect(getByRole('link', { name: 'Team & access' })).toHaveAttribute('href', '/team')
})

// LayoutSidebarFooter.spec.ts
it('switches to Arabic', async () => {
  await signInAs(demoAdmin); const { getByRole, user } = await renderWithApp(LayoutSidebarFooter, { props: { tone: 'light' } })
  await user.click(getByRole('button', { name: /العربية/ })); expect(useLocaleStore().locale).toBe('ar')
})
it('signs out', async () => { /* click Sign out → route login, tokens cleared */ })
it('hides Open store without a storefront URL', async () => { /* env.storefrontUrl null → no "Open store" link */ })

// LayoutDashboard.spec.ts
it('opens and closes the phone menu', async () => {
  await signInAs(demoAdmin) // matchMedia is stubbed to "below 1100 px" in setup.ts
  const { getByRole, user } = await renderWithApp(LayoutDashboard)
  await user.click(getByRole('button', { name: /open menu/i }))
  const menu = await screen.findByRole('dialog'); await user.click(within(menu).getByRole('link', { name: 'Products' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})

// LayoutOfflineBanner.spec.ts
it('appears while offline', async () => {
  const { findByRole } = await renderWithApp(LayoutOfflineBanner)
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false); window.dispatchEvent(new Event('offline'))
  expect(await findByRole('status')).toHaveTextContent(/you're offline/i)
})
```

  `LayoutDashboard` decides whether to show the phone menu with VueUse `useMediaQuery('(min-width: 1100px)')`. In jsdom, stub `window.matchMedia` in `setup.ts` so it returns false by default. That way the phone layout is tested, and the desktop layout is covered by Playwright (Task 16).
- [ ] **Step 2: Run the tests and watch them fail.**
  - Run: `npx vitest run src/components/layout`
  - Expected: FAIL.
- [ ] **Step 3: Implement the components from Interfaces.** Styles follow `products-list.png` and `team-members.png`. Add the `layout.*` keys.
- [ ] **Step 4: Run the tests and see them pass.** `npx vitest run` and `npm run lint:check` pass.
- [ ] **Step 5: Check by hand.**
  - 1440 px: sidebar; footer with name and role; language switch flips the whole layout (sidebar on the right); offline banner appears when devtools is set to offline.
  - 390 px: menu button; dark drawer from the start side; tap targets ≥ 44 px.
- [ ] **Step 6: Commit.** `git commit -m "feat(layout): sidebar, phone menu and offline banner"`

---

### Task 16: `/dev/kit` and end-to-end tests

**Files:**
- Create: `src/views/dev/KitView.vue`, `e2e/fixtures.ts`, `e2e/auth.spec.ts`, `e2e/frame.spec.ts`
- Modify: `playwright.config.ts`, `src/router/routes/dev.ts`
- Delete: nothing

**Interfaces:**
- **`KitView`** (dev only, `meta.public`): every Plan-1 base component in every state, with an English/Arabic toggle at the top (`setLocale`).
  - Button: 4 variants × 3 sizes, plus loading and disabled.
  - Icon button.
  - Input: empty, filled, error, password, read-only.
  - Switch: on, off, disabled.
  - Radio cards.
  - Code input.
  - Dialog.
  - Drawer.
  - Toast: 3 tones, one with an action.
  - Spinner.
  - Icons: the whole registry.
- **`e2e/fixtures.ts`**: re-exports `demoAdmin`, `demoEditor`, `RESET_CODE` from `../src/mocks/fixtures/users`, and a `signIn(page, user, { keep?: boolean })` helper.
- **Playwright config:**
  - `webServer.command: 'npm run dev -- --port 5173 --strictPort'` always (D3); `reuseExistingServer: !process.env.CI`.
  - Projects: `chromium`, `firefox` and `webkit` (desktop devices), and `chromium-phone` (`devices['Pixel 7']`), `firefox-phone` (Desktop Firefox with viewport 390 × 844), `webkit-phone` (`devices['iPhone 14']`).

- [ ] **Step 1: Write the end-to-end tests** (spec 7.2's Plan-1 share).

```ts
// auth.spec.ts
test('signs in, goes to the remembered page, survives reload', async ({ page }) => {
  await page.goto('/categories'); await expect(page).toHaveURL(/\/login\?redirect=%2Fcategories/)
  await page.getByLabel(/email or username/i).fill(demoAdmin.email); await page.getByLabel(/^password$/i).fill('wrong-password')
  await page.getByRole('button', { name: /sign in/i }).click(); await expect(page.getByRole('alert')).toBeVisible()
  await page.getByLabel(/^password$/i).fill(demoAdmin.password); await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/categories$/); await page.reload(); await expect(page).toHaveURL(/\/categories$/)
})
test('forgot password end to end', async ({ page }) => { /* request → code RESET_CODE → new password ×2 → login + toast */ })
test('signed-out redirect ignores off-site targets', async ({ page }) => {
  await page.goto('/login?redirect=//evil.example'); await signIn(page, demoAdmin); await expect(page).toHaveURL(/\/$/)
})

// frame.spec.ts
test('switch to Arabic flips the layout and sticks after reload', async ({ page }) => {
  await signIn(page, demoAdmin); await page.getByRole('button', { name: /العربية/ }).first().click()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl'); await page.reload()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
})
test('phone menu opens, navigates and closes', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 760, 'phone only')
  await signIn(page, demoAdmin); await page.getByRole('button', { name: /open menu/i }).click()
  await page.getByRole('dialog').getByRole('link', { name: 'Categories' }).click()
  await expect(page.getByRole('dialog')).toBeHidden(); await expect(page).toHaveURL(/\/categories$/)
})
test('team managers see Team & access; editors do not', async ({ page }) => { /* demoEditor → no link; /team → / */ })
test('unknown URL shows the 404 inside the layout', async ({ page }) => { /* /nope → heading + back link */ })
```

- [ ] **Step 2: Run them before building `KitView`.**
  - Run: `npm run test:e2e -- --project=chromium`
  - Expected: the auth and frame tests PASS, because the flows already exist from Tasks 12–15. Fix any that fail before continuing.
- [ ] **Step 3: Build `KitView` and register `/dev/kit`.** Check it by hand in both languages at 390 and 1440 px.
- [ ] **Step 4: Run the full matrix.**
  - Run: `npm run test:e2e`
  - Expected: PASS on all six projects.
- [ ] **Step 5: Commit.** `git commit -m "test(e2e): sign-in, forgot password, language and phone menu; add /dev/kit"`

---

### Task 17: Quality gates — CI, size budget, hooks, monitoring

**Files:**
- Create:
  - `.github/workflows/ci.yml`, `.github/dependabot.yml`
  - `.size-limit.json`
  - `src/plugins/sentry.ts`
- Modify:
  - `package.json`: scripts `size`, `audit:prod`; the `simple-git-hooks` and `lint-staged` blocks
  - `src/main.ts`: `void startMonitoring(app, router)` after mount
  - `README.md`: set-up steps
- Test: `src/plugins/__tests__/sentry.spec.ts`

**Interfaces:**
- **`plugins/sentry.ts`:**
  - `startMonitoring(app: App, router: Router): Promise<void>`. Does nothing unless `env.appEnv !== 'local'` and `env.sentryDsn` is set. Otherwise it `import('@sentry/vue')` lazily and calls `init({ app, dsn, environment: env.appEnv, sendDefaultPii: false, beforeSend: scrubEvent })` with Vue Router instrumentation.
  - `scrubEvent(event: ErrorEvent): ErrorEvent`. Removes `request.headers`, `request.cookies`, `request.data` and `request.query_string`. Replaces `user` with `{ id: useSessionStore().user?.id }`. Drops breadcrumb `data` from XHR/fetch breadcrumbs.
- **Size budget** (spec 7.4), using `@size-limit/file` and gzip:
  - "Login route JS" ≤ 170 KB: `["dist/assets/*.js", "!dist/assets/WelcomeView-*.js", "!dist/assets/ForgotPasswordView-*.js", "!dist/assets/NotFoundView-*.js"]`. Every later page adds its own negation.
  - "CSS" ≤ 25 KB: `dist/assets/*.css`.
  - One entry per page chunk, ≤ 60 KB each: `WelcomeView-*.js`, `ForgotPasswordView-*.js`, `NotFoundView-*.js`.
- **Scripts:** `"size": "size-limit"` and `"audit:prod": "npm audit --omit=dev --audit-level=high"`.
- **Hooks:**
  - `"simple-git-hooks": { "pre-commit": "npx lint-staged" }`.
  - `lint-staged`: `*.{ts,vue}` runs `oxlint --fix`, then `eslint --fix`, then `prettier --write`; `*.{json,md,css,html,yml}` runs `prettier --write`.
- **CI** (`ci.yml`): on `pull_request` and on `push` to `main`. Ubuntu, Node 24, npm cache. Steps:
  1. `npm ci`
  2. `npm run type-check`
  3. `npm run lint:check`
  4. `npm run test:unit -- --run`
  5. `npm run build-only`
  6. `! grep -rqE "mockServiceWorker|setupWorker" dist` (M3: MSW never ships)
  7. `npm run size`
  8. `npx playwright install --with-deps`
  9. `npm run test:e2e`
  10. `npm run audit:prod`

  Then upload `playwright-report` when the run fails.
- **Dependabot:** weekly. npm in two groups (`production`, `development`); `cooldown: { default-days: 5 }`. Plus `github-actions` weekly.

- [ ] **Step 1: Write the failing test.**

```ts
it('scrubs tokens and personal data, keeps the member ID', async () => {
  await signInAs(demoAdmin)
  const event = scrubEvent({ type: undefined, request: { headers: { Authorization: 'Bearer a1' }, data: '{"password":"x"}',
    query_string: 'redirect=/x', cookies: {} }, user: { id: 'x', email: 'admin@dahabsweets.com', username: 'omar' },
    breadcrumbs: [{ category: 'xhr', data: { url: '/api/v1/auth/refresh', body: 'r1' } }] })
  expect(event.request).toEqual({}); expect(event.user).toEqual({ id: demoAdmin.id })
  expect(event.breadcrumbs?.[0]?.data).toBeUndefined()
})
```

- [ ] **Step 2: Run the test and watch it fail.**
  - Run: `npx vitest run src/plugins`
  - Expected: FAIL.
- [ ] **Step 3: Implement `plugins/sentry.ts` and wire `startMonitoring` in `main.ts`.**
- [ ] **Step 4: Run the test and see it pass.** Expected: PASS.
- [ ] **Step 5: Set up the size budget and hooks.**
  - Run: `npm run build-only && npm run size`
  - Expected: every entry is under its limit. Record the actual numbers in the commit message.
  - Run `npx simple-git-hooks` once.
- [ ] **Step 6: Add the CI workflow, Dependabot and the README set-up section.** The README lists:
  - Node ≥ 24.12
  - `npm ci`
  - `npx playwright install`
  - `npx simple-git-hooks`
  - `.env.local` for overrides
  - check `types/` against a fresh `/api/docs-json` after backend changes
  - `npm run lint:launch` before launch
- [ ] **Step 7: Run the pipeline locally in CI order.** Every step passes. Check that `grep -rE "mockServiceWorker|setupWorker" dist` prints nothing.
- [ ] **Step 8: Commit.** `git commit -m "ci: pipeline, size budget, pre-commit hook and Sentry"`
- [ ] **Step 9: Hand-offs for the user.**
  - Create the GitHub repository and push.
  - Turn on branch protection for `main`, requiring the CI check.
  - Add `VITE_SENTRY_DSN` when the Sentry project exists.

---

## Roadmap: Plans 2–5 and deployment

Each plan is written in full when we reach it, against the code as it stands then.

**Plan 2 — Team & access (real backend).**
- Check `TEAM_PERMISSIONS` against `GET /permissions` (D16).
- Services for users, roles, permissions and uploads (`GET /uploads/purposes`, `POST /uploads`).
- Kit additions: BaseDrawer editing-panel variant, BaseConfirmDialog, BaseCheckbox (with "some selected"), BaseTabs, BaseBadge, BaseChip, BaseAvatar, BaseSelect, BaseTextarea, BaseImageUpload, BaseSkeleton, BaseEmptyState.
- Unsaved-changes guard; role colour tokens (M13 mock field).
- Members: list (search, role, status; hides `PENDING_DELETION`/`DELETED`); create in up to three calls with recovery; edit sends only what changed; suspend and unsuspend (G3/G4 checks first).
- Roles: cards, create and edit (grouped permissions with search and select all), delete (blocked while it has members; System role locked).
- Access at a glance.
- Permission label translations.
- End-to-end: create a member and a role.

**Plan 3 — Categories (real backend).**
- Types written from the live spec; uploads with `CATEGORY_IMAGE`.
- BaseFieldLocalized.
- List in store order with item counts; inline names; image; on/off (blocked when a visible banner links to it); up/down reorder; create (a sheet on phones); delete (blocked).
- End-to-end: blocked category hide.

**Plan 4 — Items (real backend).**
- `utils/money.ts` (`formatPrice`, `parsePriceInput`); BasePriceInput; the arch image utility.
- List with category chips and the sort order from rule 18; inline price (saved immediately, rolls back on failure, confirms changes over 50%); Available switch.
- Create/edit drawer with variants (type; 1–4, or 1–8 for flavours; unique names), saved with `PUT` and the whole form; create, then switch on when the form's Available is on (two calls); delete (blocked by banner links).
- End-to-end: price edit, create item.

**Plan 5 — Home banners (real backend).**
- Fraunces and Aref Ruqaa fonts.
- Grid in rotation order; reorder; Visible switch with the G2 counters; the last visible banner protected.
- Create/edit drawer, saved with `PUT` and the whole form, with live preview (beside the form on desktop, Edit/Preview tabs on phones): small card, link targets, eyebrow, title, body, button.
- End-to-end: banner limits.

**Deployment plan (when hosting is decided).**
- Host config: SPA fallback; caching (hashed assets for a year, `index.html` never).
- Security headers: CSP, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Robots-Tag`.
- Staging deploys on merge to `main`; production deploys from version tags.
- Sentry source-map upload (D21).
- Launch check: `npm run lint:launch` and a search for `MOCK:` must both come back empty.
