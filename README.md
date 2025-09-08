## Encyclopedia of Counseling

An interactive study app for counseling exam prep featuring an Arcade Mode for rapid-fire questions, progress tracking, and review. Built with Next.js App Router, Supabase Auth, Tailwind CSS, and shadcn/ui.

### Features

- **Arcade Mode**: Time-bound quiz sessions with next-question flow, answer submission, and end-of-session review.
- **Session Analytics**: View performance analytics for each session (powered by Recharts).
- **Chapters Catalog**: Organized question bank by chapter (see `lib/constants.ts` `CHAPTERS`).
- **Authentication**: Supabase email/password auth with secure cookie sessions across Client/Server/Middleware.
- **Protected Routes**: Middleware-enforced redirects to keep private pages secure.
- **Keyboard Shortcuts**: Quick navigation and actions during Arcade sessions.
- **Timer and Progress**: Store-backed timer with UI progress components.
- **Modern UI**: Tailwind CSS + shadcn/ui + Radix primitives; responsive and accessible.
- **Dark Mode**: Theme switching via `next-themes`.
- **Data Fetching**: TanStack Query for caching, mutations, and devtools.
- **Type-Safe Forms**: `react-hook-form` + `zod` validation.

### Tech Stack

- **Framework**: Next.js (App Router), React 19, TypeScript
- **Auth & Backend**: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **Styling/UI**: Tailwind CSS, shadcn/ui, Radix UI
- **State & Data**: TanStack Query, Zustand
- **Charts**: Recharts
- **Forms/Validation**: react-hook-form, zod
- **Theming**: next-themes
- **Tooling**: ESLint, Turbopack, PostCSS, Tailwind plugins

### Installation

1. **Prerequisites**

- Node.js ≥ 18 (LTS recommended)
- A Supabase project (free tier is fine)

2. **Clone the repository**

```bash
git clone https://github.com/<your-org-or-user>/encyclopedia-of-counseling.git
cd encyclopedia-of-counseling
```

3. **Install dependencies**

```bash
npm install
# or
yarn
# or
pnpm install
```

4. **Set up environment variables**

Create a `.env.local` file in the project root with the following (see Environment Variables below for details):

```bash
NEXT_PUBLIC_SUPABASE_URL="https://<your-supabase-project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY="<your-anon-or-publishable-key>"

# Optional (used for metadata/URLs in some environments)
VERCEL_URL="<your-vercel-deployment-hostname>" # e.g. my-app.vercel.app
```

5. **Run the development server**

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Usage

- **Start dev server**:

```bash
npm run dev
```

- **Build for production**:

```bash
npm run build
```

- **Start production server** (after build):

```bash
npm start
```

- **Lint**:

```bash
npm run lint
```

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL. Find it under Project Settings → API.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`: Your Supabase anonymous or publishable key (client-safe).
- `VERCEL_URL` (optional): Set automatically on Vercel; useful for generating absolute URLs in some contexts.
