'use client'

import { CheckCircle2, Circle, CircleDot, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { mockTasks, type MockTask } from '@/config/mockData'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

const TASKS_STORAGE_KEY = `${siteConfig.storagePrefix}.tasks`

const STATUS_ORDER: MockTask['status'][] = ['open', 'in_progress', 'done']

const STATUS_META: Record<MockTask['status'], { label: string; icon: typeof Circle; tone: string }> = {
  open: {
    label: 'Open',
    icon: Circle,
    tone: 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
  },
  in_progress: {
    label: 'In progress',
    icon: CircleDot,
    tone: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/40 dark:bg-sky-950/40 dark:text-sky-100',
  },
  done: {
    label: 'Done',
    icon: CheckCircle2,
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-100',
  },
}

const PRIORITY_TONE: Record<MockTask['priority'], string> = {
  high: 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-200',
  medium: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100',
  low: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

const PROJECT_OPTIONS = ['core-platform', 'design-system', 'api-gateway', 'portfolio-site']

function nextStatus(status: MockTask['status']): MockTask['status'] {
  const index = STATUS_ORDER.indexOf(status)
  return STATUS_ORDER[(index + 1) % STATUS_ORDER.length]
}

/**
 * Task board.
 *
 * Seeds from `mockTasks` and persists edits to localStorage. Swap the state for
 * your own API calls and the board keeps its behaviour.
 */
export function TaskBoard() {
  const [tasks, setTasks] = useState<MockTask[]>(mockTasks)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<MockTask['priority']>('medium')
  const [project, setProject] = useState(PROJECT_OPTIONS[0])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TASKS_STORAGE_KEY)
      if (!raw) return
      const stored = JSON.parse(raw) as MockTask[]
      if (Array.isArray(stored) && stored.length > 0) setTasks(stored)
    } catch {
      // Ignore malformed payloads.
    }
  }, [])

  const persist = (next: MockTask[]) => {
    setTasks(next)
    try {
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore storage failures.
    }
  }

  const grouped = useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        status,
        items: tasks.filter((task) => task.status === status),
      })),
    [tasks],
  )

  const openCount = tasks.filter((task) => task.status !== 'done').length

  return (
    <section id="tasks" className="scroll-mt-20">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-900 md:text-xs dark:text-slate-300">
              TASK BOARD
            </h2>
            <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              {openCount} open
            </span>
          </div>
          <p className="mt-1 text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Your queue, persisted locally
          </p>
        </div>
        <button
          type="button"
          onClick={() => persist(mockTasks)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <RotateCcw className="size-3.5" />
          Reset board
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a task…"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100"
          />
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as MockTask['priority'])}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={project}
            onChange={(event) => setProject(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100"
          >
            {PROJECT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              const trimmed = title.trim()
              if (!trimmed) return
              persist([
                {
                  id: `task-${Date.now()}`,
                  title: trimmed,
                  status: 'open',
                  priority,
                  due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                  project,
                },
                ...tasks,
              ])
              setTitle('')
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            <Plus className="size-4" />
            Add
          </button>
        </div>


        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {grouped.map(({ status, items }) => {
            const meta = STATUS_META[status]
            const Icon = meta.icon
            return (
              <div
                key={status}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                    <Icon className="size-3.5" />
                    {meta.label}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    {items.length}
                  </span>
                </div>
                <ul className="mt-2.5 space-y-2">
                  {items.length === 0 ? (
                    <li className="rounded-lg border border-dashed border-slate-300 px-2.5 py-3 text-center text-[11px] italic text-slate-400 dark:border-slate-700">
                      Nothing here
                    </li>
                  ) : null}
                  {items.map((task) => (
                    <li
                      key={task.id}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'text-xs font-medium leading-snug text-slate-800 dark:text-slate-100',
                            task.status === 'done' && 'line-through opacity-60',
                          )}
                        >
                          {task.title}
                        </p>
                        <button
                          type="button"
                          onClick={() => persist(tasks.filter((item) => item.id !== task.id))}
                          className="shrink-0 text-slate-400 transition hover:text-rose-500"
                          aria-label={`Delete ${task.title}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            'rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase',
                            PRIORITY_TONE[task.priority],
                          )}
                        >
                          {task.priority}
                        </span>
                        <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {task.project}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">due {task.due}</span>
                        <button
                          type="button"
                          onClick={() =>
                            persist(
                              tasks.map((item) =>
                                item.id === task.id
                                  ? { ...item, status: nextStatus(item.status) }
                                  : item,
                              ),
                            )
                          }
                          className={cn(
                            'ml-auto rounded-full border px-2 py-0.5 text-[10px] font-medium transition hover:brightness-95',
                            meta.tone,
                          )}
                          title="Cycle status"
                        >
                          {meta.label}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

