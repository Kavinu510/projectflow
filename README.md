# FernFlow

FernFlow is a project and task management tool, built with Next.js App Router and Supabase.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database / Auth**: Supabase
- **Styling**: Tailwind CSS
- **Components**: Lucide Icons, Recharts, Sonner

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Create a new Supabase project.
   - Run the SQL migration found in `supabase/schema.sql` to create all required tables, policies, and seed data.
   - Go to your Supabase project settings and copy the API keys.

3. **Configure environment variables**:
   - Copy `.env.example` to `.env.local`
   ```bash
   cp .env.example .env.local
   ```
   - Update `.env.local` with your Supabase URL, Anon Key, and Service Role Key.

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   The app will be running at `http://localhost:4028`.

## Build for Production

```bash
npm run build
npm start
```