"use client"
import React, { useState } from 'react'

interface ShareButtonProps {
    auditId: string
    totalMonthlySavings: number
}

export default function ShareButton({ auditId, totalMonthlySavings }: ShareButtonProps) {
    const [copied, setCopied] = useState(false)
    const shareBase = (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== '') ? process.env.NEXT_PUBLIC_APP_URL : (typeof window !== 'undefined' ? window.location.origin : '')
    const shareUrl = `${shareBase}/results/${auditId}`

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (e) {
            console.error('copy failed', e)
        }
    }

    function tweetText() {
        const X = totalMonthlySavings
        if (X > 500) return `Just audited my team's AI spend and found $${X}/month in potential savings 🤯 Free tool — check yours: ${shareUrl}`
        if (X >= 100) return `Audited my AI tool spending — found $${X}/month I could be saving. This free tool takes 2 minutes: ${shareUrl}`
        if (X >= 1) return `Quick AI spend audit — turns out I'm pretty well optimized ($${X}/mo savings identified). Check yours free: ${shareUrl}`
        return `Audited my AI tool spend — turns out I'm spending optimally 💪 Free audit tool: ${shareUrl}`
    }

    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText())}`

    return (
        <div>
            <div className="text-sm mb-2">Share this audit</div>
            <div className="flex gap-2">
                <button onClick={handleCopy} className="px-3 py-1 border rounded-md hover:bg-gray-50" aria-label="Copy link">
                    {copied ? '✓ Copied!' : '📋 Copy Link'}
                </button>
                <a href={intent} target="_blank" rel="noreferrer" className="px-3 py-1 bg-black text-white rounded-md">Share on 𝕏</a>
            </div>
            <div className="text-xs text-gray-500 mt-1">Identifying details (email, company) are not included in the shared link.</div>
        </div>
    )
}
