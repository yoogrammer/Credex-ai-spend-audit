import { NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase'

function validateEmail(email: string) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}

async function hashText(text: string) {
    const enc = new TextEncoder()
    const data = await crypto.subtle.digest('SHA-256', enc.encode(text))
    return Array.from(new Uint8Array(data)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, company, role, auditId, savingsTier, website, totalMonthlySavings: bodyTotalMonthlySavings } = body
        // honeypot
        if (website) return NextResponse.json({ success: true })
        if (!email || !validateEmail(email)) return NextResponse.json({ success: false, error: 'invalid email' }, { status: 400 })

        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
        const ipHash = await hashText(ip)

        const supabase = createServerClient()
        const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
        const { data: recent, error: rErr } = await supabase.from('rate_limits').select('id').eq('ip_hash', ipHash).eq('action', 'lead').gte('created_at', since)
        if (rErr) console.error('rate check error', rErr)
        if (recent && recent.length >= 3) {
            return NextResponse.json({ success: false, error: 'Too many submissions' }, { status: 429 })
        }

        // check duplicate
        const { data: dup } = await supabase.from('leads').select('id').eq('audit_id', auditId).eq('email', email).limit(1).single()
        if (dup) return NextResponse.json({ success: true })

        // insert rate limit entry and lead
        await supabase.from('rate_limits').insert([{ ip_hash: ipHash, action: 'lead' }])

        const { error } = await supabase.from('leads').insert([{ audit_id: auditId, email, company: company || null, role: role || null, team_size: body.teamSize || null, savings_tier: savingsTier || null }])
        if (error) {
            console.error('failed to save lead', error)
        }

        // fetch audit to build email content
        const { data: audit } = await supabase.from('audits').select('*').eq('id', auditId).single()
        const totalMonthly = audit?.total_monthly_savings ?? bodyTotalMonthlySavings ?? 0
        const recs = Array.isArray(audit?.recommendations)
            ? audit.recommendations.slice(0, 3).map((r: any) => `- ${r.recommendedAction} (${r.toolId})`).join('<br />')
            : ''

        // send confirmation email via Resend (API)
        let emailSent = false
        let emailError: string | null = null
        try {
            const resendKey = process.env.RESEND_API_KEY
            if (resendKey) {
                const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
                const html = `
                    <div style="font-family:system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111">
                        <h2>Thanks for using AI Spend Audit</h2>
                        <p><strong style="font-size:20px">${typeof totalMonthly === 'number' ? `$${totalMonthly}` : totalMonthly}/mo</strong> estimated savings</p>
                        ${recs ? `<div>${recs}</div>` : '<p>We prepared your audit report and saved your contact details.</p>'}
                        ${savingsTier === 'high' ? `<p><strong>Want to capture even more savings? Credex offers discounted AI credits — <a href="https://credex.rocks">book a free 15-min call</a>.</strong></p>` : ''}
                        ${savingsTier === 'optimal' ? `<p>Your stack is optimized! We'll reach out when new savings opportunities match your tools.</p>` : ''}
                        <p style="font-size:12px;color:#666">No spam. Unsubscribe anytime.</p>
                    </div>`

                const resendResponse = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
                    body: JSON.stringify({
                        from: fromEmail,
                        to: [email],
                        subject: 'Your AI Spend Audit Report',
                        html
                    })
                })
                if (!resendResponse.ok) {
                    const details = await resendResponse.text()
                    throw new Error(`Resend failed (${resendResponse.status}): ${details}`)
                }
                emailSent = true
            }
        } catch (e) {
            emailError = e instanceof Error ? e.message : 'failed sending email'
            console.error('failed sending email', e)
        }

        return NextResponse.json({
            success: true,
            leadSaved: !error,
            emailSent,
            error: error ? 'lead save failed' : undefined,
            emailError: emailError || undefined
        })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
