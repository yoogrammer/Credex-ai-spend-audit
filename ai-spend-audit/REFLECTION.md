# Reflection

## 1. The Hardest Bug

[STARTER — edit with your real bug:]

The hardest bug was in the audit engine's redundancy detection. When a user
had both Cursor and GitHub Copilot AND Cursor was also triggering a plan
downgrade recommendation independently, the total savings calculation was
double-counting — the Copilot redundancy saving was being added on top of
a Copilot plan-downgrade saving that was already calculated.

[FILL IN: What hypotheses did you form? What did you try first?
Example: "My first hypothesis was that the reduce() summing the totals
was wrong. I added console.logs and confirmed the individual recommendation
objects were correct — so the bug was in how recommendations were being
merged, not calculated."]

[FILL IN: What actually fixed it?
Example: "The fix was deduplicating recommendations by toolId before
summing — if a tool already had a redundancy recommendation, skip
the plan-mismatch recommendation for the same tool. Added a Set to
track processed toolIds."]

What I learned: [FILL IN — one genuine insight from debugging this]

---

## 2. A Decision I Reversed

[STARTER — edit with your real reversal:]

I originally planned to use AI (the Anthropic API) to generate the entire
audit — not just the summary paragraph, but the actual recommendations and
savings calculations.

I reversed this on Day [X] after [FILL IN: what made you change your mind.
Be specific — was it a hallucinated price? A slow response? Reading the
assignment more carefully and noticing "The logic must be defensible"?]

The switch to rules-based audit logic with AI only for the summary paragraph
was the right call because [FILL IN: 2-3 specific reasons from your experience
building it, not generic reasons].

The tradeoff I accepted: [FILL IN: what you gave up by going rules-based —
e.g., "The rules don't handle unusual pricing situations like annual billing
discounts or custom enterprise contracts well. A hybrid approach might work
better in v2."]

---

## 3. What I'd Build in Week 2

[STARTER — edit with your real priorities:]

The three things I'd build in week 2, in priority order:

**1. Benchmark mode** — "Your AI spend per developer is $X.
Companies your size average $Y."
This is the most shareable feature. Right now the audit is useful but
personal. Benchmarks make it social — people share things that let them
compare themselves to peers. I'd collect anonymized spend-per-seat data
from audit completions and build a rolling average by team size bucket
(1-5, 6-20, 21-50, 51+).

**2. [FILL IN your second priority — be specific about why]**

**3. [FILL IN your third priority]**

What I would NOT build: [FILL IN — something that seems obvious but
you decided against and why]

---

## 4. How I Used AI Tools

[STARTER — edit with your real usage:]

Tools used: Claude (primary), [FILL IN any others]

**What I used AI for:**
- Generating boilerplate: shadcn/ui component scaffolding,
	API route structure, Supabase client setup
- Writing first drafts of the markdown files (GTM, ECONOMICS)
	which I then rewrote with real specifics
- Debugging: pasting error messages and asking for diagnosis

**What I did NOT trust AI with:**
- The audit engine rules — I wrote every rule myself and
	verified each savings calculation by hand with a calculator
- The user interview notes — those conversations were real,
	notes are mine
- The DEVLOG entries — I wrote those myself day by day
- Final pricing verification — I checked every price on vendor
	sites personally

**One specific time the AI was wrong:**
[FILL IN — this must be real and specific.
Example: "Claude told me the Claude Team plan minimum was 3 seats.
I checked claude.ai/upgrade and it's actually 5 seats minimum.
If I'd trusted this without checking, my audit engine rule for
Claude Team would have been wrong for 3-4 seat teams — exactly
the users most likely to be on the wrong plan."]

---

## 5. Self-Rating

| Dimension | Rating | Reason |
|-----------|--------|--------|
| Discipline | [X]/10 | [FILL IN — be honest about starting late] |
| Code quality | [X]/10 | [FILL IN — specific thing you're proud of and one weakness] |
| Design sense | [X]/10 | [FILL IN] |
| Problem-solving | [X]/10 | [FILL IN] |
| Entrepreneurial thinking | [X]/10 | [FILL IN — did you actually talk to users?] |

[Below the table, 1-2 sentences expanding on your lowest rating —
showing self-awareness scores higher than defensiveness]
