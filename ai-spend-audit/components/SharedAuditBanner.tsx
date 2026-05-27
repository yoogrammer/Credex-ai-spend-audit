"use client"
import React, { useState } from 'react'
import Link from 'next/link'

export default function SharedAuditBanner() {
    const [visible, setVisible] = useState(true)

    if (!visible) return null

    return (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t bg-white/95 backdrop-blur shadow-lg">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
                <div className="text-sm">This is a shared audit. Create yours free →</div>
                <div className="flex items-center gap-2">
                    <Link href="/" className="px-3 py-2 rounded bg-indigo-600 text-white text-sm">Go to home</Link>
                    <button className="px-3 py-2 rounded border text-sm" onClick={() => setVisible(false)} aria-label="Dismiss shared banner">✕</button>
                </div>
            </div>
        </div>
    )
}
