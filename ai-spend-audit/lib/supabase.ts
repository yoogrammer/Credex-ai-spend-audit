import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

function normalizeSupabaseUrl(url: string | undefined) {
    if (!url) return ''
    return url.replace(/\/rest\/v1\/?$/, '')
}

function getSupabaseKey(preferred: string | undefined, fallback: string | undefined) {
    return preferred || fallback || ''
}

// Browser client (for client components)
export function createClient() {
    return createBrowserClient(
        normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
        getSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, process.env.SUPABASE_SERVICE_ROLE_KEY)
    )
}

// Server client (for API routes)
export function createServerClient() {
    return createSupabaseClient(
        normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
        getSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    )
}

// Minimal Database type for typed supabase clients
export type Json = any

export type Database = {
    public: {
        Tables: {
            audits: {
                Row: {
                    id: string
                    created_at: string
                    tools: Json
                    team_size: number
                    use_case: string
                    recommendations: Json
                    total_monthly_savings: string
                    total_annual_savings: string
                    summary: string | null
                    is_public: boolean
                }
            }
            leads: {
                Row: {
                    id: string
                    created_at: string
                    audit_id: string | null
                    email: string
                    company: string | null
                    role: string | null
                    team_size: number | null
                    savings_tier: string | null
                    contacted: boolean
                }
            }
            rate_limits: {
                Row: {
                    id: string
                    ip_hash: string
                    action: string
                    created_at: string
                }
            }
        }
    }
}
