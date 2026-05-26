# ShopWithEasy

Next.js 15 e-commerce app with Clerk, Prisma, Supabase PostgreSQL, and Stripe.

## Setup

```bash
npm install --legacy-peer-deps
cp .env.example .env.local
```

Fill in Clerk, `DATABASE_URL`, Supabase keys, and Stripe keys in `.env.local`.

```bash
npx prisma generate
npx prisma db push
```

Create a public Supabase Storage bucket `product-images` (or set `SUPABASE_PRODUCT_IMAGES_BUCKET`).

Optional first admin:

```bash
ADMIN_EMAIL='you@example.com' ADMIN_PASSWORD='your-password' ADMIN_NAME='Your Name' node scripts/setup-admin.mjs
```

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev (Turbopack) |
| `npm run build` | Production build |
| `npm run db:push` | Push Prisma schema |
| `npm run db:studio` | Prisma Studio |
| `npm run db:psql` | psql helper (needs `psql` CLI) |

## Notes

- Use `npm install --legacy-peer-deps` if npm reports peer dependency conflicts between Clerk and Next/React.
