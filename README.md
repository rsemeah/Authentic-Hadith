# Authentic Hadith

A calm, Apple-like MVP for reading, searching, and reflecting on authentic Islamic hadith with AI assistance. Built with Next.js (App Router), Tailwind CSS, Supabase, and the OpenAI API.

## Getting started
1. Install dependencies (requires access to npm registry):
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your Supabase and OpenAI credentials.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000 to view the app.

## Supabase setup
Run the SQL from the project brief to create tables, RLS policies, and seed example data. Generate typed definitions with:
```bash
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  --schema public \
  > src/types/supabase.ts
```

## Project structure
- `src/app` – App Router pages and API routes
- `src/lib` – Supabase helpers
- `src/types` – Supabase TypeScript definitions
- `src/app/(app)` – Auth-guarded pages (home, hadith search/detail, assistant, saved, settings, help, sources)

## Notes
- The assistant is tuned for language and thematic support only; it should not provide fatwas or rulings.
- Arabic text uses Noto Sans Arabic for comfortable reading with RTL layout.
