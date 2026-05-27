import React from 'react'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'
import AuditResultsClient from '@/components/AuditResultsClient'
import SharedAuditBanner from '@/components/SharedAuditBanner'
import type { AuditResult } from '@/lib/types'

type Props = { params: { id: string } }

function stripSensitive(result: any) {
    const { id, created_at, tools, team_size, use_case, recommendations, total_monthly_savings, total_annual_savings, summary, is_public } = result
    return { id, created_at, tools, team_size, use_case, recommendations, total_monthly_savings, total_annual_savings, summary, is_public }
}

export async function generateMetadata({ params }: Props) {
    const supabase = createServerClient()
    const { data } = await supabase.from('audits').select('*').eq('id', params.id).single()
    if (!data) {
        return {
            title: 'AI Spend Audit',
            description: 'Audit your AI spend for free.'
        }
    }

    const publicResult = stripSensitive(data)
    const toolsCount = publicResult.tools?.length || 0
    const savings = Math.round(Number(publicResult.total_monthly_savings || 0))

    return {
        title: `AI Spend Audit — $${savings}/month in potential savings found`,
        description: `This team analyzed their AI tool spending across ${toolsCount} tools and found $${savings}/month in savings. Audit yours free.`,
        openGraph: {
            title: `AI Spend Audit — $${savings}/month in potential savings found`,
            description: `This team analyzed their AI tool spending across ${toolsCount} tools and found $${savings}/month in savings. Audit yours free.`,
            images: [`/results/${params.id}/opengraph-image`]
        },
        twitter: { card: 'summary_large_image' }
    }
}

export default async function ResultPage({ params }: Props) {
    const supabase = createServerClient()
    const { data, error } = await supabase.from('audits').select('*').eq('id', params.id).single()

    if (error || !data) {
        return (
            <main className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-bold">This audit report does not exist or has been removed.</h1>
                    <Link href="/" className="mt-4 inline-block text-indigo-600 underline">Back to home</Link>
                </div>
            </main>
        )
    }

    const publicData = stripSensitive(data)
    const publicResult: AuditResult = {
        id: publicData.id,
        input: {
            tools: publicData.tools,
            teamSize: publicData.team_size,
            useCase: publicData.use_case as any
        },
        recommendations: publicData.recommendations,
        totalMonthlySavings: Number(publicData.total_monthly_savings || 0),
        totalAnnualSavings: Number(publicData.total_annual_savings || 0),
        summary: publicData.summary || undefined,
        createdAt: publicData.created_at
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-6xl px-4 py-6">
                <AuditResultsClient initialResult={publicResult} isSharedView={true} />
            </div>
            <SharedAuditBanner />
        </main>
    )
}
