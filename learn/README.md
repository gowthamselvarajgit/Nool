# learn/ — NOOL Hands-On Tutorial

A complete, file-by-file walk-through of the NOOL saree-workshop ERP I built for my parents.

## How to open

**Just double-click [`index.html`](index.html)** — it will open in your default browser.
That's the master table of contents. From there you can click any chapter to jump in.

## How it's organised

The tutorial is split into **85 chapters**, each in its own focused HTML file so the
explanations stay clear and nothing gets cut off:

- `index.html` — the master table of contents (start here)
- `styles.css` — shared stylesheet used by every chapter
- `chapters/01-the-story.html` → `chapters/85-...html` — one file per chapter

**Read them in order.** Start with Chapter 01 and click "Next chapter →" at the bottom
of each page.

## What you'll learn

Across 85 chapters, the tutorial covers every file in NOOL — backend and frontend —
in the order it makes sense to learn them:

| Phase | Chapters | What's covered |
| --- | --- | --- |
| 1 — Context | 01–04 | The story, what NOOL does, architecture, database model |
| 2 — Backend Setup | 05–07 | pom.xml, application.properties, BackendApplication |
| 3 — Foundations | 08–10 | Enums, exceptions, common DTOs |
| 4 — Entities | 11–19 | Every JPA entity, line by line |
| 5 — Security | 20–23 | JWT, BCrypt, role-based access |
| 6 — Auth module | 24–28 | Login flow end-to-end |
| 7–14 — Backend modules | 29–53 | Employees, attendance, daily work, salary, owners, inventory ⭐, payments, dashboard |
| 15–17 — Frontend setup | 54–62 | Vite, React, routing, api.js, utils |
| 18 — UI components | 63–66 | Layout, common, table, calendars |
| 19–22 — Pages | 67–84 | Every page: public, admin, worker, owner |
| 23 — Wrap-up | 85 | Quick start + interview prep |

## Archived

`_ARCHIVED-single-file-tutorial.html` is the older single-page version. It still works,
but the multi-page version is much cleaner and won't cut off content.

## Share it

Send the whole `learn/` folder to anyone learning the project. They just open
`index.html` and they're off.
