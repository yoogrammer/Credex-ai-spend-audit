# AI Spend Audit

> Free tool for startup founders and engineering managers to audit their AI tool spending and find savings in 30 seconds.

## What it does
AI Spend Audit ingests a team's AI subscriptions (tool, plan, seats, monthly cost) and runs a deterministic rules-based audit to surface exact dollar savings and clear next steps. It's built for founders and engineering leaders who need defensible numbers fast — not vague marketing copy.

## Screenshots
![Form](screenshots/form.png)
![Results](screenshots/results.png)
![Share](screenshots/share.png)

## Live Demo
[https://example.com](https://example.com)

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- Anthropic API key (free credits available)
- Resend account (free tier: 100 emails/day)

### Install & Run Locally
```bash
git clone [repo-url]
cd ai-spend-audit
npm install
cp .env.local.example .env.local
# Fill in your environment variables (see below)
npm run dev
```

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=        # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # From Supabase project settings
SUPABASE_SERVICE_ROLE_KEY=       # From Supabase project settings (keep secret)
ANTHROPIC_API_KEY=               # From console.anthropic.com
RESEND_API_KEY=                  # From resend.com dashboard
RESEND_FROM_EMAIL=               # Verified sender email or onboarding@resend.dev
NEXT_PUBLIC_APP_URL=             # Your deployed URL
```

### Deploy to Vercel
```bash
npx vercel --prod
# Add environment variables in Vercel dashboard
```

### Run Tests
```bash
npm run test
npm run test:coverage
```

## Decisions

### 1. Rules-based audit engine over AI-generated recommendations
**Decision:** Hardcoded rules for the audit logic, AI only for the summary paragraph.
**Why:** Audit math must be deterministic and defensible. A finance person reading "you're paying $40/seat on Business when Pro is $20/seat and covers your use case" needs to trust the number instantly. LLM outputs can hallucinate prices or reasoning. Rules don't. AI is used where it adds value (personalization of summary) not where it introduces risk (the numbers themselves).

### 2. Next.js App Router with server components
**Decision:** Use Next.js App Router and server components for the public `/results/[id]` pages and API routes.
**Why:** Server components let us fetch data server-side and strip PII before rendering, improving SEO and page load for shared links. Keeping frontend and backend in one deployment unit reduces operational complexity and lets us edge-cache the shareable pages efficiently.

### 3. Supabase (Postgres) over custom DB + auth
**Decision:** Use Supabase for persistence, RLS, and quick integration with Next.
**Why:** Supabase's managed Postgres and RLS give secure defaults without heavy ops. JSONB fits the tool list model and the free tier is sufficient for early validation; migration paths to managed Postgres or replicas are straightforward as traffic grows.

### 4. Email-after-value instead of gating with email
**Decision:** Show results first, request email after the user sees savings.
**Why:** Users are unwilling to commit contact data before seeing value. Delivering measurable savings first increases trust and conversion, and produces higher-quality leads for Credex. It also reduces noise from testers and bots.

### 5. Public shareable URL with UUIDs and no PII
**Decision:** Generate `/results/{uuid}` links that contain no PII and are non-sequential.
**Why:** UUIDs reduce accidental discovery and avoid the UX cost of human slugs. Stripping PII from the public view protects users while keeping results shareable and indexable for social previews.

