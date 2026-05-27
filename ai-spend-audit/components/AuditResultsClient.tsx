"use client"
import React, { useState } from 'react'
import AuditResults from './AuditResults'
import LeadCaptureModal from './LeadCaptureModal'
import type { AuditResult } from '../lib/types'

interface Props {
    initialResult: AuditResult
    isSharedView?: boolean
}

export default function AuditResultsClient({ initialResult, isSharedView }: Props) {
    const [modalOpen, setModalOpen] = useState(false)

    const openLeadModal = () => setModalOpen(true)
    const closeLeadModal = () => setModalOpen(false)

    return (
        <>
            <AuditResults result={initialResult} onCaptureLead={openLeadModal} isSharedView={isSharedView} />
            <LeadCaptureModal
                isOpen={modalOpen}
                onClose={closeLeadModal}
                auditId={initialResult.id}
                totalMonthlySavings={initialResult.totalMonthlySavings}
                savingsTier={initialResult.totalMonthlySavings > 500 ? 'high' : initialResult.totalMonthlySavings >= 100 ? 'medium' : initialResult.totalMonthlySavings >= 1 ? 'low' : 'optimal'}
            />
        </>
    )
}
