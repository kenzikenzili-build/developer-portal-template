'use client'

import { Copy, Loader2, RotateCcw, Save, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { mockKnowledgeNotes, mockKnowledgeTags, type MockKnowledgeNote } from '@/config/mockData'
import { siteConfig } from '@/config/site'

const NOTES_STORAGE_KEY = `${siteConfig.storagePrefix}.knowledge-notes`

/**
 * Knowledge hub.
 *
 * A self-contained note capture + search surface. Everything lives in
 * localStorage so the shell demonstrates the full interaction without a vector
 * database. Point the search at your own retrieval API when you have one.
 */
export function KnowledgeHubSection() {
  const [notes, setNotes] = useState<MockKnowledgeNote[]>(mockKnowledgeNotes)
  const [draft, setDraft] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>(mockKnowledgeTags[0])
  const [isSaving, setIsSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(NOTES_STORAGE_KEY)
      if (!raw) return
      const stored = JSON.parse(raw) as MockKnowledgeNote[]
      if (Array.isArray(stored) && stored.length > 0) {
        setNotes([...stored, ...mockKnowledgeNotes])
      }
    } catch {
      // Ignore malformed payloads.
    }
  }, [])

  const persist = (next: MockKnowledgeNote[]) => {
    setNotes(next)
    try {
      window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore storage failures.
    }
  }

  const flash = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(null), 2400)
  }

  const handleSave = async () => {
    const content = draft.trim()
    if (!content) {
      flash('Write something before saving.')
      return
    }
    setIsSaving(true)
    await new Promise((resolve) => window.setTimeout(resolve, 250))
    const note: MockKnowledgeNote = {
      id: `note-${Date.now()}`,
      tag: selectedTag,
      content,
      savedAt: new Date().toISOString().slice(0, 10),
    }
    persist([note, ...notes])
    setDraft('')
    setIsSaving(false)
    flash('Note saved locally.')
  }

  const handleSearch = async () => {
    setIsSearching(true)
    await new Promise((resolve) => window.setTimeout(resolve, 250))
    setSubmittedQuery(query.trim())
    setIsSearching(false)
  }

  const handleReset = () => {
    persist([])
    setNotes(mockKnowledgeNotes)
    setSubmittedQuery('')
    setQuery('')
    flash('Notes reset to the bundled seed.')
  }

  const results = useMemo(() => {
    if (!submittedQuery) return []
    const needle = submittedQuery.toLowerCase()
    return notes.filter(
      (note) =>
        note.content.toLowerCase().includes(needle) || note.tag.toLowerCase().includes(needle),
    )
  }, [notes, submittedQuery])

  return (
    <section id="knowledge" className="scroll-mt-20">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-900 md:text-xs dark:text-slate-300">
              KNOWLEDGE HUB
            </h2>
            <p className="mt-1 text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Capture notes, search your own knowledge base
            </p>
          </div>
          <div className="flex items-center gap-2">
            {notice ? (
              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                {notice}
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-2.5">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Tag
              </span>
              <select
                value={selectedTag}
                onChange={(event) => setSelectedTag(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100"
              >
                {mockKnowledgeTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>

            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={5}
              placeholder="Paste a snippet, a decision, or a link worth keeping…"
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100"
            />

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save note
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void handleSearch()
                }}
                placeholder="Search notes…"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => void handleSearch()}
                disabled={isSearching}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {isSearching ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Search className="size-3.5" />
                )}
                Search
              </button>
            </div>


            <div className="h-[280px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              {submittedQuery ? (
                results.length > 0 ? (
                  <ul className="space-y-2">
                    {results.map((note) => (
                      <li
                        key={note.id}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                            {note.tag}
                          </span>
                          <button
                            type="button"
                            onClick={() => void navigator.clipboard.writeText(note.content)}
                            className="text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
                            aria-label="Copy note"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </div>
                        <p className="mt-1 leading-relaxed">{note.content}</p>
                        <p className="mt-1 font-mono text-[10px] text-slate-400">{note.savedAt}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-4 text-center text-xs italic text-slate-500">
                    No notes matched “{submittedQuery}”.
                  </p>
                )
              ) : (
                <ul className="space-y-2">
                  {notes.slice(0, 5).map((note) => (
                    <li
                      key={note.id}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                        {note.tag}
                      </span>
                      <p className="mt-1 leading-relaxed">{note.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

