'use client'

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronsDown, ChevronsUp, GripVertical, Lock, RotateCcw, Unlock } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'

import { ToolCard } from '@/components/dashboard/tool-card'
import { ToolCategory } from '@/components/dashboard/tool-category'
import { LAUNCHER_CATEGORIES, TOOL_FILTER_VALUES, toolsCatalog } from '@/config/toolCatalog'
import type { ToolCategory as ToolCategoryName, ToolFilter } from '@/config/tools'
import {
  applyCategoryOrder,
  categoryBoxId,
  categoryDndPrefix,
  categoryPillId,
  clearCategoryOrder,
  isCategoryDndId,
  loadCategoryOrder,
  loadToolsLockState,
  parseCategoryDndId,
  reorderCategoryNames,
  saveCategoryOrder,
  saveToolsLockState,
} from '@/lib/tools-category-order'
import { clearSavedToolsOrder, writeToolsOrder } from '@/lib/tools-order'
import {
  areAllCategoriesOpen,
  isToolsCategoryOpen,
  loadToolsDrawerState,
  saveToolsDrawerState,
  setAllCategoriesOpen,
  type ToolsDrawerState,
} from '@/lib/tools-drawer-state'
import {
  buildDefaultBoard,
  clearToolsLayoutV2,
  findBoardCategory,
  findToolOnBoard,
  hydrateBoard,
  isContainerId,
  moveTool,
  readToolsLayoutV2,
  serializeBoard,
  writeToolsLayoutV2,
  type ToolsBoard,
} from '@/lib/tools-layout'
import { sectionLabelClass, softPillClass } from '@/lib/ui'

type SortMode = 'default' | 'az'

function asDroppableList(value: unknown) {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object' && 'getEnabled' in value) {
    const enabled = (value as { getEnabled?: () => unknown }).getEnabled
    if (typeof enabled === 'function') {
      const list = enabled.call(value)
      if (Array.isArray(list)) return list
    }
  }
  return []
}

export function ToolsSection() {
  const [mounted, setMounted] = useState(false)

  const [selectedCategories, setSelectedCategories] = useState<ToolFilter[]>(['All'])
  const [sortMode, setSortMode] = useState<SortMode>('default')
  /** Category open map (`true` = expanded). Unspecified → open. Hydrated after mount. */
  const [drawerOpen, setDrawerOpen] = useState<ToolsDrawerState>({})
  /** Custom category order from localStorage. Hydrated after mount. */
  const [storedCategoryOrder, setStoredCategoryOrder] = useState<string[]>([])
  /** Global DnD lock. Default locked; `"false"` string must not parse as locked. */
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return loadToolsLockState()
  })
  /** Bumped on Reset Order so pills/cards remount in factory order immediately. */
  const [orderEpoch, setOrderEpoch] = useState(0)
  const [board, setBoard] = useState<ToolsBoard>({})
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const boardRef = useRef<ToolsBoard>({})
  const dragOriginRef = useRef<ToolsBoard | null>(null)
  const lastOverIdRef = useRef<UniqueIdentifier | null>(null)
  const categoryOriginRef = useRef<ToolCategoryName[] | null>(null)
  const orderedNamesRef = useRef<ToolCategoryName[]>([])
  boardRef.current = board

  useEffect(() => {
    // Client-only: hydrate accordion + category order after mount (SSR-safe).
    setDrawerOpen(loadToolsDrawerState())
    setStoredCategoryOrder(loadCategoryOrder())
    setIsLocked(loadToolsLockState())
    setMounted(true)
  }, [])

  const categoriesToRender = LAUNCHER_CATEGORIES
  const defaultCategoryNames = useMemo(
    () => categoriesToRender.map((group) => group.category),
    [categoriesToRender],
  )
  const orderedCategoryNames = useMemo(
    () => applyCategoryOrder(defaultCategoryNames, storedCategoryOrder),
    [defaultCategoryNames, storedCategoryOrder],
  )
  orderedNamesRef.current = orderedCategoryNames

  const catalog = toolsCatalog
  const defaultFilters = TOOL_FILTER_VALUES
  const filters = useMemo(() => {
    const known = new Set(defaultFilters)
    const next: ToolFilter[] = []
    if (known.has('All')) next.push('All')
    for (const name of orderedCategoryNames) {
      if (known.has(name as ToolFilter)) next.push(name as ToolFilter)
    }
    for (const tag of defaultFilters) {
      if (tag !== 'All' && !next.includes(tag)) next.push(tag)
    }
    return next
  }, [defaultFilters, orderedCategoryNames])

  const isAllSelected = selectedCategories.includes('All')
  const enableReorder = sortMode === 'default' && !isLocked
  const enableCategoryReorder = isAllSelected && !isLocked
  const enableCategoryPillReorder = !isLocked
  const categoryPillIds = useMemo(
    () => orderedCategoryNames.map((name) => categoryPillId(name)),
    [orderedCategoryNames],
  )

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 5 },
  })
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  })
  const sensors = useSensors(mouseSensor, touchSensor, pointerSensor)

  const handleCategoryFilterClick = (tag: ToolFilter) => {
    if (tag === 'All') {
      setSelectedCategories(['All'])
      return
    }

    setSelectedCategories((prev) => {
      const withoutAll = prev.filter((item) => item !== 'All')
      if (withoutAll.includes(tag)) {
        const next = withoutAll.filter((item) => item !== tag)
        return next.length === 0 ? ['All'] : next
      } else {
        return [...withoutAll, tag]
      }
    })
  }

  useEffect(() => {
    setSelectedCategories((prev) => {
      const valid = prev.filter((cat) => filters.includes(cat))
      return valid.length === 0 ? ['All'] : valid
    })
  }, [filters])

  // Nested grid droppables (`container:*`) wrap every card. Prefer the card so
  // intra-category reorder is not a no-op when pointerWithin hits the wrapper.
  const collisionDetection = useCallback<CollisionDetection>((args) => {
    try {
      const draggingId = args.active?.id
      const draggingKey = draggingId == null ? '' : String(draggingId)
      const categoryPrefix = categoryDndPrefix(draggingKey)
      const containers = asDroppableList(args.droppableContainers)

      if (categoryPrefix) {
        const categoryContainers = containers.filter((container) =>
          String(container.id).startsWith(categoryPrefix),
        )
        const nextArgs = { ...args, droppableContainers: categoryContainers }
        const hits = closestCenter(nextArgs)
        const over = hits.find((hit) => hit.id !== draggingId)
        return over ? [over] : []
      }

      const pointerHits = pointerWithin(args)
      const hits = pointerHits.length > 0 ? pointerHits : closestCenter(args)
      if (draggingId == null) return hits[0] ? [hits[0]] : []

      const overItem = hits.find(
        (hit) => hit.id !== draggingId && !isContainerId(String(hit.id)) && !isCategoryDndId(String(hit.id)),
      )
      if (overItem) {
        lastOverIdRef.current = overItem.id
        return [overItem]
      }

      const overContainer = hits.find((hit) => isContainerId(String(hit.id)))
      if (overContainer) {
        lastOverIdRef.current = overContainer.id
        return [overContainer]
      }

      if (hits[0]) {
        lastOverIdRef.current = hits[0].id
        return [hits[0]]
      }

      return lastOverIdRef.current ? [{ id: lastOverIdRef.current }] : []
    } catch {
      return lastOverIdRef.current ? [{ id: lastOverIdRef.current }] : []
    }
  }, [])

  const catalogKey = catalog.map((tool) => tool.id).join('|')
  const categoriesKey = defaultCategoryNames.join('|')

  useEffect(() => {
    if (!mounted || catalog.length === 0 || defaultCategoryNames.length === 0) return
    setBoard(hydrateBoard(catalog, defaultCategoryNames, readToolsLayoutV2()))
  }, [catalogKey, categoriesKey, catalog, defaultCategoryNames, mounted])

  const persistBoard = useCallback((next: ToolsBoard) => {
    try {
      const payload = serializeBoard(next)
      writeToolsLayoutV2(payload)
      for (const [cat, ids] of Object.entries(payload)) {
        writeToolsOrder(cat, ids)
      }
      setBoard(next)
    } catch {
      // Keep in-memory board if persistence fails; never crash the tree.
      setBoard(next)
    }
  }, [])

  const persistCategoryOrder = useCallback((next: ToolCategoryName[]) => {
    saveCategoryOrder(next)
    setStoredCategoryOrder(next)
  }, [])

  const handleResetOrder = () => {
    try {
      clearCategoryOrder()
      clearSavedToolsOrder()
      clearToolsLayoutV2()
      setStoredCategoryOrder([])
      setSortMode('default')
      const next = buildDefaultBoard(catalog, defaultCategoryNames)
      persistBoard(next)
      setOrderEpoch((epoch) => epoch + 1)
    } catch {
      // Ignore reset failures.
    }
  }

  const allOpen = areAllCategoriesOpen(orderedCategoryNames, drawerOpen)

  const handleToggleAll = () => {
    const nextOpen = !allOpen
    const next = setAllCategoriesOpen(orderedCategoryNames, nextOpen)
    saveToolsDrawerState(next)
    setDrawerOpen(next)
  }

  const handleDragStart = (event: DragStartEvent) => {
    try {
      const id = event.active?.id
      if (id == null) return
      if (isLocked) return
      setActiveId(id)
      if (!isCategoryDndId(String(id))) {
        dragOriginRef.current = boardRef.current
      } else {
        categoryOriginRef.current = [...orderedNamesRef.current]
      }
      lastOverIdRef.current = null
    } catch {
      setActiveId(null)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    try {
      const { active, over } = event
      if (!active?.id || !over?.id || active.id === over.id) return
      const activeKey = String(active.id)
      const overKey = String(over.id)
      if (!activeKey || !overKey) return
      if (isLocked) return

      if (isCategoryDndId(activeKey)) return

      setBoard((current) => {
        try {
          const fromCategory = findBoardCategory(current, activeKey)
          const toCategory = findBoardCategory(current, overKey)
          if (!fromCategory || !toCategory || fromCategory === toCategory) return current
          return moveTool(current, activeKey, overKey)
        } catch {
          return current
        }
      })
    } catch {
      // Swallow drag-over errors so Error Boundary does not remount the page.
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    try {
      const { active, over } = event
      const activeKey = active?.id != null ? String(active.id) : ''
      setActiveId(null)
      dragOriginRef.current = null
      lastOverIdRef.current = null
      if (isLocked) {
        categoryOriginRef.current = null
        return
      }

      if (isCategoryDndId(activeKey)) {
        const origin = categoryOriginRef.current ?? orderedNamesRef.current
        categoryOriginRef.current = null
        const overCategory = over?.id != null ? parseCategoryDndId(String(over.id)) : null
        const activeCategory = parseCategoryDndId(activeKey)
        const next =
          activeCategory && overCategory
            ? reorderCategoryNames(origin, activeCategory, overCategory)
            : origin
        persistCategoryOrder(next)
        return
      }

      if (!active?.id || !over?.id) return
      const overKey = String(over.id)
      if (!activeKey || !overKey) return

      setBoard((current) => {
        try {
          const next = moveTool(current, activeKey, overKey)
          const serialized = serializeBoard(next)
          writeToolsLayoutV2(serialized)
          for (const [cat, ids] of Object.entries(serialized)) {
            writeToolsOrder(cat, ids)
          }
          return next
        } catch {
          return current
        }
      })
    } catch {
      setActiveId(null)
      dragOriginRef.current = null
      lastOverIdRef.current = null
    }
  }

  const handleDragCancel = () => {
    try {
      setActiveId(null)
      lastOverIdRef.current = null
      const origin = dragOriginRef.current
      dragOriginRef.current = null
      if (origin) setBoard(origin)
      const categoryOrigin = categoryOriginRef.current
      categoryOriginRef.current = null
      if (categoryOrigin) setStoredCategoryOrder(categoryOrigin)
    } catch {
      setActiveId(null)
      dragOriginRef.current = null
      categoryOriginRef.current = null
    }
  }

  const handleToggleLock = () => {
    const nextLocked = !isLocked
    if (nextLocked && activeId != null) {
      handleDragCancel()
    }
    setIsLocked(nextLocked)
    saveToolsLockState(nextLocked)
  }

  const activeKey = activeId == null ? '' : String(activeId)
  const activeTool = activeId && !isCategoryDndId(activeKey) ? findToolOnBoard(board, activeKey) : undefined
  const activeCategoryName = parseCategoryDndId(activeKey)

  const visibleCategories = useMemo(() => {
    if (isAllSelected) return orderedCategoryNames
    return orderedCategoryNames.filter((category) =>
      selectedCategories.includes(category as ToolFilter),
    )
  }, [orderedCategoryNames, selectedCategories, isAllSelected])

  const displayBoard = useMemo(() => {
    const next: ToolsBoard = {}
    for (const category of visibleCategories) {
      const list = (board[category] ?? []).filter(
        (tool): tool is NonNullable<typeof tool> =>
          !!tool && typeof tool.id === 'string' && typeof tool.name === 'string',
      )
      next[category] =
        sortMode === 'az'
          ? [...list].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
          : list
    }
    return next
  }, [board, sortMode, visibleCategories])

  const toggleCategory = (category: ToolCategoryName) => {
    setDrawerOpen((prev) => {
      const nextOpen = !isToolsCategoryOpen(category, prev)
      const next: ToolsDrawerState = { ...prev, [category]: nextOpen }
      saveToolsDrawerState(next)
      return next
    })
  }

  if (!mounted) {
    return (
      <section id="tools" className="scroll-mt-20" aria-busy="true">
        <div className="mb-3 flex items-center gap-3">
          <h2 className={sectionLabelClass}>Workspace Launcher</h2>
        </div>
        <div className="h-48 animate-pulse rounded-2xl border border-slate-200/60 bg-white/40 dark:border-slate-800/80 dark:bg-slate-900/30" />
      </section>
    )
  }

  return (
    <section id="tools" className="scroll-mt-20">
      <div className="mb-3 flex items-center gap-3">
        <h2 className={sectionLabelClass}>Workspace Launcher</h2>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 ${softPillClass}`}>
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/40 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-[10px] tabular-nums text-slate-700 dark:text-slate-400">
            {catalog.length} apps
          </span>
        </span>
      </div>

      <DndContext
        key={`${isLocked ? 'locked' : 'unlocked'}-${orderEpoch}`}
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-4">
          {enableCategoryPillReorder ? (
            <SortableContext items={categoryPillIds} strategy={rectSortingStrategy}>
              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-2">
                {filters.map((tag) => {
                  const active = tag === 'All' ? isAllSelected : selectedCategories.includes(tag)
                  if (tag === 'All') {
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleCategoryFilterClick(tag)}
                        className={filterPillClass(active)}
                      >
                        {tag}
                      </button>
                    )
                  }
                  return (
                    <SortableFilterPill
                      key={tag}
                      tag={tag}
                      active={active}
                      disabled={false}
                      onSelect={() => handleCategoryFilterClick(tag)}
                    />
                  )
                })}
              </div>
            </SortableContext>
          ) : (
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-2">
              {filters.map((tag) => {
                const active = tag === 'All' ? isAllSelected : selectedCategories.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleCategoryFilterClick(tag)}
                    className={filterPillClass(active)}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 md:w-auto md:justify-end">
            <div className={`inline-flex min-h-9 shrink-0 items-center gap-1 rounded-xl p-1 ${softPillClass}`}>
              <span className="hidden px-2 font-mono text-[10px] uppercase tracking-wider text-slate-500 sm:inline dark:text-slate-400">
                Sort
              </span>
              <button
                type="button"
                onClick={() => setSortMode('default')}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  sortMode === 'default'
                    ? 'bg-slate-900 text-white dark:bg-white/20 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Default
              </button>
              <button
                type="button"
                onClick={() => setSortMode('az')}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  sortMode === 'az'
                    ? 'bg-slate-900 text-white dark:bg-white/20 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                A–Z
              </button>
            </div>
            <button
              type="button"
              data-testid="tools-reset-order"
              onClick={handleResetOrder}
              className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${softPillClass} hover:border-slate-300 hover:text-slate-900 dark:hover:text-white`}
            >
              <RotateCcw className="size-3.5" />
              Reset order
            </button>
            <button
              type="button"
              onClick={handleToggleAll}
              aria-label={allOpen ? 'Collapse all categories' : 'Expand all categories'}
              className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${softPillClass} hover:border-slate-300 hover:text-slate-900 dark:hover:text-white`}
            >
              {allOpen ? <ChevronsUp className="size-3.5" /> : <ChevronsDown className="size-3.5" />}
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
            <button
              type="button"
              data-testid="tools-lock-toggle"
              onClick={handleToggleLock}
              aria-pressed={isLocked}
              aria-label={
                isLocked
                  ? 'Layout locked. Click to unlock drag-and-drop.'
                  : 'Layout unlocked. Click to lock drag-and-drop.'
              }
              title={
                isLocked
                  ? 'Locked. Click to enable drag-and-drop.'
                  : 'Unlocked. Click to lock drag-and-drop.'
              }
              className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                isLocked
                  ? `${softPillClass} hover:border-slate-300 hover:text-slate-900 dark:hover:text-white`
                  : 'border border-slate-900 bg-slate-900 text-white shadow-sm hover:bg-slate-800 dark:border-white/30 dark:bg-white/20 dark:text-white dark:hover:bg-white/30'
              }`}
            >
              {isLocked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
              {isLocked ? 'Locked' : 'Unlocked'}
            </button>
          </div>
        </div>

        {isAllSelected ? (
          <SortableContext
            items={orderedCategoryNames.map((name) => categoryBoxId(name))}
            strategy={verticalListSortingStrategy}
          >
            <div key={`categories-${orderEpoch}`}>
              {visibleCategories.map((category) => (
                <ToolCategory
                  key={`${category}-${orderEpoch}`}
                  category={category}
                  tools={displayBoard[category] ?? []}
                  isOpen={isToolsCategoryOpen(category, drawerOpen)}
                  onToggle={() => toggleCategory(category)}
                  enableReorder={enableReorder}
                  enableCategoryReorder={enableCategoryReorder}
                />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div key={`categories-${orderEpoch}`}>
            {visibleCategories.map((category) => (
              <ToolCategory
                key={`${category}-${orderEpoch}`}
                category={category}
                tools={displayBoard[category] ?? []}
                isOpen={isToolsCategoryOpen(category, drawerOpen)}
                onToggle={() => toggleCategory(category)}
                enableReorder={enableReorder}
                enableCategoryReorder={false}
              />
            ))}
          </div>
        )}

        <DragOverlay dropAnimation={null}>
          {activeTool ? <ToolCard tool={activeTool} overlay /> : null}
          {activeCategoryName ? (
            <div className="rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 shadow-lg dark:border-white/20 dark:bg-slate-900 dark:text-white">
              {activeCategoryName}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  )
}

function filterPillClass(active: boolean, draggable = false) {
  return `rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300 ease-out hover:border-white/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.06)] ${
    active
      ? 'border-slate-900 bg-slate-900 text-white shadow-sm dark:border-white/30 dark:bg-white/20 dark:text-white dark:shadow-[0_0_16px_rgba(255,255,255,0.12)]'
      : 'border-slate-200/60 bg-slate-50 text-slate-700 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:text-white'
  } ${draggable ? 'cursor-grab active:cursor-grabbing select-none hover:border-dashed hover:border-slate-400 dark:hover:border-slate-500' : ''}`
}

function SortableFilterPill({
  tag,
  active,
  disabled = false,
  onSelect,
}: {
  tag: ToolFilter
  active: boolean
  disabled?: boolean
  onSelect: () => void
}) {
  const didDragRef = useRef(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: categoryPillId(tag),
    disabled,
  })
  if (isDragging) didDragRef.current = true

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 40 : undefined,
    pointerEvents: isDragging ? 'none' : 'auto',
  }

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (didDragRef.current || isDragging) {
      event.preventDefault()
      event.stopPropagation()
    } else {
      onSelect()
    }
    window.setTimeout(() => {
      didDragRef.current = false
    }, 120)
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, touchAction: disabled ? undefined : 'none' }}
      className={`${filterPillClass(active, !disabled)} inline-flex min-h-9 touch-none items-center gap-1`}
      data-testid={`category-pill-${tag}`}
      data-dnd-handle
      aria-label={`${tag} filter. Drag to reorder categories.`}
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          if (!didDragRef.current && !isDragging) onSelect()
        }
      }}
      {...attributes}
      {...listeners}
    >
      <span className="inline-flex cursor-grab items-center active:cursor-grabbing" aria-hidden>
        <GripVertical className="size-3 shrink-0 opacity-60" />
      </span>
      {tag}
    </div>
  )
}
