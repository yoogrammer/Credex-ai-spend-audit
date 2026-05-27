import { NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase'

async function hashText(text: string) {
    const enc = new TextEncoder()
    const data = await crypto.subtle.digest('SHA-256', enc.encode(text))
    return Array.from(new Uint8Array(data)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { auditId, auditResult } = body
        if (!auditId || !auditResult) return NextResponse.json({ error: 'Missing auditId or auditResult' }, { status: 400 })

        const model = 'claude-sonnet-4-20250514'
        const key = process.env.ANTHROPIC_API_KEY

        const teamSize = auditResult.input.teamSize
        const useCase = auditResult.input.useCase
        const toolNames = auditResult.input.tools.map((t: any) => t.toolId).join(', ')
        const totalMonthlySpend = auditResult.input.tools.reduce((s: number, t: any) => s + (t.monthlySpend || 0), 0)
        const totalMonthlySavings = auditResult.totalMonthlySavings
        const totalAnnualSavings = auditResult.totalAnnualSavings
        const top = auditResult.recommendations.reduce((a: any, b: any) => (b.monthlySavings > (a.monthlySavings || 0) ? b : a), {})

        const userPrompt = `Write a 100-word personalized audit summary for this team:\n- Team size: ${teamSize}\n- Primary use case: ${useCase}\n- Tools analyzed: ${toolNames}\n- Total monthly spend: $${totalMonthlySpend}\n- Total potential savings: $${totalMonthlySavings}/month ($${totalAnnualSavings}/year)\n- Top recommendation: ${top.recommendedAction} for ${top.toolId} — saves $${top.monthlySavings}/month\n\nWrite exactly 100 words. Start with their situation, identify the biggest opportunity, end with a specific action. No bullet points. No headers. Plain paragraph only.`

        let summaryText = ''

        if (key) {
            try {
                const res = await fetch('https://api.anthropic.com/v1/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': key },
                    body: JSON.stringify({ model, prompt: userPrompt, max_tokens: 200 })
                })
                if (!res.ok) throw new Error('LLM request failed')
                const j = await res.json()
                summaryText = j?.completion || j?.text || (typeof j === 'object' ? JSON.stringify(j) : String(j))
            } catch (e) {
                console.error('LLM error', e)
            }
        }

        // Fallback if no summaryText produced
        if (!summaryText || summaryText.trim().length === 0) {
            const toolCount = auditResult.input.tools.length
            if (totalMonthlySavings > 0) {
                summaryText = `Your team of ${teamSize} is spending $${totalMonthlySpend}/month across ${toolCount} AI tools for ${useCase} work. Our audit identified $${totalMonthlySavings}/month in potential savings — $${totalAnnualSavings} annually. The biggest opportunity is ${top.recommendedAction} for ${top.toolId}. Acting on this single change captures the majority of your identified savings.`
            } else {
                summaryText = `Your team of ${teamSize} is spending $${totalMonthlySpend}/month across ${toolCount} AI tools for ${useCase} work. Your current AI tool setup is well-optimized for your team size and use case. You're on the right plans at competitive prices. We'll notify you when new optimization opportunities emerge.`
            }
        }

        // save to supabase
        const supabase = createServerClient()
        const { error } = await supabase.from('audits').update({ summary: summaryText }).eq('id', auditId)
        if (error) console.error('failed to save summary', error)

        return NextResponse.json({ ok: true, summary: summaryText })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ ok: true, fallback: true })
    }
}
