# Dahab — Backend Architecture (Phase 1)

**Status:** design stage, 2026-10-11; branch inventory and audience-aware routes added 2026-10-18. Nothing here is
implemented yet.
**Inputs:** the UI screenshots in [`refs/`](../refs/) and the NestJS + Prisma boilerplate in this repo.

## Contents

- [Dahab — Backend Architecture (Phase 1)](#dahab--backend-architecture-phase-1)
  - [Contents](#contents)
  - [1. Scope](#1-scope)
  - [2. Modules and how they connect](#2-modules-and-how-they-connect)
  - [3. Shared conventions](#3-shared-conventions)
  - [4. Users](#4-users)
  - [5. Permissions](#5-permissions)
  - [6. Branches](#6-branches)
  - [7. Categories](#7-categories)
  - [8. Items](#8-items)
  - [9. Branch inventory](#9-branch-inventory)
  - [10. Banners](#10-banners)
  - [11. Build order](#11-build-order)
  - [12. Open decisions](#12-open-decisions)

---

## 1. Scope

Phase 1 covers seven areas:

| Area        | What it is                                                         | Module                         |
| ----------- | ------------------------------------------------------------------ | ------------------------------ |
| Users       | staff accounts (and, later, customer accounts)                     | `auth`, `user` — existing      |
| Permissions | roles and permissions for the admin dashboard                      | `rbac` — existing              |
| Branches    | the shop's locations                                               | `branch` — new                 |
| Categories  | حلويات شرقي، تورت، علب الهدايا، مشروبات                             | `category` — new               |
| Items       | the products (المنتجات) with their sizes, weights or flavors       | `item` — new                   |
| Inventory   | which items each branch sells, whether they're in stock there, and optional counts | `inventory` — new |
| Banners     | the rotating hero on the home page                                 | `banner` — new                 |


**Later, not in this phase:** cart, checkout and orders, delivery areas and time slots, coupons, favorites,
customer sign-in by phone, the overview dashboard, customers admin, social & contact settings. Anything in this
phase that depends on orders — "best sellers", "sold this week", counts going down as items sell — waits for them
too.

---

## 2. Modules and how they connect

```
  banner ───────▶ item ───────▶ category
                    ▲
  inventory ────────┘
      │
      ▼
  branch ───────▶ user                       (existing — staff assigned to branches)

  item, category, banner ──▶ branch          (resolve the storefront's ?branch=)
  banner, item, category, branch ──▶ upload  (existing — images)
  auth · user · rbac                         (existing — sign-in, accounts, roles, permissions)
```

| Module    | Calls                                    | Why                                                                         |
| --------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| branch    | user, upload                             | check a user exists before assigning them; branch image                     |
| category  | branch, upload                           | resolve `?branch=`; category image                                          |
| item      | category, branch, upload                 | check the category exists; resolve `?branch=`; item image                   |
| inventory | branch, item                             | check the branch and the user's access to it; check the item and its variants |
| banner    | item, category, branch, upload           | check link targets; resolve `?branch=`; use an item's image on the small card |

- A module calls another only through the `*PublicService` exported from its `index.ts`, as the boilerplate does.
- Store-view reads in `item`, `category` and `banner` check availability with a read-only Prisma join on inventory's
  tables (`branch_items`, `branch_stock`). Only `inventory` writes them. A service call would make a cycle, since
  inventory already calls item.
- Nothing calls upward. The only events are the two that inventory listens to: `ItemCreatedEvent` and
  `BranchCreatedEvent`, to add a new item to every branch and stock a new branch with every item (section 9).
- Storefront caches are cleared through one shared prefix (section 3), not through events.

**Routes and audiences**

There is no `/admin/` prefix. Each resource has one set of routes, served by one controller to both the storefront
and the dashboard — the pattern of `PrizeController` and `PrizeService` in fwz-backend. Every route is one of three
kinds:

| Kind        | Marked with                            | Who gets a response                                                       |
| ----------- | -------------------------------------- | ------------------------------------------------------------------------- |
| Shared read | `@AudienceAware(Permissions.X.READ)`   | Everyone. Holders of the permission get the **admin view** (`AudienceGroup.ADMIN`); everyone else, signed in or not, gets the **store view** (`AudienceGroup.USER`). |
| Admin-only  | `@RequirePermission(...)`              | Holders of the permission. 401 without a token, 403 without the permission. |
| Public      | `@Public()`                            | Everyone, same response.                                                  |

- The controller reads the audience with `@CurrentAudience()` and passes it to the service — `list(query, audience)`,
  `findForAudience(idOrSlug, audience)` — and the service builds one query per audience, as
  `PrizeService.buildAdminPrizeQuery` / `buildUserPrizeQuery` do. The store view keeps only what the store may show;
  the admin view sees everything, within branch scope (section 5).
- On a shared read, something the store view may not see — an inactive branch, a deleted item — is a 404, as if it
  didn't exist.
- One response DTO serves both views. Admin-only fields are tagged `@Expose({ groups: [AudienceGroup.ADMIN] })`,
  store-only fields `@Expose({ groups: [AudienceGroup.USER] })`, and `@Serialize` drops what the caller's audience
  may not see.
- Shared reads don't need a token. The storefront has no sign-in yet, so `JwtAuthGuard` lets an audience-aware
  request through without one, as the store view. A token that is sent but invalid or expired is still a 401, so a
  staff member whose token ran out is sent to refresh instead of silently getting the store view. This is the one
  difference from fwz-backend, where audience-aware routes need a login.
- The storefront must not attach a staff token to its requests, or a staff member browsing the store gets the admin
  view.
- In each controller, static sub-paths are declared before `:id` routes (`PUT /banners/order` before
  `PUT /banners/:id`).

Route tables below have an **Access** column: `public`, `shared · <permission>` for a shared read, or the
permission an admin-only route needs. Existing routes (`/auth`, `/me`, `/users`, `/roles`, `/permissions`,
`/uploads`) are unchanged.

---

## 3. Shared conventions

**Arabic and English text.** Stored as two columns (`nameAr`, `nameEn`). The API — admin and store views alike —
sends and receives one object: `"name": { "ar": "كنافة عربي", "en": "Arabic kunafa" }`. Names are required in both
languages; longer texts are optional in either. Add a `LocalizedTextDto`, an `@IsLocalizedText()` validator and a
small mapper between the two shapes to `common/`.

**Default language.** `SUPPORTED_LANGUAGES = ["ar", "en"]`, `DEFAULT_LANGUAGE = "ar"`, and
`User.language @default("ar")`.

**Images.** The boilerplate's upload flow: the admin uploads with `POST /uploads { file, purpose }`, gets a key, and
sends that key in the form (`imageKey`). The service checks the key's purpose and attaches it
(`UploadPublicService.validateKeyForPurpose`, `attach` / `replace`, `detachAll` on delete). Responses return full
URLs. New purposes: `BRANCH_IMAGE`, `CATEGORY_IMAGE`, `ITEM_IMAGE`, `BANNER_IMAGE`.

**IDs and slugs.** Primary keys are `uuid(7)`. Branches, categories and items get a unique `slug` built from the
English name (`slugify` from `@common/constants`) for storefront URLs. `GET /items/:idOrSlug` and the `category`
filter on `GET /items` take either — a UUID is read as an id, anything else as a slug — so the storefront links by
slug and the dashboard by id. Every other route takes `:id`.

**Ordering.** Branches, categories and banners have a `sortOrder`. The admin's up/down arrows send the full new
order: `PUT /<resource>/order { "ids": [...] }`.

**Money.** Integer piasters: `price: 48000` is ٤٨٠ ج.م. No decimals anywhere (see [open decisions](#12-open-decisions)).

**Branch context.** The customer shops from one branch. The store view of items, categories and banners takes an
optional `branch` (slug): with it, it shows only what is available at that branch; without it, what is available at
any active branch ([section 9](#9-branch-inventory) defines "available"). The storefront remembers the customer's
choice and sends it on every request. An unknown or inactive slug is a 404, so the storefront can drop a stale
choice and ask again. The admin view ignores `branch`.

**Caching.** Only the store view is cached in Redis, keyed by the branch it was asked for (`all` when none). The
admin view is read fresh: it depends on the caller's branch scope and has to show an edit the moment it's saved.
Items, categories and banners all depend on availability, so they share one prefix, `store:catalog:`, and any
admin write that can change what they show — items, categories, banners, branches, inventory — clears the whole
prefix at once. That keeps the admin's promise that every edit shows in the store immediately ("أي تعديل بيظهر في
المتجر فورًا") without cache events between modules; admin writes are rare and rebuilding is cheap. `/branches`
keeps its own key, cleared by branch writes.

**Timestamps.** Every table gets `createdAt` and `updatedAt`; they are left out of the sketches below.

---

## 4. Users

**Module:** `auth` and `user` — already built. Staff log in with username, email or phone plus a password, with
optional 2FA; admins manage accounts at `/users` and assign roles at `/users/:userId/roles`.

**Changes for this phase**

- Arabic as the default language (section 3).
- Staff can be assigned to branches — the endpoints live in the branch module (section 6). The assignment decides
  which branches a user sees and edits, unless they hold `branch:access-all` (section 5).
- Seed a real first admin with the `BOOTSTRAP_ADMIN_*` variables; the dev accounts (`root`, `admin`, `test-user`)
  stay for local use.

Customer accounts (the "Karim" chip in the storefront header) come later with the cart and orders; see
[open decisions](#12-open-decisions). Until then every store-view caller is anonymous. Once customers sign in they
still get the store view, and services can add per-customer fields to it from `@CurrentUser()`, as
`PrizeService.attachUserContext` does.

---

## 5. Permissions

**Module:** `rbac` — already built. Permissions are declared in
`src/modules/rbac/constants/permissions.constant.ts`, seeded, and grouped into roles in
`prisma/seeds/data/roles.data.ts`. A `<resource>:read` permission also decides the audience on that resource's
shared reads (section 2).

**New permissions** (same format as the existing ones: `key`, `resource`, `action`, `displayName`, `description`,
`group`):

| Resource  | Actions                                  | Group      |
| --------- | ---------------------------------------- | ---------- |
| branch    | read, create, update, delete, access-all | Branches   |
| inventory | read, update                             | Branches   |
| category  | read, create, update, delete             | Catalog    |
| item      | read, create, update, delete             | Catalog    |
| banner    | read, create, update, delete             | Storefront |

**Branch scope.** A user without `branch:access-all` sees and acts on only the branches they are assigned to
(section 6): the admin view of `GET /branches`, `GET` and `PATCH /branches/:id`, everything under
`/branches/:branchId/inventory`, and `GET /items/:itemId/inventory`, which lists only their branches. Reordering
branches needs `branch:access-all`. The check is one helper in the branch module
(`BranchPublicService.assertAccess`, `accessibleBranchIds`), so orders can reuse it later.

**Roles** (replacing the boilerplate's example roles "User Manager" and "Support"):

| Role           | Permissions                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------- |
| System         | everything (existing, bypasses all checks)                                                          |
| Admin          | everything                                                                                          |
| Content Editor | category, item and banner (all actions); branch:read, branch:access-all, inventory:read — sees stock at every branch, changes none |
| Branch Manager | branch:read, branch:update, inventory:read, inventory:update — their own branches only; category:read, item:read, banner:read |

---

## 6. Branches

**Module:** `branch` — new. The shop's locations: what the storefront shows ("استلام من الفرع", contact, map),
which staff work where, and — through the inventory (section 9) — what each one sells.

```prisma
model Branch {
  id             String       @id @default(uuid(7))
  slug           String       @unique
  nameAr         String
  nameEn         String
  addressAr      String
  addressEn      String
  phone          String?
  whatsapp       String?
  mapUrl         String?
  latitude       Float?
  longitude      Float?
  workingHoursAr String?      // free text for now, e.g. "يوميًا من ١٠ ص لـ ١٢ م"
  workingHoursEn String?
  imageKey       String?
  isActive       Boolean      @default(true)
  sortOrder      Int          @default(0)
  staff          UserBranch[]
  items          BranchItem[]

  @@index([isActive, sortOrder])
  @@map("branches")
}

model UserBranch {
  userId     String
  branchId   String
  assignedBy String
  assignedAt DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  branch     Branch   @relation(fields: [branchId], references: [id], onDelete: Cascade)

  @@id([userId, branchId])
  @@index([branchId])
  @@map("user_branches")
}
```

**Rules**

- A new branch starts carrying every live item, available and not counted (section 9).
- A deactivated branch is left out of the store view of `/branches`, rejected as `?branch=`, and doesn't count toward
  "available at any branch".
- Prefer deactivating a branch to deleting it. Deleting takes its inventory with it; once orders exist, a branch
  with orders can only be deactivated.
- Assigning staff replaces the user's whole branch list in one call.

Rows marked *scoped* follow branch scope (section 5).

| Method | Path                         | Access                | Notes                                                       |
| ------ | ---------------------------- | --------------------- | ----------------------------------------------------------- |
| GET    | `/branches`                  | shared · branch:read  | Store: active branches in order; cached. Admin: *scoped*; active or not, with staff and carried-item counts |
| GET    | `/branches/:id`              | branch:read           | *scoped*; with assigned staff                               |
| POST   | `/branches`                  | branch:create         |                                                             |
| PUT    | `/branches/order`            | branch:update         | also needs `branch:access-all`; `{ ids: [...] }`            |
| PATCH  | `/branches/:id`              | branch:update         | *scoped*; any field, including `isActive`                   |
| DELETE | `/branches/:id`              | branch:delete         |                                                             |
| GET    | `/users/:userId/branches`    | user:read             | a staff member's branches                                   |
| PUT    | `/users/:userId/branches`    | user:update           | `{ branchIds: [...] }`                                      |

**Public service:** `findActiveById(id)`, `findActiveBySlug(slug)` (the storefront's `?branch=`),
`getUserBranchIds(userId)`, `assertAccess(user, branchId)`, `accessibleBranchIds(user)` — for inventory now, orders
later.
**Calls:** user, upload.
**Emits:** `BranchCreatedEvent` (inventory stocks the new branch).

---

## 7. Categories

**Module:** `category` — new. Screens: home categories, the category filter, admin categories.

```prisma
model Category {
  id        String  @id @default(uuid(7))
  slug      String  @unique
  nameAr    String
  nameEn    String
  imageKey  String?
  sortOrder Int     @default(0)     // order in the store
  isActive  Boolean @default(true)  // admin toggle
  items     Item[]

  @@index([isActive, sortOrder])
  @@map("categories")
}
```

**Rules**

- The store view shows a category when it is active **and** has at least one available item (section 9) — at the
  chosen branch, or at any active branch when none is chosen ("هيظهر في القائمة والصفحة الرئيسية أول ما تضيف له
  منتج"). Its count is its available items, counted the same way.
- The admin view shows every category, and counts every item in it, available or not.
- A category with items can't be deleted (`DomainExceptions.resourceInUse`). Move or delete its items first.

| Method | Path                        | Access                 | Notes                                         |
| ------ | --------------------------- | ---------------------- | --------------------------------------------- |
| GET    | `/categories`               | shared · category:read | Store: `branch`; visible categories in order, with item count; cached. Admin: every category, with item count |
| POST   | `/categories`               | category:create        | `{ name, imageKey? }`                         |
| PUT    | `/categories/order`         | category:update        | `{ ids: [...] }`                              |
| PATCH  | `/categories/:id`           | category:update        | name, image, `isActive` (inline edits)        |
| DELETE | `/categories/:id`           | category:delete        | 422 while it has items                        |

**Public service:** `assertExists(id)`, `findByIds(ids)` — for item and banner.
**Calls:** branch, upload.

---

## 8. Items

**Module:** `item` — new. Screens: item cards, category page, item page, related items, admin items list and form.

```prisma
enum ItemOptionType {
  WEIGHT  // الوزن — نصف كيلو، كيلو
  SIZE    // الحجم — صغيرة ١٨ سم، كبيرة ٢٤ سم
  FLAVOR  // النكهة — فراولة
  PIECES  // العدد
}

model Item {
  id                  String         @id @default(uuid(7))
  slug                String         @unique
  categoryId          String
  nameAr              String
  nameEn              String
  badgeAr             String?        // "شارة على الصورة": الأكثر طلبًا، جديد …
  badgeEn             String?
  descriptionAr       String?        @db.Text
  descriptionEn       String?        @db.Text
  ingredientsAr       String?
  ingredientsEn       String?
  storageAr           String?        // "طريقة الحفظ"
  storageEn           String?
  imageKey            String
  optionType          ItemOptionType @default(WEIGHT)  // "الاختيار حسب"
  allowsCustomMessage Boolean        @default(false)   // "يسمح بكتابة على التورتة"
  isAvailable         Boolean        @default(true)    // "متاح" — master switch: off hides it at every branch
  minPrice            Int            // cheapest variant, kept in sync: "يبدأ من" and price sorting
  deletedAt           DateTime?
  category            Category       @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  variants            ItemVariant[]
  branchItems         BranchItem[]

  @@index([categoryId, isAvailable, deletedAt])
  @@map("items")
}

model ItemVariant {
  id          String        @id @default(uuid(7))
  itemId      String
  nameAr      String        // نصف كيلو
  nameEn      String        // Half kilo
  price       Int           // piasters, the same at every branch
  sortOrder   Int           @default(0)
  deletedAt   DateTime?
  item        Item          @relation(fields: [itemId], references: [id], onDelete: Cascade)
  branchStock BranchStock[]

  @@index([itemId])
  @@map("item_variants")
}
```

**Rules**

- An item always has at least one variant. With exactly one, the item page hides the selector.
- Saving the form sends the whole variant list in display order: entries with an `id` are updated, entries without
  one are created, missing ones are removed. `minPrice` is recomputed on every variant change.
- Items and variants are soft-deleted (`deletedAt`) because orders will point at them later. A deleted item is a
  404 in both views.
- The store view leaves out items that aren't available (section 9). An unavailable item's page still loads and
  says it's unavailable.
- `startingPrice` is the cheapest variant overall, even when that variant is sold out at the chosen branch; price
  sorting uses the same `minPrice`.
- The cake message itself is written by the customer at order time — this phase only stores whether an item allows
  one.
- The design's item page shows a delivery line ("في نفس اليوم للطلبات قبل ٢ ظهرًا"). That is store-wide, not per
  item, and arrives with delivery settings later.

| Method | Path                             | Access             | Notes                                                                       |
| ------ | -------------------------------- | ------------------ | --------------------------------------------------------------------------- |
| GET    | `/items`                         | shared · item:read | Both: `category` (id or slug), `search`, `sort` (featured, price_asc, price_desc, newest), `page`, `limit`. Store: `branch`; available items as cards: name, badge, image, category, `startingPrice`, `startingVariantName` ("يبدأ من · نصف كيلو"). Admin: `isAvailable`; every live item as a row with its variants |
| GET    | `/items/:idOrSlug`               | shared · item:read | Store: `branch`; card fields plus description, ingredients, storage, option type and its label, variants (each with `isAvailable`), `allowsCustomMessage`, `isAvailable`, and `branches` — the active branches that have it now, for pickup. Admin: the full form |
| GET    | `/items/:idOrSlug/related`       | public             | `branch`; up to 4 available items from the same category                    |
| POST   | `/items`                         | item:create        | the whole form, variants included                                           |
| PUT    | `/items/:id`                     | item:update        | the whole form                                                              |
| PATCH  | `/items/:id/availability`        | item:update        | `{ isAvailable }` — the list toggle; off at every branch                    |
| PATCH  | `/items/:id/variants/:variantId` | item:update        | `{ price }` — inline price edit in the list                                 |
| DELETE | `/items/:id`                     | item:delete        | soft delete                                                                 |

Until orders exist, "featured" means newest first, and the home page's "الأكثر طلبًا" section can use it.

**Public service:** `findCardsByIds(ids)`, `findByIds(ids)` — for inventory and banner now, cart and orders later.
**Calls:** category, branch, upload.
**Emits:** `ItemCreatedEvent` (inventory adds the item to every branch). Price and availability changes are written
to the audit log.

---

## 9. Branch inventory

**Module:** `inventory` — new. Each branch's own inventory: which items it sells, whether they are in stock there
right now, and — where staff choose to count — how many are left. The designs don't show branches yet; the admin
screen is meant to be a per-branch version of the items list (المنتجات) with a branch picker.

```prisma
model BranchItem {
  branchId    String
  itemId      String
  isAvailable Boolean       @default(true)  // "متاح" at this branch; off when it runs out or isn't made today
  branch      Branch        @relation(fields: [branchId], references: [id], onDelete: Cascade)
  item        Item          @relation(fields: [itemId], references: [id], onDelete: Cascade)
  stock       BranchStock[]

  @@id([branchId, itemId])
  @@index([itemId])
  @@map("branch_items")
}

model BranchStock {
  branchId   String
  itemId     String
  variantId  String
  quantity   Int          // units of this variant on hand; 0 = sold out
  branchItem BranchItem   @relation(fields: [branchId, itemId], references: [branchId, itemId], onDelete: Cascade)
  variant    ItemVariant  @relation(fields: [variantId], references: [id], onDelete: Cascade)

  @@id([branchId, variantId])
  @@index([branchId, itemId])
  @@index([variantId])
  @@map("branch_stock")
}
```

A `BranchItem` row means the branch sells the item. A `BranchStock` row means the branch counts that variant; no
row means it isn't counted.

**What "available" means.** Every store-view read uses this definition.

- An item is available at a branch when the item isn't deleted and its own `isAvailable` is on, the branch is
  active, the branch carries the item with its `isAvailable` on, and at least one of the item's variants is in
  stock there.
- A variant is in stock at a branch when it isn't deleted and the branch either doesn't count it or has more
  than 0.
- With no branch given, available means available at at least one active branch.

**Rules**

- Three switches, from widest to narrowest: the item's `isAvailable` (every branch), `BranchItem.isAvailable` (one
  branch), and a variant's count (one variant at one branch).
- A new item is added to every branch, available and not counted; a new branch starts with every live item the same
  way. Staff remove what a branch doesn't sell.
- A variant added to an item later isn't counted anywhere, so it is on sale wherever the item is.
- Rows for deleted items and variants stay and are ignored; deleting a branch deletes its rows.
- `BranchStock.itemId` must be the variant's own item; the service checks it on every write.
- Nothing lowers the counts in this phase; staff set them by hand. Orders will lower them later through
  `InventoryPublicService` with a conditional update (`quantity >= n`), so two orders can't take the last piece. The
  migration adds `CHECK (quantity >= 0)` by hand, since Prisma can't express it.
- Every route is admin-only and branch-scoped (section 5). The store sees inventory only through availability.
- Availability and count changes are written to the audit log.

| Method | Path                                                   | Access           | Notes                                        |
| ------ | ------------------------------------------------------ | ---------------- | -------------------------------------------- |
| GET    | `/branches/:branchId/inventory`                        | inventory:read   | every live item with this branch's state: carried, `isAvailable`, each variant's `quantity` (`null` = not counted) and whether it's in stock. Filters: `categoryId`, `search`, `carried`, `isAvailable` |
| PUT    | `/branches/:branchId/inventory/:itemId`                | inventory:update | `{ isAvailable, counts: [{ variantId, quantity }] }` — the item's whole state at this branch; adds the item if the branch didn't carry it. Variants left out of `counts` aren't counted |
| PATCH  | `/branches/:branchId/inventory/:itemId/availability`   | inventory:update | `{ isAvailable }` — the list toggle          |
| PATCH  | `/branches/:branchId/inventory/:itemId/variants/:variantId` | inventory:update | `{ quantity }` — inline count edit; `null` stops counting |
| DELETE | `/branches/:branchId/inventory/:itemId`                | inventory:update | the branch stops selling the item            |
| GET    | `/items/:itemId/inventory`                             | inventory:read   | one item across the branches the user can see |

**Public service:** for orders later — check that variants are available at a branch, and lower their counts.
**Calls:** branch, item.
**Listens:** `ItemCreatedEvent`, `BranchCreatedEvent`.

---

## 10. Banners

**Module:** `banner` — new. The hero carousel on the home page and its admin screens.

```prisma
enum BannerLinkType {  // "الزرار بيودّي على"
  ALL_ITEMS
  CATEGORY
  ITEM
}

model Banner {
  id             String         @id @default(uuid(7))
  sortOrder      Int            @default(0)      // rotation order (بانر ١، بانر ٢ …)
  isVisible      Boolean        @default(false)  // "ظاهر"; new banners start hidden
  imageKey       String                          // large image
  eyebrowAr      String?                         // "سطر صغير فوق العنوان"
  eyebrowEn      String?
  titleAr        String                          // multi-line, "\n" separated
  titleEn        String
  bodyAr         String?
  bodyEn         String?
  buttonTextAr   String?                         // "نص الزرار"
  buttonTextEn   String?
  linkType       BannerLinkType @default(ALL_ITEMS)
  linkCategoryId String?
  linkItemId     String?
  cardItemId     String?                         // small card opens this item; null = no card
  cardImageKey   String?                         // replaces the item's image on the card
  cardCaptionAr  String?                         // "نص تحت الصورة الصغيرة"
  cardCaptionEn  String?

  @@index([isVisible, sortOrder])
  @@map("banners")
}
```

**Rules**

- `linkCategoryId` is required when `linkType` is CATEGORY, `linkItemId` when it is ITEM; both are checked to exist.
- The card shows `cardImageKey`, or the item's own image when that is empty ("بنستخدم صورة المنتج المختار — تقدر
  تغيّرها"). Removing the small image clears the card.
- In the store view, if a linked category or item is hidden, deleted or not available at the chosen branch, the
  button points to all items and the card is hidden instead of showing a broken link.

| Method | Path                             | Access               | Notes                                         |
| ------ | -------------------------------- | -------------------- | --------------------------------------------- |
| GET    | `/banners`                       | shared · banner:read | Store: `branch`; visible banners in order, links resolved to slugs, image URLs; cached. Admin: every banner, hidden ones included, with the link and card ids as stored |
| GET    | `/banners/:id`                   | banner:read          |                                               |
| POST   | `/banners`                       | banner:create        |                                               |
| PUT    | `/banners/order`                 | banner:update        | `{ ids: [...] }`                              |
| PUT    | `/banners/:id`                   | banner:update        | the whole edit drawer                         |
| PATCH  | `/banners/:id/visibility`        | banner:update        | `{ isVisible }`                               |
| DELETE | `/banners/:id`                   | banner:delete        | also deletes its images                       |

**Calls:** item, category, branch, upload.

---

## 11. Build order

| Step | Work                                                                                                                                         |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | Foundation: `APP_NAME=Dahab`, Arabic/English locale, `LocalizedTextDto` and mapper, upload purposes, new error codes, the shared `store:catalog:` cache prefix, the audience pieces (below), restore the missing dotfiles (`.env.example`, `.gitignore`, CI workflows, husky, prettier config) |
| 1    | Permissions and roles (section 5), seeded                                                                                                    |
| 2    | Branches, including staff assignment and branch scope                                                                                       |
| 3    | Categories                                                                                                                                   |
| 4    | Items                                                                                                                                        |
| 5    | Branch inventory; adds `?branch=` and the availability rules to the store view of categories and items                                       |
| 6    | Banners                                                                                                                                      |

**Audience pieces for step 0**, ported from fwz-backend: `AudienceGroup` and `Audience` in `common/constants`,
`@AudienceAware` and `@CurrentAudience` in `common/decorators`, `AudienceInterceptor`, `audience` on
`ExtendedRequest`, the group-aware `SerializeInterceptor`, and the `audience` option on `@ApiEndpoint`. Then the
Dahab-only change: `JwtAuthGuard` lets an audience-aware route through when no token is sent (section 2).

Each step ends with its Prisma file and migration, `npm run lint`, `npm run typecheck`, `npm run build`, and a walk
through the new endpoints in Swagger — each shared read once without a token and once as an admin. New Prisma
files: `branch.prisma`, `category.prisma`, `item.prisma`, `inventory.prisma`, `banner.prisma`; `auth.prisma` gains
the `User` back-relation for `UserBranch`. Step 5 adds the back-relations on `Branch`, `Item` and `ItemVariant`, and
its migration adds `CHECK (quantity >= 0)` on `branch_stock` and a `BranchItem` row for every existing branch and
live item.

---

## 12. Open decisions

| #  | Question                                              | Recommendation                                                                                         |
| -- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1  | Do item availability or prices differ per branch?     | Availability yes — each branch has its own inventory (section 9). Prices no: one price per variant everywhere, as the designs show. A per-branch price can be added later if needed. |
| 2  | Are staff tied to branches?                           | Yes, through `UserBranch`. It limits what a user sees and edits unless they hold `branch:access-all` (section 5); orders will use the same scope. |
| 3  | Customer accounts in this phase?                      | No. Staff only for now; customer sign-in comes with the cart and orders.                               |
| 4  | Money unit                                            | Integer piasters (`48000` = ٤٨٠ ج.م).                                                                  |
| 5  | Working hours: free text or per-day open/close times? | Free text now. Structured hours are needed only when delivery slots arrive.                            |
| 6  | Count stock per branch, or only switch it on and off? | Both, with counting opt-in per variant per branch. Not counted is the default, which suits sweets made through the day; count boxed goods and limited cakes. Counts only go down on their own once orders arrive. |
| 7  | Can a branch sell only some variants of an item (e.g. only the small cake)? | Not in this phase: a branch that carries an item offers all its variants. Counting a variant at 0 shows it as sold out in the meantime. If it becomes common, add an `isAvailable` to `BranchStock` and let a row exist without a count. |
| 8  | Must the customer pick a branch before browsing?      | No. Without a pick the store shows what is available at any branch; picking one narrows it. Checkout will require one. |
| 9  | Do new items and new branches start stocked everywhere? | Yes, and staff remove the exceptions. Starting empty risks a new item that never shows up in the store. |
| 10 | What does a non-admin get from an admin-only route?   | 401 without a token, 403 with one that lacks the permission — what `PermissionGuard` already does, and it lets the dashboard tell "sign in again" from "not allowed". A 404 would hide nothing, since the paths are the same ones the storefront calls. 404 stays for data the store view may not see on shared reads. |
