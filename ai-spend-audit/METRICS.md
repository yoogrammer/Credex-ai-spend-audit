# Metrics

## North Star Metric

**Qualified leads generated per week**

Definition: A "qualified lead" is an email capture where the audit showed 
>$200/month in potential savings (meaning the user has a real reason to 
talk to Credex).

Why this and not total signups or total audits:
- Total audits can be gamed (bots, curiosity visits)
- Total emails includes low-savings users Credex can't help yet
- Qualified leads directly predict Credex revenue
- A B2B lead-gen tool at this stage should optimize for pipeline quality, not vanity traffic

## 3 Input Metrics

**1. Audit completion rate**
Definition: % of users who land on the page and complete + submit the form
Target: >25%
Why it matters: If people start the form and abandon, either the form is too complex or the value prop isn't clear enough upfront. This is the biggest lever on total qualified leads.

**2. Savings distribution (% of audits showing >$200/mo)**  
Definition: % of completed audits where totalMonthlySavings > $200
Target: >15%
Why it matters: This is determined partly by who we acquire (right audience = higher savings), partly by audit engine quality. If this drops, either we're reaching the wrong users or our pricing data is stale.

**3. Email capture rate (post-results)**
Definition: % of completed audits where user submits email
Target: >30%
Why it matters: Value shown → email captured is the core funnel step. If this is low, the results page isn't compelling enough or the modal is too aggressive.

## What We'd Instrument First

1. Mixpanel or Posthog event: `audit_completed` with properties: { totalMonthlySavings, toolCount, useCase, teamSize }
2. Event: `lead_captured` with { savingsTier, source: 'modal' | 'auto' }
3. Event: `share_clicked` with { platform: 'copy' | 'twitter', savings }
4. Event: `credex_cta_clicked` (only fires for >$500 savings users)
5. Funnel visualization: landing → form_started → form_completed → lead_captured → credex_cta_clicked

## Pivot Trigger

If after 500 audits:
- Audit completion rate < 10% → form is too long, simplify to 3 tools max
- % showing >$200 savings < 5% → wrong audience, adjust distribution or reconsider pricing rules
- Email capture rate < 10% → results page not compelling, redesign hero section
- Zero Credex consultations booked in first 2 weeks → disconnect between tool and sales funnel, fix CTA
# METRICS

The single North Star metric is qualified audit-to-lead conversion rate. This tool is meant to generate high-intent leads for Credex, so the most important outcome is not raw traffic but the share of users who finish an audit and then choose to receive the report.

Three input metrics drive that North Star: audit completion rate, percent of audits with savings above $100/month, and email capture conversion rate from the results page. If more users finish the audit and a meaningful share see large savings, lead conversion should improve.

What I would instrument first is: landing page view, form start, audit completed, results viewed, modal opened, lead submitted, and consultation clicked. That gives a full funnel from interest to handoff.

A pivot decision would be triggered if fewer than 5% of completed audits become leads after traffic quality is reasonably validated, or if the savings recommendations are too weak to motivate a follow-up. At that point, the product may need a different offer, a narrower target audience, or a more compelling consultation CTA.
