import type { ToolId } from './types'

type PriceEntry = {
    price: number
    description: string
    minSeats?: number
    isCustom?: boolean
}

export const PRICING: Record<ToolId, Record<string, PriceEntry>> = {
    cursor: {
        hobby: { price: 0, description: 'Cursor Hobby (free) per user / month' },
        pro: { price: 20, description: 'Cursor Pro per user / month' },
        business: { price: 40, description: 'Cursor Business per user / month' },
        enterprise: { price: 60, description: 'Cursor Enterprise (estimate)', isCustom: true }
    },
    github_copilot: {
        individual: { price: 10, description: 'GitHub Copilot Individual per user / month' },
        business: { price: 19, description: 'GitHub Copilot Business per user / month' },
        enterprise: { price: 39, description: 'GitHub Copilot Enterprise per user / month', isCustom: true }
    },
    claude: {
        free: { price: 0, description: 'Claude free tier' },
        pro: { price: 20, description: 'Claude Pro per user / month' },
        max: { price: 100, description: 'Claude Max per user / month' },
        team: { price: 25, description: 'Claude Team per user / month (min seats)', minSeats: 5 },
        enterprise: { price: 60, description: 'Claude Enterprise (estimate)', isCustom: true }
    },
    chatgpt: {
        plus: { price: 20, description: 'ChatGPT Plus per user / month' },
        team: { price: 25, description: 'ChatGPT Team per user / month (min seats)', minSeats: 2 },
        enterprise: { price: 60, description: 'ChatGPT Enterprise (estimate)', isCustom: true }
    },
    anthropic_api: {
        pay_as_you_go: { price: 0, description: 'Anthropic API pay-as-you-go (enter actual spend)' }
    },
    openai_api: {
        pay_as_you_go: { price: 0, description: 'OpenAI API pay-as-you-go (enter actual spend)' }
    },
    gemini: {
        free: { price: 0, description: 'Gemini free tier' },
        pro: { price: 19.99, description: 'Gemini Pro / Google One AI Premium per user / month' },
        ultra: { price: 249.99, description: 'Gemini Ultra flat monthly' },
        api: { price: 0, description: 'Gemini API pay-as-you-go (enter actual spend)' }
    },
    windsurf: {
        free: { price: 0, description: 'Windsurf free tier' },
        pro: { price: 15, description: 'Windsurf Pro per user / month' },
        team: { price: 35, description: 'Windsurf Team per user / month' }
    }
}

export const TOOL_NAMES: Record<ToolId, string> = {
    cursor: 'Cursor',
    github_copilot: 'GitHub Copilot',
    claude: 'Claude (Anthropic)',
    chatgpt: 'ChatGPT (OpenAI)',
    anthropic_api: 'Anthropic API',
    openai_api: 'OpenAI API',
    gemini: 'Gemini (Google)',
    windsurf: 'Windsurf'
}

export const PRICING_SOURCES: Record<ToolId, string> = {
    cursor: 'https://cursor.sh/pricing',
    github_copilot: 'https://github.com/features/copilot#pricing',
    claude: 'https://www.anthropic.com/pricing',
    chatgpt: 'https://openai.com/pricing',
    anthropic_api: 'https://www.anthropic.com/pricing',
    openai_api: 'https://platform.openai.com/pricing',
    gemini: 'https://blog.google/products/gemini/',
    windsurf: 'https://windsurf.ai/pricing'
}

