# Peanut Butter Manufacturing Management System

Internal manufacturing management system for peanut butter production.

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Backend**: Supabase
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth

## Business Process

```
Incoming Receipt → Sorting Using Sortex → Roasting Temperature Monitoring → Finished Goods (Peanut Butter)
```

Each production process revolves around a manually entered Batch Number. One batch must be fully traceable from start to finish.

## Database Schema

### Tables

1. **batches** - Master table for production process
2. **incoming_receipts** - Track raw peanut intake
3. **sorting_efficiency_form** - Digital sorting efficiency form
4. **roasting_temperature_form** - Monitor roasting temperatures every 30 minutes
5. **finished_goods** - Track final production output

### User Roles

- **Admin**: Full system access
- **Analyst**: Create/edit sorting forms, roasting logs, view reports
- **Production Staff**: Create batches, manage incoming receipts, view finished goods

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in Supabase Dashboard
3. Run the migration file: `supabase/migrations/001_initial_schema.sql`
4. Enable authentication in Supabase Dashboard
5. Create user roles in Supabase Auth

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

## Build Phases

- **Phase 1**: Supabase setup, Database schema, Authentication, Roles ✅
- **Phase 2**: Batch Management, Incoming Receipt Form
- **Phase 3**: Sorting Efficiency Form
- **Phase 4**: Roasting Temperature Monitoring
- **Phase 5**: Finished Goods
- **Phase 6**: Dashboard and Traceability

## Pages

1. Login Page
2. Dashboard
3. Batch Management
4. Incoming Receipt Form
5. Sorting Efficiency Form
6. Roasting Temperature Monitoring Form
7. Finished Goods Form
8. Batch Traceability View
