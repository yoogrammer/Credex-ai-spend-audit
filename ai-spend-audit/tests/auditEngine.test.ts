import { getSavingsCategory, getTopRecommendation, runAuditEngine } from '../lib/auditEngine'
import type { AuditInput } from '../lib/types'

describe('auditEngine', () => {
    const baseInput: AuditInput = {
        teamSize: 2,
        useCase: 'coding',
        tools: [
            { toolId: 'cursor', plan: 'Business', monthlySpend: 80, seats: 2 },
            { toolId: 'github_copilot', plan: 'Business', monthlySpend: 38, seats: 2 }
        ]
    }

    it('flags Cursor Business for small teams', () => {
        const result = runAuditEngine(baseInput)
        const cursor = result.recommendations.find((r) => r.toolId === 'cursor')
        expect(cursor?.recommendedPlan).toBe('pro')
        expect(cursor?.monthlySavings).toBeGreaterThan(0)
    })

    it('drops GitHub Copilot when Cursor is also present for coding', () => {
        const result = runAuditEngine(baseInput)
        const copilot = result.recommendations.find((r) => r.toolId === 'github_copilot')
        expect(copilot?.recommendedAction).toContain('Drop tool')
        expect(copilot?.monthlySavings).toBe(38)
    })

    it('marks no-change recommendations when no rules fire', () => {
        const result = runAuditEngine({
            teamSize: 8,
            useCase: 'mixed',
            tools: [{ toolId: 'windsurf', plan: 'Pro', monthlySpend: 30, seats: 2 }]
        })
        const windsurf = result.recommendations[0]
        expect(windsurf.recommendedAction).toBe('No change needed')
        expect(windsurf.monthlySavings).toBe(0)
    })

    it('calculates savings category thresholds', () => {
        expect(getSavingsCategory(0)).toBe('optimal')
        expect(getSavingsCategory(50)).toBe('low')
        expect(getSavingsCategory(150)).toBe('medium')
        expect(getSavingsCategory(600)).toBe('high')
    })

    it('returns the highest savings recommendation', () => {
        const result = runAuditEngine({
            teamSize: 2,
            useCase: 'writing',
            tools: [
                { toolId: 'claude', plan: 'Max', monthlySpend: 100, seats: 1 },
                { toolId: 'chatgpt', plan: 'Team', monthlySpend: 25, seats: 1 }
            ]
        })
        const top = getTopRecommendation(result.recommendations)
        expect(top).not.toBeNull()
        expect(top?.monthlySavings).toBeGreaterThanOrEqual(0)
    })
})
