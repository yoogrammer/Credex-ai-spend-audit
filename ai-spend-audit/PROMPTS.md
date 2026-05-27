# LLM Prompts

## Audit Summary Prompt

### The Prompt

**System:**
"You are a financial analyst specializing in SaaS tool optimization for startups. Be direct, specific, and actionable. Never use filler phrases."

**User:**
"Write a 100-word personalized audit summary for this team:
- Team size: {teamSize}
- Primary use case: {useCase}
- Tools analyzed: {toolNames}
- Total monthly spend: ${totalMonthlySpend}
- Total potential savings: ${totalMonthlySavings}/month (${totalAnnualSavings}/year)
- Top recommendation: {topRecommendation.recommendedAction} for {toolName} — saves ${monthlySavings}/month

Write exactly 100 words. Start with their situation, identify the biggest opportunity, end with a specific action. No bullet points. No headers. Plain paragraph only."

### Why I Wrote It This Way
The system prompt forces an expert persona and removes hedging language so the summary reads like a concise analyst brief. The 100-word constraint ensures the UI layout stays consistent and the message is actionable without verbosity. "No filler phrases" prevents meaningless intros like "In this report" — every word must convey information. A single-paragraph response is easiest to surface in a small results panel and reads naturally in social previews.

### What I Tried That Didn't Work
I tried an unconstrained prompt and received long, repetitive summaries that overflowed the UI and diluted the key recommendation. I also experimented with bullet lists; they rendered poorly in the compact card and reduced perceived personalization. Zero-shot prompts without a system role produced generic language that felt like marketing rather than a concise financial recommendation.

### Fallback Template
When the API fails, use this fallback paragraph (fill placeholders server-side):

"We analyzed your {teamSize}-person team's AI subscriptions. The clearest opportunity is to {topRecommendation.recommendedAction} for {toolName}, which would save approximately ${monthlySavings}/month. Overall we estimate ${totalMonthlySavings}/month in savings. Action: review the {toolName} plan and migrate to the recommended tier or alternative within 7 days to capture immediate cost improvements."

### Why Rules For The Audit Engine
The audit math itself deliberately does NOT use AI. Reasons:
1. Determinism — same input must always produce same output. Users need to trust the numbers.
2. Defensibility — every recommendation traces to a specific rule and a verified price.
3. Cost — running LLM inference on every rule check would add latency and API cost with no quality gain.
4. Debuggability — when a rule is wrong, it's trivially fixable. LLM reasoning errors are opaque.
# PROMPTS

## Summary Prompt
I use a deterministic system prompt plus a structured user prompt that includes the team size, use case, tool names, spend, savings, and top recommendation. The prompt asks for exactly 100 words, plain paragraph only, no headers, and a direct action-oriented closing. That keeps the output short enough to scan and consistent enough to fit on a screenshot-friendly results page.

### System
You are a financial analyst specializing in SaaS tool optimization for startups. Be direct, specific, and actionable. Never use filler phrases.

### User
Write a 100-word personalized audit summary for this team:
- Team size: {teamSize}
- Primary use case: {useCase}
- Tools analyzed: {toolNames joined by comma}
- Total monthly spend: ${totalMonthlySpend}
- Total potential savings: ${totalMonthlySavings}/month (${totalAnnualSavings}/year)
- Top recommendation: {topRecommendation.recommendedAction} for {topRecommendation.toolId} — saves ${topRecommendation.monthlySavings}/month

Write exactly 100 words. Start with their situation, identify the biggest opportunity, end with a specific action. No bullet points. No headers. Plain paragraph only.

## What I Tried That Didn't Work
- A looser prompt that allowed bullet points produced summaries that were too long for the page.
- A generic marketing tone created vague text that did not sound finance-literate.
- Asking the model to invent exact savings detail led to hallucinated numbers, so the prompt now anchors to the audit result payload only.
