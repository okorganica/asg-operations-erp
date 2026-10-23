# ASG Systems ERP — GitHub Pages Demo

This is a static, browser-only ERP prototype for evaluating the ASG Systems workflow. It contains fictional sample data only.

## Deploy to GitHub Pages (quick static demo)
1. Download and unzip `asg-systems-erp-demo.zip`.
2. In your GitHub repository, upload `index.html` to the repository root (not inside a nested folder).
3. Open **Settings → Pages** and choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
4. Open the Pages URL after the deployment finishes. If you use GitHub Actions instead, ensure the workflow publishes the root/static files as the Pages artifact.
5. Hard refresh the browser (Ctrl+F5) if an old blank page is cached.

## Important if reusing the existing Vite repository
Your previous `asg-operations-erp` project was React + TypeScript + Vite. This deliverable is a standalone static HTML demo and does not need Vite. Do not replace `src/` or change the Vite entry point piecemeal. Either:
- deploy this `index.html` as a static root-only project, or
- keep the existing Vite project intact and implement the ERP within its existing `src/` structure with `base: "/asg-operations-erp/"` and its existing GitHub Actions workflow.

## Demo behavior
- Navigation across Dashboard, CRM, Projects, Sales & Quotations, Inventory, Procurement, Finance, Service Desk, HR & Tasks, Reports, and Settings.
- Add/edit/delete demo records, stock adjustments, mark invoice paid, print quotation, and CSV exports.
- Data persists in browser `localStorage` on the current browser/device only. Use Reset demo data to restore initial fictional records.
- No login, server database, multi-user sync, accounting compliance, or real ASG data connection is provided.

## Production requirements
Before business use, add a secure backend/database, authentication, server-side authorization, audit logs, validation, backups, restore tests, monitoring, and a reviewed data migration process. GitHub Pages is static hosting and cannot securely host backend secrets or server-side business logic.
