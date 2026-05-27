"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { AuditResult, AuditRecommendation } from '../lib/types'
import { getSavingsCategory, getTopRecommendation } from '../lib/auditEngine'
import { TOOL_NAMES } from '../lib/pricing'

interface AuditResultsProps {
    result: AuditResult
    onCaptureLead: () => void
    isSharedView?: boolean
}

const TOOL_EMOJI: Record<string, string> = {
    cursor: '🖱️',
    github_copilot: '🐙',
    claude: '🟣',
    chatgpt: '🤖',
    anthropic_api: '⚡',
    openai_api: '🟢',
    gemini: '💎',
    windsurf: '🌊'
}

function useCountUp(target: number, duration = 1500) {
    const [value, setValue] = useState(0)
    useEffect(() => {
        let raf = 0
        const start = performance.now()
        function step(now: number) {
            const t = Math.min(1, (now - start) / duration)
            const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // easeInOutQuad-like
            setValue(Math.round(eased * target))
            if (t < 1) raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
    }, [target, duration])
    return value
}

function formatCurrency(n: number) {
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export default function AuditResults({ result, onCaptureLead, isSharedView = false }: AuditResultsProps) {
    const totalMonthly = result.totalMonthlySavings
    const totalAnnual = result.totalAnnualSavings

    const countUp = useCountUp(totalMonthly)

    const recommendations = useMemo(() => {
        return [...result.recommendations].sort((a, b) => b.monthlySavings - a.monthlySavings)
    }, [result.recommendations])

    const positiveCount = recommendations.filter((r) => r.monthlySavings > 0).length
    const toolsAnalyzed = recommendations.length

    const top = getTopRecommendation(recommendations)
    const topName = top ? TOOL_NAMES[top.toolId] || top.toolId : null

    const savingsCategory = getSavingsCategory(totalMonthly)

    // templated fallback summary
    const fallbackSummary = (() => {
        const toolCount = toolsAnalyzed
        if (totalMonthly > 0) {
            return `Based on your audit, your team is spending ${formatCurrency(result.recommendations.reduce((s, r) => s + r.currentSpend, 0))}/month across ${toolCount} AI tools. Our analysis found ${formatCurrency(totalMonthly)} in potential monthly savings, primarily from ${topName || 'one of your tools'}.`
        }
        return `Based on your audit, your team is spending ${formatCurrency(result.recommendations.reduce((s, r) => s + r.currentSpend, 0))}/month across ${toolCount} AI tools. Your current setup is well-optimized for your team size and use case.`
    })()

    // copy link
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            // small feedback could be added
        } catch (e) {
            console.error('copy failed', e)
        }
    }

    return (
        <article className="space-y-6">
            {isSharedView && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                    This is a shared audit report. Create yours free at <a className="text-indigo-600" href={process.env.NEXT_PUBLIC_APP_URL || '/'}>{process.env.NEXT_PUBLIC_APP_URL || 'app'}</a>
                </div>
            )}

            {/* HERO */}
            <section className={`rounded-lg p-8 text-center text-white ${totalMonthly > 0 ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}>
                {totalMonthly > 0 ? (
                    <>
                        <div className="text-sm uppercase tracking-wide">You could save</div>
                        <div className="text-5xl md:text-7xl font-extrabold my-4">{formatCurrency(countUp)} <span className="text-lg">/ month</span></div>
                        <div className="text-lg">That&apos;s <strong className="underline">{formatCurrency(totalAnnual)}</strong> saved every year</div>
                        <div className="mt-4 flex justify-center gap-4">
                            <div className="bg-white/10 px-4 py-2 rounded-full">{toolsAnalyzed} tools analyzed</div>
                            <div className="bg-white/10 px-4 py-2 rounded-full">{positiveCount} recommendations found</div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-xl md:text-3xl font-semibold">Your AI spend looks optimized ✓</div>
                        <div className="mt-2">No significant savings found — you&apos;re spending well</div>
                    </>
                )}
            </section>

            {/* SUMMARY */}
            <section>
                <div className="border-l-4 border-purple-300 bg-white p-6 rounded shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">✨ Your personalized audit summary</h3>
                            <p className="text-sm text-gray-600 mt-2">
                                {result.summary ? result.summary : fallbackSummary}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* BREAKDOWN */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Recommendations breakdown</h3>
                <div className="space-y-3">
                    {recommendations.map((rec, idx) => {
                        const leftBorder = rec.priority === 'high' ? 'border-red-500' : rec.priority === 'medium' ? 'border-yellow-400' : 'border-gray-200'
                        const savingsPositive = rec.monthlySavings > 0
                        const badge = savingsPositive ? `${formatCurrency(rec.monthlySavings)}/mo savings` : 'Optimal ✓'
                        return (
                            <div
                                key={rec.toolId + idx}
                                className={`flex items-center justify-between p-4 rounded shadow-sm bg-white ${leftBorder} border-l-4 opacity-0 animate-fade-in`}
                                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'forwards' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">{TOOL_EMOJI[rec.toolId] || '🔧'}</div>
                                    <div>
                                        <div className="font-semibold">{TOOL_NAMES[rec.toolId] || rec.toolId}</div>
                                        <div className="text-sm text-gray-500">{rec.recommendedPlan ? `Plan: ${rec.recommendedPlan}` : ''}</div>
                                    </div>
                                </div>

                                <div className="flex-1 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm text-gray-600">Current spend: <strong>{formatCurrency(rec.currentSpend)}</strong></div>
                                        <div className="text-gray-300">→</div>
                                        <div className={`${savingsPositive ? 'text-green-600' : 'text-gray-600'} font-medium`}>{savingsPositive ? rec.recommendedAction : 'No change needed'}</div>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-2">{rec.reason}</div>
                                </div>

                                <div className="text-right">
                                    <div className={`inline-block px-3 py-1 rounded-full text-sm ${savingsPositive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{badge}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* CREDEx CTA */}
            {totalMonthly > 500 && (
                <section>
                    <div className="rounded-lg bg-slate-900 text-white p-6 shadow-lg">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <div className="font-bold text-xl">Credex</div>
                                <div className="text-sm text-slate-300 mt-1">Discounted AI credits & procurement</div>
                                <p className="mt-3 text-slate-200 max-w-xl">You have {formatCurrency(totalMonthly)} in identified savings. Credex can help you capture even more through discounted AI credits — the same tools, sourced from companies that overforecast.</p>
                            </div>
                            <div className="flex flex-col items-start md:items-end gap-2">
                                <a className="inline-block bg-white text-slate-900 px-4 py-2 rounded font-medium" href="https://credex.rocks" target="_blank" rel="noreferrer">Book a Free Credex Consultation →</a>
                                <div className="text-xs text-slate-400">No commitment. 15 minutes.</div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* LEAD CAPTURE */}
            <section>
                <div className={`p-6 rounded shadow-sm ${totalMonthly > 500 ? 'bg-white' : 'bg-indigo-600 text-white'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-semibold text-lg">
                                {totalMonthly > 100
                                    ? 'Get your full audit report by email →'
                                    : totalMonthly >= 1
                                        ? 'Get notified when better deals hit your stack →'
                                        : 'Stay optimized — get alerts when new savings apply →'}
                            </div>
                            <div className={`text-sm mt-1 ${totalMonthly > 500 ? 'text-gray-600' : 'text-indigo-100'}`}>No spam. Unsubscribe anytime.</div>
                        </div>
                        {!isSharedView && (
                            <button onClick={onCaptureLead} className={`${totalMonthly > 500 ? 'bg-indigo-600 text-white px-4 py-2 rounded' : 'bg-white text-indigo-700 px-4 py-2 rounded'}`}>
                                {totalMonthly > 500 ? 'Get full report' : 'Notify me'}
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* SHARE BAR */}
            {!isSharedView && (
                <section className="flex items-center justify-between p-3 rounded bg-white shadow-sm">
                    <div className="text-sm">Share this audit</div>
                    <div className="flex items-center gap-2">
                        <button onClick={copyLink} className="px-3 py-1 bg-gray-100 rounded">Copy link</button>
                        <a
                            className="px-3 py-1 bg-blue-500 text-white rounded"
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just audited my team's AI spend and found ${formatCurrency(totalMonthly)}/month in savings. Check yours free:`)}&url=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Share on X
                        </a>
                    </div>
                </section>
            )}

            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(6px)} to { opacity: 1; transform: translateY(0) } }
                .animate-fade-in { animation: fadeIn 350ms ease both; }
                @media print { .no-print { display: none } }
            `}</style>
        </article>
    )
}

