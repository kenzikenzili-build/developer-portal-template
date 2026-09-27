import { siteConfig } from '@/config/site'
import type { ToolCategory, WorkspaceTool } from '@/config/tools'

/** Base key for persisted per-category tool order. */
export const TOOLS_ORDER_STORAGE_KEY = `${siteConfig.storagePrefix}.tools-order`

export function toolsOrderStorageKey(category: ToolCategory | string): string {
  return `${TOOLS_ORDER_STORAGE_KEY}_${category}`
}

/** Remove every saved per-tool order key so Reset Order can snap to factory order. */
export function clearSavedToolsOrder() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(TOOLS_ORDER_STORAGE_KEY)
    const toRemove: string[] = []
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (key && key.startsWith(TOOLS_ORDER_STORAGE_KEY)) toRemove.push(key)
    }
    for (const key of toRemove) window.localStorage.removeItem(key)
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function readToolsOrder(category: ToolCategory | string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const keys = [toolsOrderStorageKey(category)]
    for (const key of keys) {
      const raw = window.localStorage.getItem(key)
      if (!raw) continue
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) continue
      return parsed.filter((id): id is string => typeof id === 'string')
    }
    return []
  } catch {
    return []
  }
}

export function writeToolsOrder(category: ToolCategory | string, ids: string[]) {
  if (typeof window === 'undefined') return
  try {
    if (!Array.isArray(ids)) return
    const cleaned = [
      ...new Set(ids.filter((id): id is string => typeof id === 'string' && id.length > 0)),
    ]
    window.localStorage.setItem(toolsOrderStorageKey(category), JSON.stringify(cleaned))
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function applyStoredOrder(tools: WorkspaceTool[], storedIds: string[]): WorkspaceTool[] {
  const byId = new Map(tools.map((tool) => [tool.id, tool]))
  const ordered: WorkspaceTool[] = []
  const seen = new Set<string>()

  for (const id of storedIds) {
    const tool = byId.get(id)
    if (tool && !seen.has(id)) {
      ordered.push(tool)
      seen.add(id)
    }
  }

  for (const tool of tools) {
    if (!seen.has(tool.id)) {
      ordered.push(tool)
      seen.add(tool.id)
    }
  }

  return ordered
}
