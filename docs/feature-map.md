# Dahab Dashboard — Phase 1 Feature Map

What the dashboard does in phase 1. Details and rules live in the spec: `docs/specs/2026-10-20-dashboard-phase-1-design.md`.

**Data source:** 🟢 real backend (live now) · 🟡 mocks until the backend builds the endpoints

---

## 1. Access 🟢

| Feature | What staff can do |
|---|---|
| Sign in | Email or username + password, Show password, "Keep me signed in" |
| Forgot password | Email or phone → 6-digit code by email or WhatsApp → new password |
| Staying signed in | Sessions renew silently; if one expires mid-work, a sign-in dialog appears without losing the open drawer; sign out |
| Language | Switch Arabic ⇄ English, saved to the account |
| Access control | Team & access is shown only to members allowed to manage the team |

## 2. App frame 🟢

| Feature | What it is |
|---|---|
| Navigation | Sidebar on desktop; menu button + drawer on tablets and phones |
| Welcome screen | "Good evening, Omar" + today's date |
| System screens | Logo splash on load, 404 page, offline banner, toasts |

## 3. Items (products) 🟡

| Feature | What staff can do |
|---|---|
| Items list | See all items, filter by category, sorted by category then name |
| Inline edits | Change a variant's price right in the list (confirmation if it changes by more than 50%); switch Available on/off |
| Create / edit | Category, photo, Arabic + English name, badge, variant type (weight / size / pieces: up to 4; flavor: up to 8) with a name and price each, cake message allowed, description, ingredients, storage, Available |
| Delete | With confirmation; blocked if a visible banner links to the item |

## 4. Categories 🟡

| Feature | What staff can do |
|---|---|
| Categories list | In store order, with item counts; reorder with up/down |
| Inline edits | Arabic + English name, image, on/off switch |
| Create | Name in both languages + image |
| Delete | Blocked while it has items or a banner links to it |

## 5. Home banners 🟡

| Feature | What staff can do |
|---|---|
| Banner grid | In rotation order; reorder; Visible switch (counters show the 10-total / 5-visible limits; the last visible banner is protected) |
| Create / edit | Main image, small card (linked item, optional own image, caption), eyebrow line, title, body, button text and target (all items / category / item), Visible |
| Live preview | Beside the form on desktop; Edit / Preview tabs on phones |
| Delete | With confirmation; blocked for the last visible banner |

## 6. Team & access 🟢 (role colour 🟡 until the backend adds it)

| Feature | What admins can do |
|---|---|
| Members | List with search, role and status; create (names, username, email, phone, password with Generate, photo, role, Account active); edit; suspend / unsuspend |
| Roles | Role cards with member count and permission bar; create / edit (name, description, colour, permissions grouped with search and select all); delete (blocked while it has members; the System role is locked) |
| Access at a glance | A grid of what each role can do in each area |

## 7. Throughout

- Arabic and English, right-to-left and left-to-right, desktop and phone.
- Loading skeletons, empty states, "blocked, here's why" explanations, unsaved-changes warning, Retry on failures.
- `/dev/kit`: a development-only page showing every component.

---

## Not in phase 1

- Overview, Orders, Customers, Delivery & offers, Social & contact (hidden from the sidebar).
- Branches and per-branch stock.
- Two-factor sign-in; members changing their own password.
- "Sold this week" and "last active" (no data from the backend).
- No-access and error pages (a redirect and a toast instead).
