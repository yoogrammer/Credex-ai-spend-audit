"use client"
import React, { useEffect, useMemo, useRef } from 'react'
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AuditInput, ToolId } from '../lib/types'
import { PRICING, TOOL_NAMES } from '../lib/pricing'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


type ToolForm = {
    toolId: ToolId
    enabled: boolean
    plan: string
    monthlySpend: number
    seats: number
}

const TOOL_LIST: ToolId[] = [
    'cursor',
    'github_copilot',
    'claude',
    'chatgpt',
    'anthropic_api',
    'openai_api',
    'gemini',
    'windsurf'
]

const TOOL_EMOJI: Record<ToolId, string> = {
    cursor: '🖱️',
    github_copilot: '🐙',
    claude: '🟣',
    chatgpt: '🤖',
    anthropic_api: '⚡',
    openai_api: '🟢',
    gemini: '💎',
    windsurf: '🌊'
}

const PLAN_OPTIONS: Record<ToolId, string[]> = {
    cursor: ['Hobby', 'Pro', 'Business', 'Enterprise'],
    github_copilot: ['Individual', 'Business', 'Enterprise'],
    claude: ['Free', 'Pro', 'Max', 'Team', 'Enterprise'],
    chatgpt: ['Plus', 'Team', 'Enterprise'],
    anthropic_api: ['Pay as you go'],
    openai_api: ['Pay as you go'],
    gemini: ['Free', 'Pro', 'Ultra', 'API'],
    windsurf: ['Free', 'Pro', 'Team']
}

const zTool = z.object({
    toolId: z.string(),
    enabled: z.boolean(),
    plan: z.string(),
    monthlySpend: z.number().min(0),
    seats: z.number().min(1)
})

const schema = z
    .object({
        teamSize: z.number().min(1).max(500),
        useCase: z.enum(['coding', 'writing', 'data', 'research', 'mixed']),
        tools: z.array(zTool)
    })
    .refine((v) => v.tools.some((t) => t.enabled), { message: 'At least one tool must be enabled', path: ['tools'] })

type FormSchema = z.infer<typeof schema>

type FormStore = {
    data: FormSchema | null
    set: (d: FormSchema) => void
    clear: () => void
}

const useFormStore = create<FormStore>()(
    persist(
        (set) => ({
            data: null,
            set: (d: FormSchema) => set({ data: d }),
            clear: () => set({ data: null })
        }),
        { name: 'ai-spend-audit-form' }
    )
)

function formatCurrency(n: number) {
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function normalizePlanKey(plan: string) {
    return plan.trim().toLowerCase().replace(/\s+/g, '_')
}

function expectedPrice(toolId: ToolId, plan: string, seats: number) {
    const key = normalizePlanKey(plan)
    const table = PRICING[toolId]
    if (!table) return 0
    const entry = table[key]
    if (!entry) return 0
    return entry.price * Math.max(1, seats)
}

export interface AuditFormProps {
    onSubmit: (data: AuditInput) => void
    isLoading: boolean
}

export default function AuditForm({ onSubmit, isLoading }: AuditFormProps) {
    const stored = useFormStore((s) => s.data)
    const didHydrateRef = useRef(false)

    const defaultTools: ToolForm[] = TOOL_LIST.map((toolId) => ({
        toolId,
        enabled: false,
        plan: PLAN_OPTIONS[toolId][0],
        monthlySpend: 0,
        seats: 1
    }))

    const { control, handleSubmit, setValue, register, formState, reset } = useForm<FormSchema>({
        resolver: zodResolver(schema),
        defaultValues: stored || { teamSize: 1, useCase: 'coding', tools: defaultTools }
    })

    const { fields } = useFieldArray({ control, name: 'tools' })

    const watched = useWatch({ control })

    useEffect(() => {
        if (watched) {
            useFormStore.getState().set(watched as FormSchema)
        }
    }, [watched])

    useEffect(() => {
        if (stored && !didHydrateRef.current) {
            didHydrateRef.current = true
            reset(stored)
        }
    }, [stored, reset])

    useEffect(() => {
        fields.forEach((field, idx) => {
            const t = watched?.tools?.[idx]
            if (!t) return
            const enabled = field ? Boolean((field as any).enabled) : false
            if (enabled && (!t.monthlySpend || t.monthlySpend === 0)) {
                const plan = t.plan || PLAN_OPTIONS[t.toolId as ToolId][0]
                const seats = t.seats || 1
                const expected = expectedPrice(t.toolId as ToolId, plan, seats)
                if (expected > 0) setValue(`tools.${idx}.monthlySpend` as const, expected)
            }
        })
    }, [fields, watched, setValue])

    const totalMonthly = useMemo(() => {
        return (watched?.tools || []).filter((t) => t.enabled).reduce((sum, tool) => sum + (tool.monthlySpend || 0), 0)
    }, [watched])

    const enabledCount = useMemo(() => (watched?.tools || []).filter((t) => t.enabled).length, [watched])

    function renderPlanOptions(toolId: ToolId) {
        return PLAN_OPTIONS[toolId].map((plan) => (
            <SelectItem key={plan} value={plan}>
                {plan}
            </SelectItem>
        ))
    }

    function toggleTool(toolIndex: number, enabled: boolean) {
        setValue(`tools.${toolIndex}.enabled` as const, enabled, { shouldDirty: true, shouldTouch: true })
        if (enabled) {
            const current = watched?.tools?.[toolIndex]
            if (current && (!current.monthlySpend || current.monthlySpend === 0)) {
                const plan = current.plan || PLAN_OPTIONS[current.toolId as ToolId][0]
                const seats = current.seats || 1
                const expected = expectedPrice(current.toolId as ToolId, plan, seats)
                if (expected > 0) setValue(`tools.${toolIndex}.monthlySpend` as const, expected)
            }
        }
    }

    function onFormSubmit(values: FormSchema) {
        const auditInput: AuditInput = {
            teamSize: values.teamSize,
            useCase: values.useCase,
            tools: values.tools
                .filter((tool) => tool.enabled)
                .map((tool) => ({
                    toolId: tool.toolId as ToolId,
                    plan: tool.plan,
                    monthlySpend: tool.monthlySpend,
                    seats: tool.seats
                }))
        }
        onSubmit(auditInput)
    }

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <Card className="p-6 md:p-8">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Your Team</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Team size</label>
                        <Controller
                            control={control}
                            name="teamSize"
                            render={({ field }) => (
                                <Input
                                    type="number"
                                    min={1}
                                    max={500}
                                    value={field.value}
                                    onChange={(event) => field.onChange(Number(event.target.value))}
                                />
                            )}
                        />
                        {formState.errors.teamSize && <div className="mt-1 text-xs text-red-600">{formState.errors.teamSize.message}</div>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Primary use case</label>
                        <Controller
                            control={control}
                            name="useCase"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select use case" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="coding">Coding</SelectItem>
                                        <SelectItem value="writing">Writing</SelectItem>
                                        <SelectItem value="data">Data Analysis</SelectItem>
                                        <SelectItem value="research">Research</SelectItem>
                                        <SelectItem value="mixed">Mixed</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {formState.errors.useCase && <div className="mt-1 text-xs text-red-600">{formState.errors.useCase.message}</div>}
                    </div>
                </div>
            </Card>

            <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-semibold text-gray-900">Your AI Tools</h2>
                <div className="text-sm font-semibold text-indigo-600">
                    Total: {formatCurrency(totalMonthly)}/mo across {enabledCount} tools
                </div>
            </div>

            <div className="space-y-3">
                {fields.map((field, idx) => {
                    const toolId = field.toolId as ToolId
                    const current = watched?.tools?.[idx]
                    const enabled = Boolean(current?.enabled)
                    const expected = current
                        ? expectedPrice(
                            current.toolId as ToolId,
                            current.plan || PLAN_OPTIONS[current.toolId as ToolId][0],
                            current.seats || 1
                        )
                        : 0
                    const userSpend = current?.monthlySpend ?? 0
                    const diffPct = expected > 0 ? Math.abs(userSpend - expected) / expected : 0

                    return (
                        <div
                            key={field.id}
                            className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors ${enabled ? 'border-l-4 border-l-indigo-500' : 'opacity-60'}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{TOOL_EMOJI[toolId]}</div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{TOOL_NAMES[toolId]}</div>
                                        <div className="text-xs text-gray-400">{field.toolId}</div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => toggleTool(idx, !enabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>

                            <div className={`mt-4 ${enabled ? 'block' : 'hidden'}`}>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                    <div>
                                        <label className="mb-1 block text-xs text-gray-500">Plan</label>
                                        <Controller
                                            control={control}
                                            name={`tools.${idx}.plan` as const}
                                            render={({ field: planField }) => (
                                                <Select value={planField.value} onValueChange={planField.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select plan" />
                                                    </SelectTrigger>
                                                    <SelectContent>{renderPlanOptions(toolId)}</SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs text-gray-500">Monthly spend $</label>
                                        <Controller
                                            control={control}
                                            name={`tools.${idx}.monthlySpend` as const}
                                            render={({ field: spendField }) => (
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step={0.01}
                                                    value={spendField.value}
                                                    onChange={(event) => spendField.onChange(Number(event.target.value))}
                                                />
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs text-gray-500">Seats</label>
                                        <Controller
                                            control={control}
                                            name={`tools.${idx}.seats` as const}
                                            render={({ field: seatsField }) => (
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={seatsField.value}
                                                    onChange={(event) => seatsField.onChange(Number(event.target.value))}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="mt-3 space-y-2">
                                    <div className="text-xs text-gray-400">
                                        Expected price: {formatCurrency(expected)} /mo based on {current?.plan} × {current?.seats}
                                    </div>

                                    {expected > 0 && diffPct > 0.2 && (
                                        <div className="inline-flex rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-600">
                                            ⚠️ This differs from the listed price of {formatCurrency(expected)} — double check your bill
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {formState.errors.tools && <div className="text-sm text-red-600">{(formState.errors.tools as any).message}</div>}

            <div className="space-y-3 pt-2">
                <Button type="submit" className="h-12 w-full rounded-xl text-base font-semibold" disabled={isLoading || Object.keys(formState.errors).length > 0}>
                    {isLoading ? 'Auditing your spend...' : 'Audit My AI Spend →'}
                </Button>
                <div className="text-center text-sm text-gray-400">Free. No login required. Results in seconds.</div>
            </div>
        </form>
    )
}
