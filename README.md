# ASG Operations ERP

Responsive starter ERP for ASG Systems Pakistan, built with React, TypeScript, Vite and Supabase.

## Included
- CEO-style dashboard with sample revenue/collections chart, KPIs, project portfolio, service queue and quick actions.
- Modules: CRM, Sales & Quotes, Projects, Inventory, Procurement, Finance, Service & AMC, HR & Workforce, Reports and Admin.
- Reusable create/edit/delete workflows for the initial operational tables, basic validation, search, loading/error states and delete confirmation.
- English/Urdu interface direction toggle (initial RTL support).
- Supabase email/password sign-in and database adapter.
- Initial PostgreSQL schema with RLS policies in `supabase/schema.sql`.
- Responsive desktop/tablet/mobile layout.

## Run locally
1. Install Node.js 20+.
2. Extract the ZIP and open the folder in a terminal.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local`.
5. Create a Supabase project and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`.
6. In Supabase SQL Editor, run `supabase/schema.sql`.
7. In Supabase Authentication, enable Email provider and create/invite your first user.
8. Run `npm run dev`.

If you do not configure Supabase, the UI runs in demo mode. Demo changes are in-memory and are not shared/persistent.

## Build
```bash
npm run build
```

## Upload to GitHub
1. Create a new **private** repository named `asg-operations-erp` (recommended because ERP source may reveal business workflows).
2. Extract this ZIP and open a terminal in the extracted folder.
3. Run:
   ```bash
   git init
   git add .
   git commit -m "Initial ASG Operations ERP starter"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/asg-operations-erp.git
   git push -u origin main
   ```
4. Do not commit `.env.local` or any Supabase service-role key. The `.gitignore` excludes `.env` files.

## Deploy
Vercel or Netlify can deploy the Vite app. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as deployment environment variables.

## Important incomplete items before production
This is a starter, not a fully audited enterprise ERP. Before real business use:
- Role-specific authorization is not yet granular enough. The included RLS policies allow authenticated users to read and update most operational tables; only deletion is limited to CEO/admin. Tighten policies by role and branch, especially Finance, HR and sensitive records.
- CEO dashboard values and chart data are demo values, not calculated from live ERP records.
- Advanced quotations/BOQ line items, tax accounting, payment allocations, double-entry ledger, AR/AP ageing, approval workflows, project costing, stock movement ledger, serial/lot movement, attendance/leave, timesheets, document uploads, notifications, SLA timers, AMC renewal alerts and vendor comparison are not implemented yet.
- Reports CSV export and full Admin user/role UI are not implemented.
- The Urdu toggle currently changes RTL layout and label in the header; full translated labels/content still need to be added.
- Run security review and test with multiple users/roles before inviting 25+ staff.
- Add automated unit/integration tests, audit-log triggers and backups/retention policy before production.

## Architecture
- Frontend: React + TypeScript + Vite
- Database/Auth: Supabase (PostgreSQL + Auth)
- Database schema: `supabase/schema.sql`
