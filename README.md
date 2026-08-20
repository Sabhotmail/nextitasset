# nextitasset

ระบบ IT Asset Management บน Next.js + PostgreSQL + Prisma พร้อม unified audit trail

## Tech Stack

- Next.js 16 (App Router)
- PostgreSQL + Prisma
- NextAuth (Credentials)
- Tailwind CSS
- ExcelJS, Recharts, react-qr-code

## Getting Started

1. Copy environment file:

```bash
cp .env.example .env
```

2. Update `DATABASE_URL` and `AUTH_SECRET` in `.env`

3. Install and setup database:

```bash
npm install
npm run db:push
npm run db:seed
```

4. Run development server:

```bash
npm run dev
```

5. Login with default credentials:

- Username: `admin`
- Password: `admin1234`

## Features

- Asset CRUD with search/filter/pagination
- Field-level audit (`AssetEvent`) on every write
- Global history + per-asset timeline
- Movement flows: Assign, Transfer, Return, Dispose, Restore
- Employee & Location master data + import
- Bulk actions with batch audit
- Excel import/export
- Dashboard charts
- Reports: location, maintenance cost, aging
- QR label printing
- Point-in-time snapshot viewer

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run db:push` — sync schema to database
- `npm run db:seed` — seed admin user and demo data
