'use client'

import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { CheckCircle2, ChevronDown, ChevronUp, Circle, CircleDot, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { TelemetryBadge, type TelemetryStatus } from '@/components/TelemetryBadge'
import { siteConfig } from '@/config/site'
import { useSprintCatalog } from '@/hooks/useSprintCatalog'
import {
  ACTIVE_SPRINT_ID,
  PROJECT_FILTER_KEYS,
  nextSprintStatus,
  pickDefaultSprintId,
  projectDisplayName,
  sprintStatusStyles,
  sprintTimeline,
  type SprintBoard,
  type SprintItem,
  type SprintStatus,
} from '@/lib/sprint'
import { formatSyncTimestamp } from '@/lib/sync-time'
import {
  glassCardClass,
  cardPadClass,
  mutedTextClass,
  primaryTextClass,
  sectionLabelClass,
  sectionTitleClass,
} from '@/lib/ui'
import { cn } from '@/lib/utils'

type ProjectFilter = 'all' | (typeof PROJECT_FILTER_KEYS)[number]
type StatusFilter = 'all' | SprintStatus

type ScopedTask = SprintItem & { sprintId: string }

const PROJECT_TABS: { key: ProjectFilter; label: string }[] = [
  { key: 'all', label: 'All Projects' },
  { key: 'core-platform', label: 'Core Platform' },
  { key: 'design-system', label: 'Design System' },
  { key: 'api-gateway', label: 'API Gateway' },
  { key: 'portfolio-site', label: 'Portfolio Site' },
]

const SPRINT_COLLAPSED_KEY = `${siteConfig.storagePrefix}.sprint-collapsed`

const statusIcon: Record<SprintStatus, typeof CheckCircle2> = {
  Done: CheckCircle2,
  'In Progress': CircleDot,
  Backlog: Circle,
}

const fadeSlide = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
}

function shortSprintLabel(sprint: SprintBoard) {
  const match = sprint.sprintId.match(/(\d+)/)
  return match ? match[1].padStart(2, '0') : sprint.sprintId
}

function taskDisplayId(id: string) {
  const match = id.match(/(\d+)\s*$/)
  if (match) return `TASK-${match[1].padStart(2, '0')}`
  return id.toUpperCase()
}

export function SprintTrackerCard() {
  const { catalog, fetchedAt, lastUpdated, updateItemStatus, resetCatalog } =
    useSprintCatalog()
  const sprints = catalog.sprints

  const [selectedProject, setSelectedProject] = useState<ProjectFilter>('all')
  const [selectedSprint, setSelectedSprint] = useState(
    () => pickDefaultSprintId(sprints) || ACTIVE_SPRINT_ID,
  )
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all')
  const [isSprintCollapsed, setIsSprintCollapsed] = useState<boolean>(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SPRINT_COLLAPSED_KEY)
      if (stored === 'true') {
        setIsSprintCollapsed(true)
      }
    } catch {
      // ignore
    }
  }, [])

  const toggleCollapse = () => {
    setIsSprintCollapsed((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(SPRINT_COLLAPSED_KEY, String(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  useEffect(() => {
    if (!sprints.some((sprint) => sprint.sprintId === selectedSprint)) {
      setSelectedSprint(pickDefaultSprintId(sprints) || ACTIVE_SPRINT_ID)
    }
  }, [sprints, selectedSprint])

  const board = sprints.find((sprint) => sprint.sprintId === selectedSprint) ?? sprints[0]

  // Flat task index with sprintId so filters match the dashboard state model.
  const allTasks = useMemo<ScopedTask[]>(
    () =>
      sprints.flatMap((sprint) =>
        sprint.items.map((item) => ({
          ...item,
          sprintId: sprint.sprintId,
        })),
      ),
    [sprints],
  )

  // Step 1 — Scope: project + sprint
  const scopedTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (task.sprintId !== selectedSprint) return false
      if (selectedProject !== 'all' && task.project !== selectedProject) return false
      return true
    })
  }, [allTasks, selectedProject, selectedSprint])

  // Step 2 — KPIs from scoped tasks
  const { doneCount, inProgressCount, backlogCount, totalCount, completionRate } = useMemo(() => {
    const done = scopedTasks.filter((task) => task.status === 'Done').length
    const inProgress = scopedTasks.filter((task) => task.status === 'In Progress').length
    const backlog = scopedTasks.filter((task) => task.status === 'Backlog').length
    const total = scopedTasks.length
    return {
      doneCount: done,
      inProgressCount: inProgress,
      backlogCount: backlog,
      totalCount: total,
      completionRate: Math.round((done / total) * 100) || 0,
    }
  }, [scopedTasks])

  // Step 3 — Display filter by status
  const displayedTasks = useMemo(() => {
    if (selectedStatus === 'all') return scopedTasks
    return scopedTasks.filter((task) => task.status === selectedStatus)
  }, [scopedTasks, selectedStatus])

  const telemetryStatus: TelemetryStatus = 'sandbox'

  if (!board) return null

  return (
    <section id="sprint" className="scroll-mt-20">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={sectionLabelClass}>DELIVERY BOARD</h2>
          <p className={sectionTitleClass}>Sprint delivery board</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleCollapse}
            aria-expanded={!isSprintCollapsed}
            aria-label={isSprintCollapsed ? 'Expand Sprint Delivery Board' : 'Collapse Sprint Delivery Board'}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-all touch-manipulation cursor-pointer"
          >
            {isSprintCollapsed ? (
              <>
                <span>Expand</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Collapse</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={resetCatalog}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-all touch-manipulation cursor-pointer"
            title="Restore the bundled mock board"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <TelemetryBadge
            status={telemetryStatus}
            lastUpdated={lastUpdated ?? board.lastUpdated}
            fetchedAt={fetchedAt}
          />
        </div>
      </div>

      <article className={`relative overflow-hidden ${cardPadClass} ${glassCardClass}`}>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-sky-400/10 blur-3xl dark:bg-cyan-400/10"
        />

        <div className="relative flex flex-col gap-4 md:gap-5">
          {/* Level 1 — Project scope selector */}
          <div
            role="tablist"
            aria-label="Filter by project"
            className="flex gap-1.5 overflow-x-auto pb-0.5 md:flex-wrap md:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {PROJECT_TABS.map((tab) => {
              const selected = selectedProject === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setSelectedProject(tab.key)
                    setSelectedStatus('all')
                  }}
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                    selected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm dark:border-cyan-400 dark:bg-cyan-400 dark:text-slate-950'
                      : 'border-slate-200/80 bg-white/70 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white',
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Level 2 — Sprint period segmented control */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <LayoutGroup id="sprint-switcher">
              <div
                role="tablist"
                aria-label="Sprint timeline"
                className="flex w-full gap-1 overflow-x-auto rounded-2xl border border-white/50 bg-white/40 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-950/40 dark:shadow-none"
              >
                {sprints.map((sprint) => {
                  const selected = sprint.sprintId === selectedSprint
                  const timeline = sprintTimeline(sprint.state)
                  return (
                    <button
                      key={sprint.sprintId}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => {
                        setSelectedSprint(sprint.sprintId)
                        setSelectedStatus('all')
                      }}
                      className={cn(
                        'relative min-w-[7.25rem] flex-1 rounded-xl px-3 py-2 text-left transition',
                        selected
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
                      )}
                    >
                      {selected ? (
                        <motion.span
                          layoutId="sprint-tab-pill"
                          className="absolute inset-0 rounded-xl border border-white/70 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/90"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                      ) : null}
                      <span className="relative z-10 flex flex-col">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                          Sprint {shortSprintLabel(sprint)}
                        </span>
                        <span className="mt-0.5 text-xs font-semibold">
                          ({timeline === 'Past' ? 'Past' : timeline === 'Active' ? 'Active' : 'Future'})
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </LayoutGroup>
            <p className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-slate-500 sm:pt-1 dark:text-slate-400">
              Updated {formatSyncTimestamp(lastUpdated ?? board.lastUpdated)}
            </p>
          </div>

          {/* Level 3 — Sprint header + dynamic progress */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedSprint}-${selectedProject}-header`}
              {...fadeSlide}
              className="min-w-0"
            >
              <h3 className={`text-base font-bold tracking-tight sm:text-lg md:text-xl ${primaryTextClass}`}>
                {board.sprintName}
              </h3>
              <div className="mt-2 mb-2 flex items-center justify-between gap-3 text-xs">
                <span className={mutedTextClass}>
                  {doneCount} of {totalCount} done ({completionRate}%)
                </span>
                <span className={`font-mono tabular-nums ${primaryTextClass}`}>{completionRate}%</span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full border border-slate-200/60 bg-slate-100/80 dark:border-slate-800/80 dark:bg-slate-800/80">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-sky-500"
                  initial={false}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Level 4 & Level 5 — Interactive status filter pills & Task Grid */}
          <AnimatePresence initial={false}>
            {!isSprintCollapsed ? (
              <motion.div
                key="sprint-collapsible-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden flex flex-col gap-4 md:gap-5"
              >
                {/* Level 4 — Interactive status filter pills */}
                <div
                  role="group"
                  aria-label="Filter by status"
                  className="flex flex-wrap gap-1.5"
                >
                  {(
                    [
                      { key: 'all' as const, label: `All (${totalCount})` },
                      { key: 'Done' as const, label: `Done (${doneCount})` },
                      { key: 'In Progress' as const, label: `In Progress (${inProgressCount})` },
                      { key: 'Backlog' as const, label: `Backlog (${backlogCount})` },
                    ] as const
                  ).map((pill) => {
                    const selected = selectedStatus === pill.key
                    return (
                      <button
                        key={pill.key}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setSelectedStatus(pill.key)}
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-[11px] font-medium transition',
                          selected
                            ? 'border-slate-900 bg-slate-900 text-white dark:border-white/80 dark:bg-white dark:text-slate-950'
                            : 'border-slate-200/80 bg-white/70 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white',
                        )}
                      >
                        {pill.label}
                      </button>
                    )
                  })}
                </div>

                {/* Level 5 — High-density responsive task grid */}
                <div
                  className={cn(
                    'max-h-[500px] overflow-y-auto overscroll-contain pr-1',
                    '[scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.45)_transparent]',
                    '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/70 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600/70',
                    'grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3',
                    'p-2.5 md:p-0',
                  )}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {displayedTasks.length === 0 ? (
                      <motion.p
                        key="empty"
                        {...fadeSlide}
                        className={`col-span-full py-6 text-center text-sm ${mutedTextClass}`}
                      >
                        No tasks match this filter.
                      </motion.p>
                    ) : (
                      displayedTasks.map((item) => {
                        const Icon = statusIcon[item.status]
                        return (
                          <motion.article
                            key={item.id}
                            layout
                            {...fadeSlide}
                            className="flex flex-col justify-between rounded-xl border border-slate-200/60 bg-white/80 p-3 backdrop-blur-sm transition-all hover:border-slate-400 dark:border-slate-700/60 dark:bg-slate-800/80"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                                  {projectDisplayName(item.project)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateItemStatus(item.id, nextSprintStatus(item.status))}
                                  aria-label={`Cycle status for ${item.title}. Currently ${item.status}.`}
                                  title="Click to cycle Backlog → In Progress → Done"
                                  className={cn(
                                    'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium transition hover:brightness-95',
                                    sprintStatusStyles[item.status],
                                  )}
                                >
                                  {item.status}
                                </button>
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-800 sm:text-sm dark:text-slate-100">
                                {item.title}
                              </p>
                            </div>
                            <div className="mt-2.5 flex items-center justify-between gap-2">
                              <span className="font-mono text-[10px] tracking-wide text-slate-400">
                                {taskDisplayId(item.id)}
                              </span>
                              <Icon
                                className={cn(
                                  'size-3.5 shrink-0',
                                  item.status === 'Done'
                                    ? 'text-emerald-500'
                                    : item.status === 'In Progress'
                                      ? 'text-sky-500'
                                      : 'text-slate-400',
                                )}
                                aria-hidden
                              />
                            </div>
                          </motion.article>
                        )
                      })
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </article>
    </section>
  )
}
