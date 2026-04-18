# ResumeEvy — Complete Setup & Deployment Guide

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, Tailwind CSS, Framer Motion |
| Auth | NextAuth.js v5 (Google, GitHub, Email/Password) |
| Database | PostgreSQL + Prisma ORM |
| AI | OpenAI GPT-4o |
| Storage | Cloudflare R2 |
| Payments | Stripe |
| Email | Nodemailer (Resend/SMTP) |
| Deployment | Vercel / Cloudflare Pages |

---

## 1. Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Clone & Install

```bash
cd resumeevy
npm install
```

### Environment Variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` (see `.env.example` for full reference).

### Database Setup

```bash
# Push schema to your database
npm run db:push

# Or run migrations (production-ready)
npm run db:migrate

# Seed initial data (admin + test user)
npm run db:seed

# Open database UI
npm run db:studio
```

### Start Development Server

```bash
npm run dev
# → http://localhost:3000
```

**Test accounts after seeding:**
- Admin: `admin@resumeevy.com` / `Admin123!`
- User: `test@resumeevy.com` / `Test123!`

---

## 2. External Services Setup

### 2.1 PostgreSQL (Neon.tech — Free)

1. Go to [neon.tech](https://neon.tech) → Create project
2. Copy the connection string
3. Set `DATABASE_URL=postgresql://...` in `.env.local`

```bash
# Or use local PostgreSQL:
DATABASE_URL=postgresql://postgres:password@localhost:5432/resumeevy
```

### 2.2 OpenAI API

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Set `OPENAI_API_KEY=sk-...` in `.env.local`
4. Recommended model: `gpt-4o` (set `OPENAI_MODEL=gpt-4o`)

**Cost estimate:** ~$0.005 per resume tailor job

### 2.3 Cloudflare R2 Storage

1. Go to Cloudflare Dashboard → R2 → Create bucket `resumeevy-files`
2. Create API token with R2 read/write permissions
3. Set environment variables:

```env
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=resumeevy-files
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

4. Enable public access on bucket for downloads, or use presigned URLs

### 2.4 Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourdomain.com/api/auth/callback/google` (prod)
5. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`

### 2.5 Stripe Payments

1. Go to [stripe.com](https://stripe.com) → Create account
2. Get API keys from Dashboard → Developers → API Keys

**Create Products & Prices:**

```bash
# In Stripe Dashboard → Products → Add Product:

# 6-Month Pro Plan
Name: "ResumeEvy Pro - 6 Months"
Price: $49 (recurring, every 6 months)
→ Copy Price ID → STRIPE_PRICE_SIX_MONTH=price_xxx

# Yearly Pro Plan  
Name: "ResumeEvy Pro - Yearly"
Price: $79 (recurring, yearly)
→ Copy Price ID → STRIPE_PRICE_YEARLY=price_xxx

# Lifetime Access
Name: "ResumeEvy Lifetime"
Price: $199 (one-time)
→ Copy Price ID → STRIPE_PRICE_LIFETIME=price_xxx
```

**Webhook Setup:**

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local dev
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy webhook signing secret → STRIPE_WEBHOOK_SECRET=whsec_xxx
```

For production, add webhook in Stripe Dashboard:
- URL: `https://yourdomain.com/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### 2.6 Email (Resend — Recommended)

1. Go to [resend.com](https://resend.com) → Create account
2. Add and verify your domain
3. Get API key

```env
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=re_xxxxxxxxxxxx
EMAIL_FROM=ResumeEvy <noreply@yourdomain.com>
```

---

## 3. Production Deployment

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add AUTH_SECRET
vercel env add OPENAI_API_KEY
# ... (all vars from .env.example)

# Deploy to production
vercel --prod
```

**Important Vercel settings:**
- Framework: Next.js
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`

### Option B: Cloudflare Pages

```bash
# Build
npm run build

# Deploy with Wrangler
npx wrangler pages deploy .next/

# Note: Some Node.js APIs may need edge-compatible alternatives
# Set runtime to "nodejs" in API routes that use Node.js features
```

### Option C: Self-Hosted (Docker)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t resumeevy .
docker run -p 3000:3000 --env-file .env resumeevy
```

---

## 4. Post-Deployment Checklist

### Database
- [ ] Run `npm run db:migrate` for production migrations
- [ ] Run `npm run db:seed` to create admin user
- [ ] Verify database connection

### Auth
- [ ] Set `AUTH_SECRET` to a random 32+ char string: `openssl rand -base64 32`
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Update OAuth redirect URIs with production domain

### Stripe
- [ ] Switch to live Stripe keys (remove `_test_` from keys)
- [ ] Add production webhook endpoint
- [ ] Test checkout flow end-to-end

### Cloudflare R2
- [ ] Verify bucket permissions
- [ ] Test file upload and download
- [ ] Set CORS policy if needed

### Security
- [ ] All environment variables set (no test/placeholder values)
- [ ] HTTPS enabled
- [ ] Rate limiting configured (see middleware.ts)
- [ ] Admin email set to your email

### Monitoring
- [ ] Set up error tracking (Sentry recommended)
- [ ] Configure uptime monitoring
- [ ] Review Stripe webhook logs

---

## 5. Admin Panel Access

1. Register an account or use seeded admin account
2. Update user role to ADMIN in database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'youremail@example.com';
```

Or via Prisma Studio:
```bash
npm run db:studio
```

Access admin at: `https://yourdomain.com/admin`

---

## 6. Customization

### Adding Templates
1. Add template to `lib/templates.ts`
2. Add thumbnail to `public/templates/`
3. Create rendering in PDF generator

### Changing AI Model
```env
OPENAI_MODEL=gpt-4o-mini  # Cheaper, faster
OPENAI_MODEL=gpt-4o       # Better quality (default)
```

### Adjusting Plan Limits
Edit `lib/stripe.ts` → `PLANS` object to change feature limits

### Custom Domain Email
Replace Resend with any SMTP provider in `lib/email.ts`

---

## 7. Key File Structure

```
resumeevy/
├── app/
│   ├── (auth)/           # Login, register, forgot-password
│   ├── (dashboard)/      # Protected user routes
│   │   ├── dashboard/    # Main dashboard
│   │   ├── resumes/      # Resume list
│   │   ├── tailor/       # AI tailoring engine
│   │   ├── builder/      # Resume builder
│   │   ├── templates/    # Template gallery
│   │   └── billing/      # Subscription management
│   ├── (admin)/          # Admin panel (ADMIN role required)
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth + register + forgot-password
│   │   ├── resumes/      # CRUD + download
│   │   ├── tailor/       # AI tailoring
│   │   ├── upload/       # File upload + parse
│   │   ├── stripe/       # Checkout, portal, webhooks
│   │   └── ai/           # AI suggestions
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx          # Landing page
├── components/
│   ├── admin/            # Admin dashboard
│   ├── dashboard/        # Dashboard UI components
│   ├── landing/          # Landing page sections
│   ├── resume/           # Builder & tailor engine
│   ├── shared/           # Providers
│   └── ui/               # Toaster, etc.
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── email.ts          # Email templates
│   ├── openai.ts         # AI functions
│   ├── prisma.ts         # DB client
│   ├── r2.ts             # Cloudflare R2
│   ├── stripe.ts         # Stripe + plans
│   ├── templates.ts      # 20+ resume templates
│   └── utils.ts          # Helpers
├── prisma/
│   ├── schema.prisma     # Full DB schema
│   └── seed.ts           # Seed data
├── middleware.ts          # Route protection
├── .env.example          # All env vars documented
└── SETUP.md              # This file
```

---

## 8. Revenue Model

| Plan | Price | Monthly Revenue per User |
|------|-------|--------------------------|
| Free | $0 | $0 (acquisition) |
| 6-Month | $49 | ~$8.17/mo |
| Yearly | $79 | ~$6.58/mo |
| Lifetime | $199 | one-time |

**Target:** 1,000 paid users = $7,000-8,000 MRR

---

## Support

- Issues: Create a GitHub issue
- Email: admin@resumeevy.com (set in `.env`)
