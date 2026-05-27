"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import AuditForm from '../components/AuditForm'
import AuditResults from '../components/AuditResults'
import LeadCaptureModal from '../components/LeadCaptureModal'
import type { AuditInput } from '../lib/types'
import type { AuditResult } from '../lib/types'

export default function Page() {
    const [state, setState] = useState<'landing' | 'loading' | 'results'>('landing')
    const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const rotatingMessages = [
        'Analyzing your AI tool stack...',
        "Checking plan fit for your team size...",
        'Comparing alternatives...',
        'Calculating your savings...',
        'Almost done...'
    ]
    const [rotIdx, setRotIdx] = useState(0)
    const progressRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (state === 'loading') {
            const t = setInterval(() => setRotIdx((i) => (i + 1) % rotatingMessages.length), 1500)
            // progress bar fill
            if (progressRef.current) progressRef.current.style.width = '0%'
            let start = Date.now()
            const dur = 5000
            const pi = setInterval(() => {
                const p = Math.min(1, (Date.now() - start) / dur)
                if (progressRef.current) progressRef.current.style.width = `${Math.round(p * 100)}%`
                if (p >= 1) clearInterval(pi)
            }, 100)
            return () => { clearInterval(t); clearInterval(pi) }
        }
    }, [state, rotatingMessages.length])

    useEffect(() => {
        if (error) {
            const id = setTimeout(() => setError(null), 5000)
            return () => clearTimeout(id)
        }
    }, [error])

    async function handleSubmit(input: AuditInput) {
        setState('loading')
        setError(null)
        try {
            const res = await fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input }) })
            const json = await res.json()
            if (res.ok && json?.result) {
                const r: AuditResult = {
                    id: json.id,
                    input: json.result.input,
                    recommendations: json.result.recommendations,
                    totalMonthlySavings: json.result.totalMonthlySavings,
                    totalAnnualSavings: json.result.totalAnnualSavings,
                    summary: json.result.summary || undefined,
                    createdAt: json.result.createdAt || new Date().toISOString()
                }
                setAuditResult(r)
                setState('results')
                window.scrollTo({ top: 0, behavior: 'smooth' })
                // auto open modal after 3s if savings > 100
                setTimeout(() => {
                    if (r.totalMonthlySavings > 100) setIsModalOpen(true)
                }, 3000)
            } else {
                setState('landing')
                setError(json?.error || 'Failed to run audit')
            }
        } catch (e) {
            console.error(e)
            setState('landing')
            setError('Network error — please try again')
        }
    }

    function resetToLanding() {
        setAuditResult(null)
        setState('landing')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const savingsTier = useMemo(() => {
        const v = auditResult?.totalMonthlySavings || 0
        if (v > 500) return 'high'
        if (v >= 100) return 'medium'
        if (v >= 1) return 'low'
        return 'optimal'
    }, [auditResult])

    return (
        <main className="min-h-screen bg-white text-gray-900">
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                    <div className="text-xl font-bold text-indigo-600">⚡ SpendAudit</div>
                    <a href="https://credex.rocks" target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:text-gray-900">
                        by Credex
                    </a>
                </div>
            </header>

            <section className="bg-white px-4 py-12 text-center">
                <div className="mx-auto max-w-3xl">
                    <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                        Free • No login required • Results in 30 seconds
                    </div>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">Find out if you are overpaying for AI tools</h1>
                    <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500">
                        Enter your AI subscriptions. Get an instant audit showing exactly where to cut, switch, or downgrade — with real numbers.
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                        <div>✓ Covers 8 major AI tools</div>
                        <div>✓ Pricing verified weekly</div>
                        <div>✓ Used by 500+ startups</div>
                    </div>
                </div>
            </section>

            <section className="bg-indigo-600 py-3 text-center text-sm text-white">
                Startups using this tool find an average of $340/month in savings
            </section>

            <div className="mx-auto max-w-3xl px-4 py-10">
                {state === 'landing' && (
                    <div className="space-y-4">
                        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Something went wrong: {error}. Please try again.</div>}
                        <AuditForm onSubmit={handleSubmit} isLoading={false} />
                    </div>
                )}

                {state === 'loading' && (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                        <div className="mb-6">
                            <svg className="h-12 w-12 animate-spin text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                        </div>
                        <div className="text-lg font-medium text-gray-900">{rotatingMessages[rotIdx]}</div>
                        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div ref={progressRef} className="h-2 w-0 bg-indigo-600 transition-all" />
                        </div>
                    </div>
                )}

                {state === 'results' && auditResult && (
                    <div>
                        <button className="mb-4 text-sm font-medium text-indigo-600 hover:text-indigo-700" onClick={resetToLanding}>
                            ← Run another audit
                        </button>
                        <AuditResults result={auditResult} onCaptureLead={() => setIsModalOpen(true)} isSharedView={false} />
                        <LeadCaptureModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            auditId={auditResult.id}
                            totalMonthlySavings={auditResult.totalMonthlySavings}
                            savingsTier={savingsTier as any}
                        />
                    </div>
                )}
            </div>

            <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">© 2025 Credex · credex.rocks · All pricing data verified from official sources</footer>
        </main>
    )
}
