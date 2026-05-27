"use client"
import React, { useEffect, useState } from 'react'
import type { LeadData } from '../lib/types'

interface LeadCaptureModalProps {
    isOpen: boolean
    onClose: () => void
    auditId: string
    totalMonthlySavings: number
    savingsTier: 'high' | 'medium' | 'low' | 'optimal'
}

export default function LeadCaptureModal({ isOpen, onClose, auditId, totalMonthlySavings, savingsTier }: LeadCaptureModalProps) {
    const [email, setEmail] = useState('')
    const [company, setCompany] = useState('')
    const [role, setRole] = useState('')
    const [website, setWebsite] = useState('') // honeypot
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [confirmClose, setConfirmClose] = useState(false)

    useEffect(() => {
        if (isOpen && error) setTimeout(() => setError(null), 0)
    }, [isOpen, error])

    useEffect(() => {
        if (!isOpen) {
            // reset on close after short delay so animate looks smooth
            setTimeout(() => {
                setEmail('')
                setCompany('')
                setRole('')
                setWebsite('')
                setLoading(false)
                setSuccess(false)
                setError(null)
            }, 300)
        }
    }, [isOpen])

    function validateEmail(e: string) {
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)
    }

    async function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault()
        setError(null)
        if (!validateEmail(email)) {
            setError('Please enter a valid email address')
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, company, role, auditId, savingsTier, totalMonthlySavings, website })
            })
            const json = await res.json()
            if (res.ok && json?.success !== false) {
                setSuccess(true)
            } else {
                setError(json?.error || json?.emailError || 'Something went wrong. Please try again.')
            }
        } catch (err) {
            console.error(err)
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    function handleRequestClose() {
        if (savingsTier === 'high' && !success) {
            setConfirmClose(true)
            return
        }
        onClose()
    }

    return (
        <>
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isOpen ? 'visible' : 'invisible'}`}>
                <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={handleRequestClose} />
                <div className="z-10 w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-200 scale-95" style={{ animation: isOpen ? 'modalIn 220ms ease-out forwards' : 'none' }}>
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-3xl">
                                    {savingsTier === 'high' ? '🎯' : savingsTier === 'optimal' ? '✅' : '📊'}
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold">
                                    {savingsTier === 'high' ? 'Get your full savings report' : savingsTier === 'optimal' ? 'Stay ahead of AI pricing changes' : 'Save your audit report'}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {savingsTier === 'high'
                                        ? 'We will email you the complete breakdown and notify you when Credex credits become available for your tools.'
                                        : savingsTier === 'optimal'
                                            ? 'Your stack is optimized today. We will notify you when new savings opportunities apply to your tools.'
                                            : 'Get the full breakdown in your inbox. We will also alert you when better deals become available for your stack.'}
                                </p>
                            </div>
                            <div>
                                <button aria-label="Close" onClick={handleRequestClose} className="text-gray-500 hover:text-gray-900">✕</button>
                            </div>
                        </div>

                        {totalMonthlySavings > 0 && !success && (
                            <div className="mt-4 rounded-md bg-green-50 border border-green-100 p-3 text-sm text-green-800">
                                💰 Your identified savings: <strong>{`$${totalMonthlySavings}/month`}</strong> — <strong>{`$${totalMonthlySavings * 12}/year`}</strong>
                            </div>
                        )}

                        <div className="mt-6">
                            {!success ? (
                                <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium">Email *</label>
                                        <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Company</label>
                                        <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Acme Inc." value={company} onChange={(e) => setCompany(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Your role</label>
                                        <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" placeholder="CTO, Engineering Manager, Founder..." value={role} onChange={(e) => setRole(e.target.value)} />
                                    </div>

                                    {/* honeypot */}
                                    <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                                    {error && <div className="text-sm text-red-600">{error}</div>}

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="text-sm text-gray-500">By submitting you agree to be contacted by Credex about relevant offers.</div>
                                        <div className="flex flex-col items-end">
                                            <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60">
                                                {loading ? 'Sending...' : savingsTier === 'high' ? 'Send My Report + Book Consultation →' : savingsTier === 'optimal' ? 'Keep Me Updated →' : 'Send My Report →'}
                                            </button>
                                            <div className="text-xs text-gray-400 mt-2">No spam, ever. Unsubscribe in one click.</div>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex flex-col items-center gap-4 py-6">
                                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="24" cy="24" r="22" stroke="#10B981" strokeWidth="2" strokeOpacity="0.2" />
                                            <path d="M14 25L20 31L34 17" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="text-xl font-semibold">Check your inbox! ✓</div>
                                    <div className="text-sm text-gray-600">Your audit report is on its way to {email}</div>

                                    {savingsTier === 'high' && (
                                        <div className="mt-4 w-full rounded-md border p-4 bg-white shadow">
                                            <div className="font-semibold">Want to act on these savings now?</div>
                                            <a className="inline-block mt-3 bg-indigo-600 text-white px-4 py-2 rounded" href="https://credex.rocks" target="_blank" rel="noreferrer">Book a Free 15-min Credex Call →</a>
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <button onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2">Close</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm close modal for high tier */}
            {confirmClose && (
                <div className="fixed inset-0 z-60 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/40" />
                    <div className="z-10 w-full max-w-md rounded bg-white p-6">
                        <h4 className="font-semibold">Are you sure? You will miss your savings report.</h4>
                        <p className="text-sm text-gray-600 mt-2">If you close now, we will not be able to email the full report with Credex opportunities.</p>
                        <div className="mt-4 flex justify-end gap-3">
                            <button className="px-3 py-1" onClick={() => setConfirmClose(false)}>Keep my report</button>
                            <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => { setConfirmClose(false); onClose() }}>Yes, close</button>
                        </div>
                    </div>
                </div>
            )}
            <style jsx>{`
        @keyframes modalIn { from { opacity: 0; transform: translateY(8px) scale(0.98)} to { opacity: 1; transform: translateY(0) scale(1)} }
      `}</style>
        </>
    )
}
