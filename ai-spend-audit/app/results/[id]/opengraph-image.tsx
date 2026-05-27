import { ImageResponse } from 'next/og'
import { createServerClient } from '@/lib/supabase'

export const runtime = 'edge'

type Props = { params: { id: string } }

export default async function Image({ params }: Props) {
    const supabase = createServerClient()
    const { data } = await supabase.from('audits').select('*').eq('id', params.id).single()
    const savings = Math.round(Number(data?.total_monthly_savings || 0))
    const toolsCount = (data?.tools || []).length || 0
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://credex.rocks'

    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: '#0f172a',
                    color: 'white',
                    padding: '64px',
                    fontFamily: 'Inter, Arial, sans-serif'
                }}
            >
                <div>
                    <div style={{ fontSize: 28, color: '#94a3b8', marginBottom: 20 }}>AI Spend Audit</div>
                    <div style={{ fontSize: 86, fontWeight: 800, color: '#22c55e', lineHeight: 1.05 }}>
                        ${savings}/mo saved
                    </div>
                    <div style={{ fontSize: 32, color: '#cbd5e1', marginTop: 18 }}>{toolsCount} tools analyzed · Free audit at {appUrl}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                    <div style={{ fontSize: 22, color: '#94a3b8' }}>Credex</div>
                    <div style={{ fontSize: 20, color: '#94a3b8' }}>credex.rocks</div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630
        }
    )
}
