# Noorul Huda Islamic Academy - Swalah Class Finance

A modern, institutional-grade class financial ledger, fee tracking, contribution management, and payment reminder system built with React, Vite, Tailwind CSS, TypeScript, and Express / Vercel Serverless.

## Features

- **Dashboard & Analytics**: Real-time totals, category breakdowns, monthly trends, and collection rates.
- **Student Ledger**: Comprehensive student directory with balances, roll numbers, and contact details.
- **Contributions & Campaigns**: Goal tracking, contribution status by student, and progress indicators.
- **Expense Logging**: Granular categories, receipts, approval statuses, and notes.
- **Automated Email Reminders**: Instant payment notices sent via SMTP / relay.
- **Reporting & Exports**: Export full ledger data to PDF and Excel format.
- **Audit Logs**: Track every financial update and transaction.
- **Vercel & Cloud Ready**: Pre-configured with `vercel.json` for one-click deployment.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend / API**: Express & Vercel Serverless Functions (`/api/send-payment-request`)
- **Exporting**: jsPDF, AutoTable

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open `http://localhost:3000` to view the app.

### 4. Build for Production
```bash
npm run build
```

## Deployment to Vercel

1. Import this repository in [Vercel](https://vercel.com).
2. Set the project name (e.g., `swalahfinancial`).
3. Click **Deploy**.
