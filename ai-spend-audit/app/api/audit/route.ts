import { NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase'
import { runAuditEngine } from '../../../lib/auditEngine'

async function hashText(text: string) {
    try {
        const enc = new TextEncoder()
        const data = await crypto.subtle.digest('SHA-256', enc.encode(text))
        return Array.from(new Uint8Array(data)).map((b) => b.toString(16).padStart(2, '0')).join('')
    } catch (e) {
        // fallback
        return text
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const input = body.input
        if (!input) return NextResponse.json({ error: 'Missing input' }, { status: 400 })
        const auditId = crypto.randomUUID()

        // rate limit by IP
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
        const ipHash = await hashText(ip)

        const supabase = createServerClient()
        const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
        const { data: recent, error: rErr } = await supabase.from('rate_limits').select('id').eq('ip_hash', ipHash).eq('action', 'audit').gte('created_at', since)
        if (rErr) console.error('rate check error', rErr)
        if (recent && recent.length >= 10) {
            return NextResponse.json({ error: 'Too many audits. Try again later.' }, { status: 429 })
        }

        // insert rate limit entry
        await supabase.from('rate_limits').insert([{ ip_hash: ipHash, action: 'audit' }])

        // run audit engine
        const audit = runAuditEngine(input)

        // save to audits table
        const insert = {
            id: auditId,
            tools: input.tools,
            team_size: input.teamSize,
            use_case: input.useCase,
            recommendations: audit.recommendations,
            total_monthly_savings: audit.totalMonthlySavings,
            total_annual_savings: audit.totalAnnualSavings,
            summary: null,
            is_public: true
        }

        const { data, error } = await supabase.from('audits').insert([insert]).select('*').single()
        const savedRow = data || null
        const persisted = !error && !!savedRow
        if (error) {
            console.error('insert audit error', error)
        }

        // fire-and-forget: call summary endpoint to generate summary
        if (persisted) {
            try {
                fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/summary`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ auditId: savedRow.id, auditResult: { ...audit, id: savedRow.id } })
                }).catch((e) => console.error('summary call failed', e))
            } catch (e) {
                console.error('summary trigger failed', e)
            }
        }

        const result = {
            id: savedRow?.id || auditId,
            input,
            recommendations: audit.recommendations,
            totalMonthlySavings: audit.totalMonthlySavings,
            totalAnnualSavings: audit.totalAnnualSavings,
            createdAt: savedRow?.created_at || new Date().toISOString()
        }

        return NextResponse.json({ id: result.id, result, persisted })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
