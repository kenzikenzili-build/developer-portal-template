import type { LauncherCategory, ToolBrand, ToolFilter, WorkspaceTool } from '@/config/tools'

/**
 * Generic demo tool catalog.
 *
 * These are well-known public products so the launcher looks realistic without
 * leaking anyone's private stack. Replace this file with your own catalog and
 * every launcher feature (filters, drag & drop, lock, reset) keeps working.
 */
export const LAUNCHER_CATEGORIES: LauncherCategory[] = [
  {
    category: 'Finance',
    items: [
      { name: 'Stripe Dashboard', desc: 'Payments & payouts infrastructure', tag: 'Finance', icon: 'Stripe' },
      { name: 'Chase Commercial', desc: 'Global treasury & corporate banking', tag: 'Finance', icon: 'Chase' },
      { name: 'Robinhood Gold', desc: 'Equities, options & cash sweep', tag: 'Finance', icon: 'Robinhood' },
      { name: 'Revolut Business', desc: 'Multi-currency FX & corporate cards', tag: 'Finance', icon: 'Revolut' },
      { name: 'Brex Treasury', desc: 'Spend management & venture debt', tag: 'Finance', icon: 'Brex' },
    ],
  },
  {
    category: 'Working',
    items: [
      { name: 'Workday HCM', desc: 'Enterprise HR & payroll', tag: 'Working', icon: 'Workday' },
      { name: 'Salesforce CRM', desc: 'Pipeline & revenue cloud', tag: 'Working', icon: 'Salesforce' },
      { name: 'ServiceNow ITSM', desc: 'Incident management & orchestration', tag: 'Working', icon: 'ServiceNow' },
      { name: 'Jira', desc: 'Sprint tracking & backlog health', tag: 'Working', icon: 'Jira' },
    ],
  },
  {
    category: 'Workspace',
    items: [
      { name: 'Figma Workspace', desc: 'Design system & prototyping', tag: 'Workspace', icon: 'Figma' },
      { name: 'Linear Roadmap', desc: 'Issue tracking & product roadmap', tag: 'Workspace', icon: 'Linear' },
      { name: 'Notion HQ', desc: 'Knowledge base & company docs', tag: 'Workspace', icon: 'Notion' },
      { name: 'Box Cloud Storage', desc: 'Enterprise file cloud & sharing', tag: 'Workspace', icon: 'Box' },
    ],
  },
  {
    category: 'Dev',
    items: [
      { name: 'Cloudflare', desc: 'Edge deployment & Zero Trust', tag: 'Dev', icon: 'Cloudflare' },
      { name: 'Google Cloud', desc: 'Console · Compute', tag: 'Dev', icon: 'GCP' },
      { name: 'AWS Console', desc: 'Cloud infrastructure & services', tag: 'Dev', icon: 'AWS' },
      { name: 'GitHub', desc: 'Repositories, reviews & Actions', tag: 'Dev', icon: 'GitHub' },
      { name: 'Datadog APM', desc: 'Infrastructure monitoring & tracing', tag: 'Dev', icon: 'Datadog' },
      { name: 'Postman', desc: 'API collections & workspace testing', tag: 'Dev', icon: 'Postman' },
      { name: 'Docker Hub', desc: 'Container registry & CI triggers', tag: 'Dev', icon: 'Docker' },
      { name: 'Vercel Platform', desc: 'Edge deployment & frontend cloud', tag: 'Dev', icon: 'Vercel' },
      { name: 'Supabase', desc: 'Postgres, auth & storage', tag: 'Dev', icon: 'Supabase' },
    ],
  },
  {
    category: 'AI Systems',
    items: [
      { name: 'Anthropic Claude', desc: 'Reasoning & code analysis', tag: 'AI Systems', icon: 'Claude' },
      { name: 'OpenAI Platform', desc: 'API usage, models & finetuning', tag: 'AI Systems', icon: 'OpenAI' },
      { name: 'Perplexity Pro', desc: 'Deep research & citation engine', tag: 'AI Systems', icon: 'Perplexity' },
    ],
  },
  {
    category: 'Communications',
    items: [
      { name: 'Slack', desc: 'Async channels & huddles', tag: 'Communications', icon: 'Slack' },
      { name: 'Zoom Rooms', desc: 'Video conferencing', tag: 'Communications', icon: 'Zoom' },
      { name: 'Google Workspace Mail', desc: 'Email & calendars', tag: 'Communications', icon: 'Gmail' },
    ],
  },
]

type BrandMeta = { url: string; brand: ToolBrand; accentClass: string }

const BRAND_META: Record<string, BrandMeta> = {
  stripe: {
    url: 'https://dashboard.stripe.com',
    brand: 'stripe',
    accentClass: 'hover:border-indigo-400/50 hover:shadow-[0_0_24px_rgba(99,91,255,0.25)]',
  },
  chase: {
    url: 'https://business.chase.com',
    brand: 'chase',
    accentClass: 'hover:border-sky-400/50 hover:shadow-[0_0_24px_rgba(17,122,202,0.25)]',
  },
  robinhood: {
    url: 'https://robinhood.com',
    brand: 'robinhood',
    accentClass: 'hover:border-emerald-400/50 hover:shadow-[0_0_24px_rgba(0,200,5,0.25)]',
  },
  revolut: {
    url: 'https://business.revolut.com',
    brand: 'revolut',
    accentClass: 'hover:border-slate-400/50 hover:shadow-[0_0_24px_rgba(148,163,184,0.22)]',
  },
  brex: {
    url: 'https://dashboard.brex.com',
    brand: 'brex',
    accentClass: 'hover:border-orange-400/50 hover:shadow-[0_0_24px_rgba(243,107,33,0.25)]',
  },
  workday: {
    url: 'https://www.workday.com',
    brand: 'workday',
    accentClass: 'hover:border-blue-400/50 hover:shadow-[0_0_24px_rgba(8,117,225,0.25)]',
  },
  salesforce: {
    url: 'https://login.salesforce.com',
    brand: 'salesforce',
    accentClass: 'hover:border-sky-400/50 hover:shadow-[0_0_24px_rgba(0,161,224,0.25)]',
  },
  servicenow: {
    url: 'https://www.servicenow.com',
    brand: 'servicenow',
    accentClass: 'hover:border-emerald-400/40 hover:shadow-[0_0_24px_rgba(129,181,161,0.25)]',
  },
  jira: {
    url: 'https://www.atlassian.com/software/jira',
    brand: 'jira',
    accentClass: 'hover:border-blue-400/50 hover:shadow-[0_0_24px_rgba(0,82,204,0.28)]',
  },
  figma: {
    url: 'https://www.figma.com',
    brand: 'figma',
    accentClass: 'hover:border-fuchsia-400/50 hover:shadow-[0_0_24px_rgba(162,89,255,0.25)]',
  },
  linear: {
    url: 'https://linear.app',
    brand: 'linear',
    accentClass: 'hover:border-violet-400/50 hover:shadow-[0_0_24px_rgba(139,92,246,0.25)]',
  },
  notion: {
    url: 'https://www.notion.so',
    brand: 'notion',
    accentClass: 'hover:border-slate-400/50 hover:shadow-[0_0_24px_rgba(148,163,184,0.2)]',
  },
  box: {
    url: 'https://www.box.com',
    brand: 'box',
    accentClass: 'hover:border-blue-400/50 hover:shadow-[0_0_24px_rgba(0,97,213,0.25)]',
  },
  cloudflare: {
    url: 'https://dash.cloudflare.com',
    brand: 'cloudflare',
    accentClass: 'hover:border-orange-400/60 hover:shadow-[0_0_24px_rgba(249,115,22,0.25)]',
  },
  gcp: {
    url: 'https://console.cloud.google.com',
    brand: 'gcp',
    accentClass: 'hover:border-blue-400/50 hover:shadow-[0_0_24px_rgba(66,133,244,0.25)]',
  },
  aws: {
    url: 'https://console.aws.amazon.com',
    brand: 'aws',
    accentClass: 'hover:border-orange-300/50 hover:shadow-[0_0_24px_rgba(251,146,60,0.22)]',
  },
  github: {
    url: 'https://github.com',
    brand: 'github',
    accentClass: 'hover:border-violet-400/50 hover:shadow-[0_0_24px_rgba(167,139,250,0.22)]',
  },
  datadog: {
    url: 'https://www.datadoghq.com',
    brand: 'datadog',
    accentClass: 'hover:border-violet-400/50 hover:shadow-[0_0_24px_rgba(99,44,166,0.25)]',
  },
  postman: {
    url: 'https://www.postman.com',
    brand: 'postman',
    accentClass: 'hover:border-orange-400/50 hover:shadow-[0_0_24px_rgba(255,108,55,0.25)]',
  },
  docker: {
    url: 'https://hub.docker.com',
    brand: 'docker',
    accentClass: 'hover:border-sky-400/50 hover:shadow-[0_0_24px_rgba(36,150,237,0.25)]',
  },
  vercel: {
    url: 'https://vercel.com',
    brand: 'vercel',
    accentClass: 'hover:border-slate-400/50 hover:shadow-[0_0_24px_rgba(148,163,184,0.22)]',
  },
  supabase: {
    url: 'https://supabase.com',
    brand: 'supabase',
    accentClass: 'hover:border-emerald-400/50 hover:shadow-[0_0_24px_rgba(62,207,142,0.25)]',
  },
  claude: {
    url: 'https://claude.ai',
    brand: 'claude',
    accentClass: 'hover:border-amber-400/50 hover:shadow-[0_0_24px_rgba(212,162,127,0.28)]',
  },
  openai: {
    url: 'https://platform.openai.com',
    brand: 'openai',
    accentClass: 'hover:border-slate-400/50 hover:shadow-[0_0_24px_rgba(148,163,184,0.22)]',
  },
  perplexity: {
    url: 'https://www.perplexity.ai',
    brand: 'perplexity',
    accentClass: 'hover:border-teal-400/50 hover:shadow-[0_0_24px_rgba(32,128,141,0.25)]',
  },
  slack: {
    url: 'https://app.slack.com',
    brand: 'slack',
    accentClass: 'hover:border-fuchsia-400/50 hover:shadow-[0_0_24px_rgba(232,121,249,0.22)]',
  },
  zoom: {
    url: 'https://zoom.us',
    brand: 'zoom',
    accentClass: 'hover:border-sky-400/50 hover:shadow-[0_0_24px_rgba(45,140,255,0.25)]',
  },
  gmail: {
    url: 'https://mail.google.com',
    brand: 'gmail',
    accentClass: 'hover:border-red-400/50 hover:shadow-[0_0_24px_rgba(248,113,113,0.22)]',
  },
}

export const TOOL_CATEGORY_NAMES = LAUNCHER_CATEGORIES.map((group) => group.category)

export const TOOL_FILTER_VALUES: ToolFilter[] = ['All', ...TOOL_CATEGORY_NAMES]

export const toolsCatalog: WorkspaceTool[] = LAUNCHER_CATEGORIES.flatMap((group) =>
  group.items.map((item) => {
    const key = item.icon.toLowerCase()
    const meta = BRAND_META[key]
    return {
      id: `tool-${key}`,
      name: item.name,
      tagline: item.desc,
      url: meta?.url ?? '#',
      category: group.category,
      brand: meta?.brand ?? 'github',
      accentClass:
        meta?.accentClass ??
        'hover:border-slate-400/50 hover:shadow-[0_0_24px_rgba(148,163,184,0.2)]',
    }
  }),
)

