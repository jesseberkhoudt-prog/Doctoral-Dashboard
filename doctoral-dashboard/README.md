# Doctoral Dashboard (MVP Scaffold)

This is a **starter repo** for your password-protected, editable “Doctoral Dashboard”.
It includes:
- Next.js (App Router) + TypeScript
- Supabase Auth + Postgres schema (SQL included)
- TipTap rich text editor (editable pages)
- Tagging model (Mega/Macro/Micro + custom)
- Basic page CRUD stubs, version history stubs, export stubs
- Minimal, clean “research cockpit” UI layout

> Note: This is a scaffold. You’ll run `npm install` then `npm run dev`.
> You must supply your own Supabase project URL + anon key via env vars.

## 1) Prereqs
- Node.js 18+ (20 recommended)
- A Supabase project (free tier works)

## 2) Setup Supabase
1. Create a Supabase project
2. In Supabase SQL Editor, run:
   - `supabase/schema.sql`
3. In Supabase Auth:
   - Enable Email auth
   - Create your admin user (your email)

## 3) Configure env
Copy `.env.example` to `.env.local` and fill in:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## 4) Install + run
```bash
npm install
npm run dev
```

Open http://localhost:3000

## 5) What’s implemented (MVP)
- Auth: email/password login page, protected routes
- Layout: left sidebar nav
- Pages: Dashboard, PoP, Lit Review Builder, Methods, Data & Evidence, Writing Studio, Tasks, Timeline, Meetings, Exports
- Editable content blocks with TipTap
- Page records stored in Supabase table `pages`
- Tags stored in `tags`, join table `page_tags`
- Version stubs: `page_versions` written on explicit “Save Version”

## 6) Next steps (easy upgrades)
- Full-text search (Postgres tsvector)
- Viewer-mode share links (signed tokens)
- File uploads to Supabase Storage (already scaffolded)
- Kanban drag/drop + calendar timeline
- Qual coding workspace (codes, excerpts, themes)

---
Built as an MVP for Jesse’s doctoral workflow.
