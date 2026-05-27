// Strongly typed domain models for the AI Spend Audit

export type ToolId =
    | 'cursor'
    | 'github_copilot'
    | 'claude'
    | 'chatgpt'
    | 'anthropic_api'
    | 'openai_api'
    | 'gemini'
    | 'windsurf'

export interface ToolEntry {
    toolId: ToolId
    plan: string
    monthlySpend: number
    seats: number
}

export interface AuditInput {
    tools: ToolEntry[]
    teamSize: number
    useCase: 'coding' | 'writing' | 'data' | 'research' | 'mixed'
}

export interface AuditRecommendation {
    toolId: ToolId
    currentSpend: number
    recommendedAction: string
    recommendedPlan?: string
    monthlySavings: number
    annualSavings: number
    reason: string
    priority: 'high' | 'medium' | 'low'
}

export interface AuditResult {
    id: string
    input: AuditInput
    recommendations: AuditRecommendation[]
    totalMonthlySavings: number
    totalAnnualSavings: number
    summary?: string
    createdAt: string
}

export interface LeadData {
    email: string
    company?: string
    role?: string
    auditId: string
}
