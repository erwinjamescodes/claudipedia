# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Commands
- `npm run dev` - Start development server (uses Turbopack for faster builds)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Testing & Database
No explicit test commands configured. Check for database operations via Supabase CLI or direct API testing.

## Project Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router and TypeScript
- **Database**: Supabase (PostgreSQL) with server-side rendering support
- **State Management**: Zustand with persistence + TanStack Query for server state
- **UI**: Tailwind CSS + shadcn/ui components (Radix UI primitives)
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Supabase Auth with middleware protection

### Application Structure
This is a **Board Exam Preparation App** with the following core functionality:

#### Main Features
1. **Study Session Management**: Create sessions with multiple study modes (Random, By Chapter, Mixed, Mock Exam)
2. **Question Interface**: Interactive Q&A with timer, progress tracking, and keyboard shortcuts
3. **Progress Analytics**: Real-time tracking with chapter-level performance breakdown
4. **Session Summaries**: Detailed results with review options

#### Route Architecture
- `/` - Landing page with setup instructions
- `/auth/*` - Authentication flow (login, signup, password reset)
- `/protected` - Main dashboard (requires authentication)
- `/study/create` - Session configuration
- `/study/[id]` - Active question interface
- `/study/[id]/summary` - Session results
- `/review`, `/statistics`, `/settings` - Additional features (partially implemented)

### State Management Pattern
Uses a **three-store architecture**:
- **Session Store** (`/lib/stores/session-store.ts`) - Session lifecycle and settings
- **Question Store** (`/lib/stores/question-store.ts`) - Current question state and answers
- **Timer Store** (`/lib/stores/timer-store.ts`) - Time tracking for sessions and questions

All stores use Zustand with persistence for state management.

### Database Schema
Core tables:
- `study_sessions` - Session metadata and configuration
- `user_progress` - Individual question responses with timing
- `session_question_pool` - Question ordering and completion tracking
- `mock_exam_settings` - Mock exam configurations
- `user_statistics` - Performance analytics

### Key Development Patterns

#### API Structure
- All API routes in `/app/api/` following Next.js App Router conventions
- RESTful endpoints with proper error handling
- Supabase client for database operations in `lib/supabase/`

#### Component Organization
- **Page components** in `/app/` directories
- **Reusable components** in `/components/` with shadcn/ui in `/components/ui/`
- **Study-specific components** in `/components/study/`
- **Dashboard components** in `/components/dashboard/`

#### Data Fetching
- **TanStack Query** for all client-side data fetching
- **Server Components** for initial data loading
- **Optimistic updates** for immediate user feedback

### Authentication Flow
- **Middleware** (`/middleware.ts`) protects routes and handles redirects
- **Supabase SSR** configuration for server-side auth checks
- **Protected routes** automatically redirect unauthenticated users

### Important Conventions

#### Keyboard Shortcuts System
The question interface supports full keyboard navigation:
- `1-4` keys for answer selection
- `Enter` to submit answers
- `Space` for next question
- `F` to flag questions
- `S` to skip questions

Implemented via custom hook: `/lib/hooks/use-keyboard-shortcuts.ts`

#### Environment Variables
Required for Supabase integration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

#### TypeScript Configuration
Uses strict mode with path aliases (`@/*` maps to root directory).

### Current Implementation Status
- **Fully implemented**: Dashboard, session creation, question interface, progress tracking
- **Partially implemented**: Review mode (UI exists, backend planned), statistics, settings
- **Database schema**: Complete with proper relationships and indexes

### Development Notes
- The app focuses on **educational technology patterns** with timer management and progress tracking
- **Real-time feedback** is crucial - all user interactions should provide immediate visual response
- **Session persistence** ensures users never lose progress
- Uses **modern React patterns** with proper TypeScript coverage throughout