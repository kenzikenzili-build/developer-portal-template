'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useRef } from 'react'
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react'

import { BrandIcon } from '@/components/dashboard/brand-icon'
import { normalizeToolCategories, type WorkspaceTool } from '@/config/tools'

const cardClass =
  'group relative select-none rounded-2xl border border-white bg-white/95 p-4 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl transition-[border-color,box-shadow] duration-300 ease-out hover:border-white/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] md:p-5 dark:border-white/10 dark:bg-slate-900/40 dark:text-white dark:shadow-none dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.06)]'

type ToolCardProps = {
  tool: WorkspaceTool
  sortable?: boolean
  overlay?: boolean
}

function ToolCardBody({
  tool,
  handle,
}: {
  tool: WorkspaceTool
  handle?: ReactNode
}) {
  const categories = normalizeToolCategories(tool.category)
  return (
    <>
      {handle}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <BrandIcon brand={tool.brand} className="size-12 shrink-0" draggable={false} />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-[-0.02em] text-slate-900 dark:text-white">
              {tool.name}
            </p>
            <p className="mt-0.5 truncate text-sm text-slate-600 dark:text-slate-400">{tool.tagline}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-md border border-slate-200/60 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}

function openTool(tool: WorkspaceTool) {
  if (tool.url.startsWith('#')) {
    window.location.hash = tool.url
    return
  }
  window.open(tool.url, '_blank', 'noopener,noreferrer')
}

function SortableToolCard({ tool }: { tool: WorkspaceTool }) {
  const didDragRef = useRef(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tool.id,
    disabled: false,
  })

  if (isDragging) didDragRef.current = true

  const { onKeyDown: sortableKeyDown, ...restListeners } = listeners ?? {}

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 40 : undefined,
    pointerEvents: isDragging ? 'none' : 'auto',
  }

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (didDragRef.current || isDragging) {
      event.preventDefault()
      event.stopPropagation()
    } else {
      openTool(tool)
    }
    window.setTimeout(() => {
      didDragRef.current = false
    }, 120)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (!didDragRef.current && !isDragging) openTool(tool)
      return
    }
    sortableKeyDown?.(event)
  }

  const { role: _role, tabIndex: _tabIndex, ...restAttributes } = attributes

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${cardClass} ${tool.accentClass} cursor-grab select-none pl-12 active:cursor-grabbing md:pl-11`}
      data-tool-id={tool.id}
      role="link"
      tabIndex={0}
      aria-label={`${tool.name}. Drag to reorder, or press Enter to open.`}
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...restAttributes}
      {...restListeners}
    >
      <ToolCardBody
        tool={tool}
        handle={
          <span
            data-dnd-handle
            className="absolute inset-y-0 left-0 z-10 inline-flex w-10 cursor-grab touch-none select-none items-center justify-center text-slate-400 active:cursor-grabbing md:w-8 dark:text-slate-500"
            style={{ touchAction: 'none' }}
            aria-hidden
            draggable={false}
          >
            <GripVertical className="size-4" />
          </span>
        }
      />
    </div>
  )
}

export function ToolCard({ tool, sortable = false, overlay = false }: ToolCardProps) {
  if (!tool || typeof tool.id !== 'string' || !tool.id) {
    return null
  }

  const isHashLink = tool.url.startsWith('#')

  if (overlay) {
    return (
      <div
        className={`${cardClass} ${tool.accentClass} pointer-events-none scale-[1.03] cursor-grabbing select-none pl-12 shadow-[0_20px_50px_rgba(0,0,0,0.18)] md:pl-11`}
      >
        <ToolCardBody
          tool={tool}
          handle={
            <span
              className="absolute inset-y-0 left-0 inline-flex w-10 items-center justify-center text-slate-400 md:w-8 dark:text-slate-500"
              aria-hidden
            >
              <GripVertical className="size-4" />
            </span>
          }
        />
      </div>
    )
  }

  if (sortable) {
    return <SortableToolCard tool={tool} />
  }

  return (
    <a
      href={tool.url}
      target={isHashLink ? undefined : '_blank'}
      rel={isHashLink ? undefined : 'noopener noreferrer'}
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      className={`cursor-pointer ${cardClass} ${tool.accentClass}`}
    >
      <ToolCardBody tool={tool} />
    </a>
  )
}
