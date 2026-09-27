/**
 * Tool launcher domain model.
 *
 * The catalog itself lives in `config/toolCatalog.ts` (mock data) so this file
 * stays a pure contract you can map your own data source onto.
 */
export const TOOL_CATEGORIES = [
  'Finance',
  'Working',
  'Workspace',
  'Dev',
  'AI Systems',
  'Communications',
] as const

export type ToolCategory = (typeof TOOL_CATEGORIES)[number]

export const TOOL_FILTERS = ['All', ...TOOL_CATEGORIES] as const

export type ToolFilter = (typeof TOOL_FILTERS)[number]

export type ToolBrand =
  | 'stripe'
  | 'chase'
  | 'robinhood'
  | 'revolut'
  | 'brex'
  | 'workday'
  | 'salesforce'
  | 'servicenow'
  | 'jira'
  | 'figma'
  | 'linear'
  | 'notion'
  | 'box'
  | 'cloudflare'
  | 'gcp'
  | 'aws'
  | 'github'
  | 'datadog'
  | 'postman'
  | 'docker'
  | 'vercel'
  | 'supabase'
  | 'claude'
  | 'openai'
  | 'perplexity'
  | 'slack'
  | 'zoom'
  | 'gmail'

export type WorkspaceTool = {
  id: string
  name: string
  /** Punchy one-line recognition tag. */
  tagline: string
  url: string
  /** One or more categories for multi-tag filtering. */
  category: ToolCategory | ToolCategory[]
  brand: ToolBrand
  /** Tailwind hover border/glow accent. */
  accentClass: string
}

export type LauncherItem = {
  name: string
  desc: string
  tag: string
  icon: string
}

export type LauncherCategory = {
  category: ToolCategory
  items: LauncherItem[]
}

export function normalizeToolCategories(
  category: ToolCategory | ToolCategory[],
): ToolCategory[] {
  return Array.isArray(category) ? category : [category]
}

export function toolBelongsToCategory(tool: WorkspaceTool, category: ToolCategory): boolean {
  return normalizeToolCategories(tool.category).includes(category)
}
