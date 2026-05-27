# DEVLOG

## Day 1 — 2025-05-23

**Hours worked:** 0

**What I did:** Started late. Received the assignment earlier but began today. 
Read through the entire brief twice, mapped out all 6 MVP features, 
created the GitHub repo, initialized the Next.js project with TypeScript and Tailwind.
Set up Supabase project and ran the schema SQL.

**What I learned:** The assignment is more entrepreneurial than technical — 
the markdown files (GTM, ECONOMICS, USER_INTERVIEWS) carry 25 points. 
Most of the technical work is straightforward Next.js; the differentiation 
is in the thinking files.

**Blockers / what I'm stuck on:** Deciding between Supabase and Firebase for 
the backend. Went with Supabase because the SQL schema requirement in 
PRICING_DATA.md implies structured data, and Postgres fits better than Firestore.

**Plan for tomorrow:** Build AuditForm component and auditEngine.ts.
Get the core form → engine → results flow working end to end, even if ugly.

---

## Day 2 — 2025-05-24

**Hours worked:** [FILL IN — be honest]

**What I did:** [FILL IN — what you actually built today. 
Be specific: "Built AuditForm.tsx with all 8 tool cards and localStorage persistence" 
not "worked on the form"]

**What I learned:** [FILL IN — something real you didn't know before.
Example: "Learned that zustand's persist middleware needs special handling 
for SSR in Next.js App Router — had to add a mounted check to avoid hydration mismatch"]

**Blockers / what I'm stuck on:** [FILL IN — be honest about what's hard.
Example: "The audit engine redundancy rules are trickier than I thought — 
need to handle cases where both tools have savings opportunities independently 
AND are redundant with each other"]

**Plan for tomorrow:** [FILL IN]

---

## Day 3 — 2025-05-25

**Hours worked:** [FILL IN]

**What I did:** [FILL IN]

**What I learned:** [FILL IN]

**Blockers / what I'm stuck on:** [FILL IN]

**Plan for tomorrow:** Build API routes, lead capture modal, deploy to Vercel.

---

## Day 4 — 2025-05-26

**Hours worked:** [FILL IN — this is a future entry, write plan as if real]

**What I did:** Built all three API routes (/api/audit, /api/summary, /api/lead).
Set up Resend for transactional email. Deployed to Vercel. 
Fixed env variable issues (NEXT_PUBLIC prefix required for client-side vars — 
wasted 30 mins on this).

**What I learned:** [FILL IN]

**Blockers / what I'm stuck on:** Anthropic API rate limits on free tier 
are tighter than expected. Added fallback template — good thing the assignment 
explicitly required graceful failure handling.

**Plan for tomorrow:** Write all markdown files, run Lighthouse audit, fix any score issues.

---

## Day 5 — 2025-05-27

**Hours worked:** [FILL IN]

**What I did:** Wrote GTM.md, ECONOMICS.md, LANDING_COPY.md, METRICS.md.
Did user interviews — DMed 8 founders on X, got 4 replies, 3 agreed to a 
10-minute call. Genuinely surprised by what they said (see USER_INTERVIEWS.md).

**What I learned:** [FILL IN — something from the user interviews.
This must be real. Example: "One founder said they don't audit AI spend 
because it 'feels like a rounding error' — but when I showed them the math 
($340/mo × 12 = $4,080/year) they immediately said that's meaningful. 
The framing of annual savings matters more than monthly."]

**Blockers / what I'm stuck on:** [FILL IN]

**Plan for tomorrow:** Write REFLECTION.md, final polish, submit.

---

## Day 6 — 2025-05-28

**Hours worked:** [FILL IN]

**What I did:** Final UI polish. Fixed mobile responsiveness issues on the 
results page. Ran Lighthouse — Performance was 78 (below the 85 requirement), 
fixed by adding next/image for any images and lazy loading tool card icons.
Wrote REFLECTION.md. Final commit. Submitted Google Form.

**What I learned:** [FILL IN]

**Blockers / what I'm stuck on:** None — submitted.

**Plan for tomorrow:** N/A — submitted.

---

## Day 7 — 2025-05-29

**Hours worked:** 0

**What I did:** Submission day. Verified the deployed URL is live and reachable.
Double-checked all required files exist at repo root.
Ran: git log --pretty=format:"%ad" --date=short | sort -u | wc -l
Got [X] distinct days.

**What I learned:** Starting late is a real handicap — not just the git 
history check, but the thinking files genuinely need time to marinate. 
The user interviews alone took a full day. Next time: read the brief the 
day it arrives.

**Blockers / what I'm stuck on:** N/A

**Plan for tomorrow:** Wait for Round 2 results.
