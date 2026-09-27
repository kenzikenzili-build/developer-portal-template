'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, GripVertical } from 'lucide-react'
import type { CSSProperties } from 'react'

import { BrandIcon } from '@/components/dashboard/brand-icon'
import { ToolCard } from '@/components/dashboard/tool-card'
import type { ToolCategory as ToolCategoryName, WorkspaceTool } from '@/config/tools'
import { categoryBoxId } from '@/lib/tools-category-order'
import { containerId } from '@/lib/tools-layout'
import { softPillClass } from '@/lib/ui'

const PREVIEW_LIMIT = 7

const categoryBoxClass =
  'mb-6 rounded-2xl border border-slate-200/80 bg-white/75 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/40'

export const toolGridClass = 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

type ToolSortableGridProps = {
  category: ToolCategoryName
  tools: WorkspaceTool[]
  enableReorder: boolean
  /** When false, the parent category box is the droppable (avoids duplicate ids). */
  attachDroppable?: boolean
}

export function ToolSortableGrid({
  category,
  tools,
  enableReorder,
  attachDroppable = true,
}: ToolSortableGridProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: attachDroppable ? containerId(category) : `grid:${category}`,
    disabled: !attachDroppable || !enableReorder,
  })

  const safeTools = tools.filter(
    (tool): tool is WorkspaceTool => !!tool && typeof tool.id === 'string' && tool.id.length > 0,
  )
  const sortableIds = safeTools.map((tool) => tool.id)

  if (!enableReorder) {
    return (
      <div className={toolGridClass} data-category={category}>
        {safeTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    )
  }

  return (
    <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
      <div
        ref={setNodeRef}
        data-category={category}
        className={`${toolGridClass} min-h-[7.5rem] rounded-xl p-0.5 transition-shadow ${
          isOver ? 'ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-transparent' : ''
        }`}
      >
        {safeTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} sortable />
        ))}
      </div>
    </SortableContext>
  )
}

type ToolCategoryProps = {
  category: ToolCategoryName
  tools: WorkspaceTool[]
  isOpen: boolean
  onToggle: () => void
  enableReorder: boolean
  /** When true, the accordion box can be dragged to reorder categories. */
  enableCategoryReorder?: boolean
}

export function ToolCategory({
  category,
  tools,
  isOpen,
  onToggle,
  enableReorder,
  enableCategoryReorder = false,
}: ToolCategoryProps) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: containerId(category),
    disabled: !enableReorder,
  })
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: categoryBoxId(category),
    disabled: !enableCategoryReorder,
  })

  const setNodeRef = (node: HTMLDivElement | null) => {
    setDroppableRef(node)
    setSortableRef(node)
  }

  const style: CSSProperties | undefined = enableCategoryReorder
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        zIndex: isDragging ? 30 : undefined,
        pointerEvents: isDragging ? 'none' : undefined,
      }
    : undefined

  const previewTools = tools
    .filter((tool): tool is WorkspaceTool => !!tool && typeof tool.id === 'string')
    .slice(0, PREVIEW_LIMIT)
  const overflowCount = Math.max(0, tools.filter((tool) => !!tool?.id).length - PREVIEW_LIMIT)

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-droppable-category={category}
      data-testid={`category-box-${category}`}
      className={`${categoryBoxClass} transition-shadow ${
        isOver ? 'ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-transparent' : ''
      } ${isDragging ? 'shadow-lg' : ''} ${
        enableCategoryReorder
          ? 'select-none hover:border-dashed hover:border-slate-400/80 dark:hover:border-slate-500'
          : ''
      }`}
    >
      <div className="flex w-full items-center gap-1 rounded-2xl p-2 md:px-3">
        {enableCategoryReorder ? (
          <div
            ref={setActivatorNodeRef}
            data-dnd-handle
            aria-label={`Reorder ${category} category`}
            className="grid size-11 shrink-0 cursor-grab touch-none select-none place-items-center rounded-lg text-slate-400 transition hover:bg-white/50 hover:text-slate-700 active:cursor-grabbing md:size-9 dark:hover:bg-slate-800/80 dark:hover:text-slate-200"
            style={{ touchAction: 'none' }}
            draggable={false}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" aria-hidden />
          </div>
        ) : null}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onToggle()
          }}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${category}`}
          className="flex min-w-0 flex-1 cursor-pointer select-none items-center justify-between gap-3 rounded-xl px-2 py-2 transition-all duration-300 ease-out hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:px-3 dark:hover:bg-slate-800/40"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex shrink-0 items-center gap-2">
              <h3 className="text-sm font-bold tracking-[-0.02em] text-slate-900 dark:text-slate-100">
                {category}
              </h3>
              <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums ${softPillClass}`}>
                {tools.length}
              </span>
            </div>

            {!isOpen ? (
              <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-hidden px-2">
                {previewTools.map((tool, idx) => (
                  <span
                    key={tool.id}
                    title={tool.name}
                    draggable={false}
                    className="animate-ambient-float flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 p-1.5 shadow-sm transition-all duration-300 ease-out hover:scale-110 hover:border-white/40 hover:!translate-y-0 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:bg-slate-800/60 dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.06)]"
                    style={{
                      animationDelay: `${idx * 220}ms`,
                      animationDuration: '3.6s',
                    }}
                  >
                    <BrandIcon brand={tool.brand} className="size-full !rounded-md" draggable={false} />
                  </span>
                ))}
                {overflowCount > 0 ? (
                  <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/60 bg-slate-50 px-1.5 font-mono text-[10px] font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-300">
                    +{overflowCount}
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="min-w-0 flex-1" aria-hidden />
            )}
          </div>

          <ChevronDown
            className={`size-5 shrink-0 text-slate-500 transition-transform duration-300 ease-out dark:text-slate-400 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
            aria-hidden
          />
        </button>
      </div>

      <div
        className={`grid transition-all duration-300 ease-out ${
          isOpen
            ? 'max-h-[2400px] grid-rows-[1fr] overflow-visible opacity-100'
            : 'max-h-0 grid-rows-[0fr] overflow-hidden opacity-0'
        }`}
      >
        <div className="min-h-0 px-4 pb-4 md:px-6">
          <ToolSortableGrid
            category={category}
            tools={tools}
            enableReorder={enableReorder}
            attachDroppable={false}
          />
        </div>
      </div>
    </div>
  )
}
