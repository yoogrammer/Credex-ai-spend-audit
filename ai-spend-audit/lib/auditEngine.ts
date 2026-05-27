import {
    AuditInput,
    AuditRecommendation,
    AuditResult,
    ToolEntry,
    ToolId
} from './types'
import { PRICING } from './pricing'

function normalizePlanKey(plan: string): string {
    return plan.trim().toLowerCase().replace(/\s+/g, '_')
}

function getPlanPrice(toolId: ToolId, plan: string): number | null {
    const table = PRICING[toolId]
    if (!table) return null
    const key = normalizePlanKey(plan)
    if (key in table) return table[key].price
    // try direct match fallback
    const direct = Object.entries(table).find(([k]) => k.toLowerCase() === plan.trim().toLowerCase())
    return direct ? direct[1].price : null
}

function calcSavings(current: number, recommendedPricePerSeat: number | null, seats: number, overrideDrop = false) {
    if (overrideDrop) {
        // full drop: save entire current spend
        const monthlySavings = Math.max(0, current)
        return { monthlySavings, annualSavings: monthlySavings * 12 }
    }
    if (recommendedPricePerSeat == null) return { monthlySavings: 0, annualSavings: 0 }
    const recommendedTotal = recommendedPricePerSeat * (seats || 1)
    const monthlySavings = Math.max(0, current - recommendedTotal)
    return { monthlySavings, annualSavings: monthlySavings * 12 }
}

function priorityForAmount(monthlySavings: number): 'high' | 'medium' | 'low' {
    if (monthlySavings > 500) return 'high'
    if (monthlySavings >= 100) return 'medium'
    return 'low'
}

export function runAuditEngine(input: AuditInput): Omit<AuditResult, 'id' | 'summary' | 'createdAt'> {
    const byTool = new Map<ToolId, ToolEntry>()
    input.tools.forEach((t) => byTool.set(t.toolId, t))

    const recommendations: AuditRecommendation[] = []

    // Start with default "no change" recommendations
    for (const t of input.tools) {
        recommendations.push({
            toolId: t.toolId,
            currentSpend: t.monthlySpend,
            recommendedAction: 'No change needed',
            recommendedPlan: undefined,
            monthlySavings: 0,
            annualSavings: 0,
            reason: "You're on the right plan for your team size and use case.",
            priority: 'low'
        })
    }

    const findRec = (toolId: ToolId) => recommendations.find((r) => r.toolId === toolId)!

    // RULE SET 1: Wrong plan for seat count
    for (const t of input.tools) {
        const rec = findRec(t.toolId)
        const planKey = normalizePlanKey(t.plan)

        if (t.toolId === 'cursor') {
            if (planKey === 'business' && t.seats <= 2) {
                const price = getPlanPrice('cursor', 'pro')
                const s = calcSavings(t.monthlySpend, price, t.seats)
                rec.recommendedAction = "Switch to 'pro' plan"
                rec.recommendedPlan = 'pro'
                rec.monthlySavings = s.monthlySavings
                rec.annualSavings = s.annualSavings
                rec.reason = 'Business plan is designed for larger teams. Pro gives the same core features at half the price for small teams.'
                rec.priority = priorityForAmount(rec.monthlySavings)
            }
            if (planKey === 'pro' && t.seats === 1 && t.monthlySpend > 20) {
                // flag overpay
                const s = calcSavings(t.monthlySpend, getPlanPrice('cursor', 'pro'), t.seats)
                rec.recommendedAction = "Flag: overpay on Pro"
                rec.recommendedPlan = 'pro'
                rec.monthlySavings = s.monthlySavings
                rec.annualSavings = s.annualSavings
                rec.reason = 'Pro with 1 seat should cost $20; you appear to be paying more.'
                rec.priority = priorityForAmount(rec.monthlySavings)
            }
        }

        if (t.toolId === 'github_copilot') {
            if (planKey === 'business' && t.seats <= 2) {
                const price = getPlanPrice('github_copilot', 'individual')
                const s = calcSavings(t.monthlySpend, price, t.seats)
                rec.recommendedAction = "Switch to 'individual' plan"
                rec.recommendedPlan = 'individual'
                rec.monthlySavings = s.monthlySavings
                rec.annualSavings = s.annualSavings
                rec.reason = 'Individual plan at $10/seat covers solo and small setups. Business features only matter at 10+ seats.'
                rec.priority = priorityForAmount(rec.monthlySavings)
            }
            if (planKey === 'enterprise' && t.seats < 10) {
                const price = getPlanPrice('github_copilot', 'business')
                const s = calcSavings(t.monthlySpend, price, t.seats)
                rec.recommendedAction = "Switch to 'business' plan"
                rec.recommendedPlan = 'business'
                rec.monthlySavings = s.monthlySavings
                rec.annualSavings = s.annualSavings
                rec.reason = 'Enterprise tier adds SSO and security features that only matter for larger orgs.'
                rec.priority = priorityForAmount(rec.monthlySavings)
            }
        }

        if (t.toolId === 'claude') {
            if (planKey === 'team' && t.seats < 5) {
                const price = getPlanPrice('claude', 'pro')
                const s = calcSavings(t.monthlySpend, price, t.seats)
                rec.recommendedAction = "Switch to 'pro' plan"
                rec.recommendedPlan = 'pro'
                rec.monthlySavings = s.monthlySavings
                rec.annualSavings = s.annualSavings
                rec.reason = 'Claude Team has a 5-seat minimum. Under 5 users, individual Pro accounts are cheaper.'
                rec.priority = priorityForAmount(rec.monthlySavings)
            }
            if (planKey === 'max' && input.useCase !== 'coding' && t.seats === 1) {
                const price = getPlanPrice('claude', 'pro')
                const s = calcSavings(t.monthlySpend, price, t.seats)
                rec.recommendedAction = "Switch to 'pro' plan"
                rec.recommendedPlan = 'pro'
                rec.monthlySavings = s.monthlySavings
                rec.annualSavings = s.annualSavings
                rec.reason = 'Claude Max (5x usage) is designed for heavy power users. Pro is sufficient for most writing, research, and data workflows.'
                rec.priority = priorityForAmount(rec.monthlySavings)
            }
        }

        if (t.toolId === 'chatgpt') {
            if (planKey === 'team' && t.seats < 3) {
                const price = getPlanPrice('chatgpt', 'plus')
                const s = calcSavings(t.monthlySpend, price, t.seats)
                rec.recommendedAction = "Switch to 'plus' plan"
                rec.recommendedPlan = 'plus'
                rec.monthlySavings = s.monthlySavings
                rec.annualSavings = s.annualSavings
                rec.reason = 'ChatGPT Team minimum is 2 seats at $25/seat. For 1-2 users, Plus at $20/seat saves money with nearly identical features.'
                rec.priority = priorityForAmount(rec.monthlySavings)
            }
            if (planKey === 'enterprise' && t.seats < 10) {
                const price = getPlanPrice('chatgpt', 'team')
                const s = calcSavings(t.monthlySpend, price, t.seats)
                rec.recommendedAction = "Switch to 'team' plan"
                rec.recommendedPlan = 'team'
                rec.monthlySavings = s.monthlySavings
                rec.annualSavings = s.annualSavings
                rec.reason = 'Enterprise pricing only makes economic sense at scale. Team plan covers most needs under 10 seats.'
                rec.priority = priorityForAmount(rec.monthlySavings)
            }
        }
    }

    // RULE SET 2: Redundant tools
    // cursor + github_copilot redundancy for coding
    if (byTool.has('cursor') && byTool.has('github_copilot') && input.useCase === 'coding') {
        const copilot = byTool.get('github_copilot')!
        const rec = findRec('github_copilot')
        rec.recommendedAction = 'Drop tool: github_copilot'
        rec.recommendedPlan = undefined
        rec.monthlySavings = Math.max(0, copilot.monthlySpend)
        rec.annualSavings = rec.monthlySavings * 12
        rec.reason = "Cursor's built-in AI makes GitHub Copilot redundant for coding workflows. You're paying twice for overlapping capability."
        rec.priority = priorityForAmount(rec.monthlySavings)
    }

    // claude + chatgpt overlap
    if (byTool.has('claude') && byTool.has('chatgpt') && ['writing', 'research', 'mixed'].includes(input.useCase)) {
        const claude = byTool.get('claude')!
        const chatgpt = byTool.get('chatgpt')!
        // choose which to recommend dropping per spec: drop the cheaper one
        const dropToolId: ToolId = chatgpt.monthlySpend <= claude.monthlySpend ? 'chatgpt' : 'claude'
        const dropSpend = Math.min(chatgpt.monthlySpend, claude.monthlySpend)
        const rec = findRec(dropToolId)
        rec.recommendedAction = `Drop tool: ${dropToolId}`
        rec.recommendedPlan = undefined
        rec.monthlySavings = Math.max(0, dropSpend)
        rec.annualSavings = rec.monthlySavings * 12
        rec.reason = 'For writing and research workflows, Claude and ChatGPT overlap heavily. Pick one and drop the other.'
        rec.priority = priorityForAmount(rec.monthlySavings)
    }

    // anthropic_api + claude subscription
    if (byTool.has('anthropic_api') && byTool.has('claude')) {
        const claude = byTool.get('claude')!
        const claudePrice = getPlanPrice('claude', claude.plan) || 0
        const claudeCost = claudePrice * (claude.seats || 1)
        const rec = findRec('claude')
        rec.recommendedAction = 'Consider removing Claude subscription if you only need API access'
        rec.recommendedPlan = undefined
        rec.monthlySavings = Math.max(0, claudeCost)
        rec.annualSavings = rec.monthlySavings * 12
        rec.reason = "You're paying for both API access and a Pro subscription. If you're a developer using the API, you likely don't need the Pro UI subscription too."
        rec.priority = priorityForAmount(rec.monthlySavings)
    }

    // openai_api + chatgpt (plus/team)
    if (byTool.has('openai_api') && byTool.has('chatgpt')) {
        const chat = byTool.get('chatgpt')!
        const chatPrice = getPlanPrice('chatgpt', chat.plan) || 0
        const chatCost = chatPrice * (chat.seats || 1)
        const rec = findRec('chatgpt')
        rec.recommendedAction = 'Consider removing ChatGPT subscription if you only need API access'
        rec.recommendedPlan = undefined
        rec.monthlySavings = Math.max(0, chatCost)
        rec.annualSavings = rec.monthlySavings * 12
        rec.reason = "You're paying for both API access and a ChatGPT subscription. If you primarily use the API, you may not need the ChatGPT seat licenses."
        rec.priority = priorityForAmount(rec.monthlySavings)
    }

    // RULE SET 3: API vs subscription suggestions
    if (byTool.has('anthropic_api')) {
        const api = byTool.get('anthropic_api')!
        if (api.monthlySpend > 100 && input.teamSize <= 3) {
            const proPrice = getPlanPrice('claude', 'pro') || 0
            const s = calcSavings(api.monthlySpend, proPrice, input.teamSize)
            const rec = findRec('anthropic_api')
            rec.recommendedAction = `Evaluate Claude Pro/Team at ~$${proPrice}/seat`
            rec.recommendedPlan = 'pro'
            rec.monthlySavings = s.monthlySavings
            rec.annualSavings = s.annualSavings
            rec.reason = 'At this API spend level with a small team, Claude Pro may cover your usage needs at a predictable flat rate.'
            rec.priority = priorityForAmount(rec.monthlySavings)
        }
    }

    if (byTool.has('openai_api')) {
        const api = byTool.get('openai_api')!
        if (api.monthlySpend > 100 && input.teamSize <= 3) {
            const teamPrice = getPlanPrice('chatgpt', 'team') || 0
            const s = calcSavings(api.monthlySpend, teamPrice, input.teamSize)
            const rec = findRec('openai_api')
            rec.recommendedAction = `Evaluate ChatGPT Team at ~$${teamPrice}/seat`
            rec.recommendedPlan = 'team'
            rec.monthlySavings = s.monthlySavings
            rec.annualSavings = s.annualSavings
            rec.reason = 'At this API spend level with a small team, ChatGPT Team may be a predictable alternative to pay-as-you-go API spend.'
            rec.priority = priorityForAmount(rec.monthlySavings)
        }
    }

    // RULE SET 4: Already optimal handled by default

    // Final totals
    const totalMonthlySavings = recommendations.reduce((s, r) => s + Math.max(0, r.monthlySavings), 0)
    const totalAnnualSavings = totalMonthlySavings * 12

    return {
        input,
        recommendations,
        totalMonthlySavings,
        totalAnnualSavings
    }
}

export function getSavingsCategory(totalMonthlySavings: number): 'high' | 'medium' | 'low' | 'optimal' {
    if (totalMonthlySavings > 500) return 'high'
    if (totalMonthlySavings >= 100) return 'medium'
    if (totalMonthlySavings >= 1) return 'low'
    return 'optimal'
}

export function getTopRecommendation(recommendations: AuditRecommendation[]): AuditRecommendation | null {
    if (!recommendations || recommendations.length === 0) return null
    let top: AuditRecommendation | null = null
    for (const r of recommendations) {
        if (!top || (r.monthlySavings || 0) > (top.monthlySavings || 0)) top = r
    }
    return top
}
