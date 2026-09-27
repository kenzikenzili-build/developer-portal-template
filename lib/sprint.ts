import { mockSprintCatalog } from '@/config/mockData'

export const ACTIVE_SPRINT_ID = 'sprint-01'

export const PROJECT_FILTER_KEYS = [
  'core-platform',
  'design-system',
  'api-gateway',
  'portfolio-site',
] as const

export const SPRINT_STATUSES = ['Done', 'In Progress', 'Backlog'] as const
export const SPRINT_STATES = ['Completed', 'Active', 'Planning'] as const

export type SprintStatus = (typeof SPRINT_STATUSES)[number]
export type SprintState = (typeof SPRINT_STATES)[number]
export type SprintTimeline = 'Past' | 'Active' | 'Future'

export type SprintItem = {
  id: string
  project: string
  title: string
  status: SprintStatus
}

export type SprintBoard = {
  sprintId: string
  sprintName: string
  state: SprintState
  lastUpdated: string
  goal: string
  items: SprintItem[]
}

export type SprintCatalog = {
  sprints: SprintBoard[]
}

const STATUS_SET = new Set<string>(SPRINT_STATUSES)
const STATE_SET = new Set<string>(SPRINT_STATES)

export function isSprintStatus(value: unknown): value is SprintStatus {
  return typeof value === 'string' && STATUS_SET.has(value)
}

export function isSprintState(value: unknown): value is SprintState {
  return typeof value === 'string' && STATE_SET.has(value)
}

export function sprintTimeline(state: SprintState): SprintTimeline {
  if (state === 'Completed') return 'Past'
  if (state === 'Planning') return 'Future'
  return 'Active'
}

function asNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid sprints.json: "${field}" must be a non-empty string`)
  }
  return value.trim()
}

function parseItem(value: unknown, sprintIndex: number, index: number): SprintItem {
  if (!value || typeof value !== 'object') {
    throw new Error(`Invalid sprints.json: sprints[${sprintIndex}].items[${index}] must be an object`)
  }
  const row = value as Record<string, unknown>
  const status = row.status
  if (!isSprintStatus(status)) {
    throw new Error(
      `Invalid sprints.json: sprints[${sprintIndex}].items[${index}].status must be one of ${SPRINT_STATUSES.join(', ')}`,
    )
  }
  return {
    id: asNonEmptyString(row.id, `sprints[${sprintIndex}].items[${index}].id`),
    project: asNonEmptyString(row.project, `sprints[${sprintIndex}].items[${index}].project`),
    title: asNonEmptyString(row.title, `sprints[${sprintIndex}].items[${index}].title`),
    status,
  }
}

export function parseSprintBoard(value: unknown, sprintIndex = 0): SprintBoard {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid sprints.json: sprints[${sprintIndex}] must be an object`)
  }
  const raw = value as Record<string, unknown>
  if (!Array.isArray(raw.items) || raw.items.length === 0) {
    throw new Error(`Invalid sprints.json: sprints[${sprintIndex}].items must be a non-empty array`)
  }
  const state = raw.state
  if (!isSprintState(state)) {
    throw new Error(
      `Invalid sprints.json: sprints[${sprintIndex}].state must be one of ${SPRINT_STATES.join(', ')}`,
    )
  }
  return {
    sprintId: asNonEmptyString(raw.sprintId, `sprints[${sprintIndex}].sprintId`),
    sprintName: asNonEmptyString(raw.sprintName, `sprints[${sprintIndex}].sprintName`),
    state,
    lastUpdated: asNonEmptyString(raw.lastUpdated, `sprints[${sprintIndex}].lastUpdated`),
    goal: asNonEmptyString(raw.goal, `sprints[${sprintIndex}].goal`),
    items: raw.items.map((item, index) => parseItem(item, sprintIndex, index)),
  }
}

export function parseSprintCatalog(value: unknown): SprintCatalog {
  if (Array.isArray(value)) {
    if (value.length === 0) throw new Error('Invalid sprints.json: array must not be empty')
    return { sprints: value.map((entry, index) => parseSprintBoard(entry, index)) }
  }
  if (value && typeof value === 'object') {
    const raw = value as Record<string, unknown>
    if (Array.isArray(raw.sprints)) {
      if (raw.sprints.length === 0) throw new Error('Invalid sprints.json: "sprints" must not be empty')
      return { sprints: raw.sprints.map((entry, index) => parseSprintBoard(entry, index)) }
    }
    if ('items' in raw) {
      return { sprints: [parseSprintBoard({ ...raw, state: raw.state ?? 'Active' }, 0)] }
    }
  }
  throw new Error('Invalid sprints.json: root must be an array of sprints')
}

/** Bundled mock catalog — the default data channel for the template. */
export const bundledSprintCatalog: SprintCatalog = parseSprintCatalog(mockSprintCatalog)

export function pickDefaultSprintId(sprints: SprintBoard[]): string {
  return (
    sprints.find((sprint) => sprint.sprintId === ACTIVE_SPRINT_ID)?.sprintId ??
    sprints.find((sprint) => sprint.state === 'Active')?.sprintId ??
    sprints[0]?.sprintId ??
    ''
  )
}

export function findSprintBoard(
  catalog: SprintCatalog,
  sprintId: string = ACTIVE_SPRINT_ID,
): SprintBoard | undefined {
  return (
    catalog.sprints.find((sprint) => sprint.sprintId === sprintId) ??
    catalog.sprints.find((sprint) => sprint.state === 'Active') ??
    catalog.sprints[0]
  )
}

/** Active sprint task list (the live 64-item board). */
export function activeSprintItems(catalog: SprintCatalog): SprintItem[] {
  return findSprintBoard(catalog, ACTIVE_SPRINT_ID)?.items ?? []
}

export function sprintProjects(board: SprintBoard): string[] {
  const present = new Set(board.items.map((item) => item.project))
  const preferred = PROJECT_FILTER_KEYS.filter((key) => present.has(key))
  const preferredSet = new Set<string>(preferred)
  const extras = [...present].filter((key) => !preferredSet.has(key))
  return [...preferred, ...extras]
}

export type ProjectProgressStatus = 'Completed' | 'In Progress' | 'Planning'

export type ProjectProgress = {
  key: string
  name: string
  status: ProjectProgressStatus
  progress: number
  totalTasks: number
  doneTasks: number
  inProgressTasks: number
  gradient: string
}

export function countActiveProjects(projects: readonly ProjectProgress[]): number {
  return projects.filter((project) => project.status !== 'Completed').length
}

const PROJECT_DISPLAY_NAMES: Record<string, string> = {
  'core-platform': 'Core Platform',
  'design-system': 'Design System',
  'api-gateway': 'API Gateway',
  'portfolio-site': 'Portfolio Site',
}

const PROJECT_STATUS_GRADIENTS: Record<ProjectProgressStatus, string> = {
  Completed: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
  'In Progress': 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
  Planning: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)',
}

export function projectDisplayName(project: string): string {
  if (PROJECT_DISPLAY_NAMES[project]) return PROJECT_DISPLAY_NAMES[project]
  return project
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function flattenSprintItems(catalog: SprintCatalog): SprintItem[] {
  return catalog.sprints.flatMap((sprint) => sprint.items)
}

export function deriveProjectStatus(
  progress: number,
  doneTasks: number,
  inProgressTasks: number,
): ProjectProgressStatus {
  if (progress === 100) return 'Completed'
  if (doneTasks > 0 || inProgressTasks > 0) return 'In Progress'
  return 'Planning'
}

/** Group sprint tasks by `project` and compute live progress metrics. */
export function aggregateProjectProgress(items: readonly SprintItem[]): ProjectProgress[] {
  const order: string[] = []
  const grouped = new Map<string, SprintItem[]>()

  for (const item of items) {
    if (!item?.project) continue
    const list = grouped.get(item.project)
    if (list) {
      list.push(item)
    } else {
      grouped.set(item.project, [item])
      order.push(item.project)
    }
  }

  return order.map((key) => {
    const tasks = grouped.get(key) ?? []
    const totalTasks = tasks.length
    const doneTasks = tasks.filter((task) => task.status === 'Done').length
    const inProgressTasks = tasks.filter((task) => task.status === 'In Progress').length
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
    const status = deriveProjectStatus(progress, doneTasks, inProgressTasks)
    return {
      key,
      name: projectDisplayName(key),
      status,
      progress,
      totalTasks,
      doneTasks,
      inProgressTasks,
      gradient: PROJECT_STATUS_GRADIENTS[status],
    }
  })
}

export function nextSprintStatus(status: SprintStatus): SprintStatus {
  if (status === 'Backlog') return 'In Progress'
  if (status === 'In Progress') return 'Done'
  return 'Backlog'
}

export function setSprintItemStatus(
  catalog: SprintCatalog,
  itemId: string,
  status: SprintStatus,
): SprintCatalog {
  return {
    sprints: catalog.sprints.map((sprint) => ({
      ...sprint,
      items: sprint.items.map((item) => (item.id === itemId ? { ...item, status } : item)),
    })),
  }
}

export function sprintProgress(board: SprintBoard) {
  const total = board.items.length
  const done = board.items.filter((item) => item.status === 'Done').length
  const inProgress = board.items.filter((item) => item.status === 'In Progress').length
  const backlog = board.items.filter((item) => item.status === 'Backlog').length
  const percent =
    board.state === 'Completed' ? 100 : total === 0 ? 0 : Math.round((done / total) * 100)
  return { total, done, inProgress, backlog, percent }
}

export function visibleSprintStatuses(board: SprintBoard): SprintStatus[] {
  if (board.state === 'Completed') return ['Done']
  return [...SPRINT_STATUSES]
}

export const sprintStatusStyles: Record<SprintStatus, string> = {
  Done: 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300',
  'In Progress':
    'border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/50 dark:text-sky-300',
  Backlog:
    'border-slate-200/80 bg-slate-100 text-slate-600 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-300',
}

export const sprintStateStyles: Record<SprintState, string> = {
  Completed:
    'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300',
  Active:
    'border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/50 dark:text-sky-300',
  Planning:
    'border-slate-200/80 bg-slate-100 text-slate-600 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-300',
}
