import { siteConfig } from '@/config/site'
import {
  normalizeToolCategories,
  type ToolCategory,
  type WorkspaceTool,
} from '@/config/tools'

export const TOOLS_LAYOUT_STORAGE_KEY = `${siteConfig.storagePrefix}.tools-layout-v2`

export type ToolsBoard = Record<string, WorkspaceTool[]>
export type ToolsLayoutV2 = Record<string, string[]>

function isWorkspaceTool(value: unknown): value is WorkspaceTool {
  if (!value || typeof value !== 'object') return false
  const tool = value as Partial<WorkspaceTool>
  return typeof tool.id === 'string' && tool.id.length > 0 && typeof tool.name === 'string'
}

/** Drop nullish / malformed entries and duplicate ids within a category list. */
export function sanitizeToolList(tools: readonly (WorkspaceTool | null | undefined)[]): WorkspaceTool[] {
  const seen = new Set<string>()
  const next: WorkspaceTool[] = []
  for (const tool of tools) {
    if (!isWorkspaceTool(tool) || seen.has(tool.id)) continue
    seen.add(tool.id)
    next.push(tool)
  }
  return next
}

/** Ensure every category is an array of valid tools with unique ids board-wide. */
export function sanitizeBoard(board: ToolsBoard): ToolsBoard {
  const next: ToolsBoard = {}
  const seen = new Set<string>()
  for (const [category, tools] of Object.entries(board ?? {})) {
    if (!category) continue
    const list = Array.isArray(tools) ? tools : []
    next[category] = []
    for (const tool of list) {
      if (!isWorkspaceTool(tool) || seen.has(tool.id)) continue
      seen.add(tool.id)
      next[category].push(tool)
    }
  }
  return next
}

export function containerId(category: string): string {
  return `container:${category}`
}

export function isContainerId(id: string): boolean {
  return typeof id === 'string' && id.startsWith('container:')
}

export function parseContainerId(id: string): string | null {
  if (!isContainerId(id)) return null
  const category = id.slice('container:'.length)
  return category.length > 0 ? category : null
}

function isValidLayoutV2(value: unknown): value is ToolsLayoutV2 {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  for (const entry of Object.values(value as Record<string, unknown>)) {
    if (!Array.isArray(entry)) return false
    if (!entry.every((id) => typeof id === 'string')) return false
  }
  return true
}

export function readToolsLayoutV2(): ToolsLayoutV2 | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(TOOLS_LAYOUT_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    const layout: ToolsLayoutV2 = {}
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof key !== 'string' || !key || !Array.isArray(value)) continue
      const ids = value.filter((id): id is string => typeof id === 'string' && id.length > 0)
      if (ids.length > 0) layout[key] = ids
    }
    return Object.keys(layout).length > 0 ? layout : null
  } catch {
    return null
  }
}

export function writeToolsLayoutV2(layout: ToolsLayoutV2) {
  if (typeof window === 'undefined') return
  try {
    if (!isValidLayoutV2(layout)) return
    const cleaned: ToolsLayoutV2 = {}
    for (const [category, ids] of Object.entries(layout)) {
      if (typeof category !== 'string' || !category || !Array.isArray(ids)) continue
      const unique = [...new Set(ids.filter((id) => typeof id === 'string' && id.length > 0))]
      cleaned[category] = unique
    }
    window.localStorage.setItem(TOOLS_LAYOUT_STORAGE_KEY, JSON.stringify(cleaned))
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function clearToolsLayoutV2() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(TOOLS_LAYOUT_STORAGE_KEY)
  } catch {
    // Ignore
  }
}

export function serializeBoard(board: ToolsBoard): ToolsLayoutV2 {
  const safe = sanitizeBoard(board)
  return Object.fromEntries(
    Object.entries(safe).map(([category, tools]) => [
      category,
      tools.map((tool) => tool.id).filter((id) => typeof id === 'string' && id.length > 0),
    ]),
  )
}

export function buildDefaultBoard(
  catalog: WorkspaceTool[],
  categories: readonly ToolCategory[],
): ToolsBoard {
  const board: ToolsBoard = {}
  for (const category of categories) board[category] = []

  const placed = new Set<string>()
  for (const tool of catalog) {
    if (!isWorkspaceTool(tool) || placed.has(tool.id)) continue
    const membership = normalizeToolCategories(tool.category)
    const primary = categories.find((category) => membership.includes(category))
    if (!primary) continue
    board[primary].push(tool)
    placed.add(tool.id)
  }
  return board
}

export function hydrateBoard(
  catalog: WorkspaceTool[],
  categories: readonly ToolCategory[],
  stored: ToolsLayoutV2 | null,
): ToolsBoard {
  const byId = new Map(
    catalog.filter(isWorkspaceTool).map((tool) => [tool.id, tool] as const),
  )
  const board: ToolsBoard = {}
  const placed = new Set<string>()

  for (const category of categories) {
    board[category] = []
    const storedIds = Array.isArray(stored?.[category]) ? stored![category] : []
    for (const id of storedIds) {
      if (typeof id !== 'string' || !id || placed.has(id)) continue
      const tool = byId.get(id)
      if (!tool) continue
      board[category].push(tool)
      placed.add(id)
    }
  }

  const defaults = buildDefaultBoard(catalog, categories)
  for (const category of categories) {
    for (const tool of defaults[category] ?? []) {
      if (placed.has(tool.id)) continue
      board[category].push(tool)
      placed.add(tool.id)
    }
  }

  return sanitizeBoard(board)
}

export function findBoardCategory(board: ToolsBoard, itemId: string): string | undefined {
  if (typeof itemId !== 'string' || !itemId || !board) return undefined
  const container = parseContainerId(itemId)
  if (container && Array.isArray(board[container])) return container
  return Object.keys(board).find((category) => {
    const tools = board[category]
    return Array.isArray(tools) && tools.some((tool) => isWorkspaceTool(tool) && tool.id === itemId)
  })
}

export function findToolOnBoard(board: ToolsBoard, itemId: string): WorkspaceTool | undefined {
  if (typeof itemId !== 'string' || !itemId || !board) return undefined
  for (const tools of Object.values(board)) {
    if (!Array.isArray(tools)) continue
    const match = tools.find((tool) => isWorkspaceTool(tool) && tool.id === itemId)
    if (match) return match
  }
  return undefined
}

function arrayMoveItems<T>(items: T[], from: number, to: number): T[] {
  if (
    !Array.isArray(items) ||
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return items
  }
  const next = items.slice()
  const [removed] = next.splice(from, 1)
  if (removed === undefined) return items
  // Clamp insert index after removal (length shrunk by 1).
  const insertAt = Math.min(Math.max(0, to), next.length)
  next.splice(insertAt, 0, removed)
  return next
}

/**
 * Move a tool onto another tool or onto a category container droppable.
 * Same-category container drops are a no-op so empty grid gaps do not snap the card to the end.
 */
export function moveTool(board: ToolsBoard, activeId: string, overId: string): ToolsBoard {
  try {
    if (!board || typeof activeId !== 'string' || typeof overId !== 'string') return board
    if (!activeId || !overId || activeId === overId) return board

    const safeBoard = sanitizeBoard(board)
    const fromCategory = findBoardCategory(safeBoard, activeId)
    const toCategory = findBoardCategory(safeBoard, overId)
    if (!fromCategory || !toCategory) return board

    const fromList = sanitizeToolList(safeBoard[fromCategory] ?? [])
    const toList =
      fromCategory === toCategory
        ? fromList
        : sanitizeToolList(safeBoard[toCategory] ?? [])

    const fromIndex = fromList.findIndex((tool) => tool.id === activeId)
    if (fromIndex < 0) return board

    if (fromCategory === toCategory) {
      if (isContainerId(overId)) return board
      const toIndex = toList.findIndex((tool) => tool.id === overId)
      if (toIndex < 0 || fromIndex === toIndex) return board
      const moved = arrayMoveItems(fromList, fromIndex, toIndex)
      if (moved.some((tool) => !isWorkspaceTool(tool))) return board
      return sanitizeBoard({ ...safeBoard, [fromCategory]: moved })
    }

    const nextFrom = fromList.slice()
    const [moved] = nextFrom.splice(fromIndex, 1)
    if (!isWorkspaceTool(moved)) return board

    const nextTo = toList.filter((tool) => tool.id !== moved.id)
    if (isContainerId(overId)) {
      nextTo.push(moved)
    } else {
      const overIndex = nextTo.findIndex((tool) => tool.id === overId)
      const insertAt = overIndex >= 0 ? overIndex : nextTo.length
      nextTo.splice(insertAt, 0, moved)
    }

    if (nextTo.some((tool) => !isWorkspaceTool(tool))) return board

    return sanitizeBoard({
      ...safeBoard,
      [fromCategory]: nextFrom,
      [toCategory]: nextTo,
    })
  } catch {
    return board
  }
}
