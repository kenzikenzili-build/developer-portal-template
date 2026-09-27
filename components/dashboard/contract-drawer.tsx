'use client'

import { FileUp, Loader2, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { contractCategoryOptions } from '@/config/contracts'
import { siteConfig } from '@/config/site'
import { compressImageToWebP } from '@/lib/image-compression'

type ContractDrawerProps = {
  open: boolean
  onClose: () => void
  onSaveSuccess?: () => void
}

export function ContractDrawer({ open, onClose, onSaveSuccess }: ContractDrawerProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Telecom')
  const [cost, setCost] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [cycle, setCycle] = useState('monthly')
  const [renewalDate, setRenewalDate] = useState('')
  const [noticeDays, setNoticeDays] = useState(30)
  const [status, setStatus] = useState('active')

  const [remindTwoMonths, setRemindTwoMonths] = useState(true)
  const [remindDeadline, setRemindDeadline] = useState(true)

  const [isUploading, setIsUploading] = useState(false)
  const [isOcrParsing, setIsOcrParsing] = useState(false)
  const [attachmentS3Key, setAttachmentS3Key] = useState<string | null>(null)
  const [uploadNotice, setUploadNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadNotice('Compressing & preparing file…')

    try {
      // 1. Client-side compression. Reuse this helper against a real upload
      //    endpoint once you have one — nothing here talks to a server.
      const compressedBlob = await compressImageToWebP(file, 300)
      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.webp'), {
        type: compressedBlob.type || 'image/webp',
      })

      // 2. Local-only attachment reference (swap for a presigned upload).
      setAttachmentS3Key(`local-draft://${Date.now()}-${compressedFile.name}`)
      setIsUploading(false)
      setIsOcrParsing(true)
      setUploadNotice('Auto-filling fields from the attachment…')

      // 3. Simulated extraction so the drawer feels alive without a backend.
      window.setTimeout(() => {
        setIsOcrParsing(false)
        setUploadNotice(`Prepared ${(compressedFile.size / 1024).toFixed(0)}KB attachment.`)

        if (!name) setName('New Subscription Contract')
        if (!cost) setCost('48')
        if (!renewalDate) {
          const future = new Date()
          future.setDate(future.getDate() + 45)
          setRenewalDate(future.toISOString().slice(0, 10))
        }
      }, 900)
    } catch (err) {
      setIsUploading(false)
      setIsOcrParsing(false)
      setUploadNotice(
        `Could not read that file: ${err instanceof Error ? err.message : 'unknown error'}`,
      )
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const draft = {
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : String(Date.now()),
      name: name || 'New Subscription',
      category,
      cost: cost || '0',
      currency,
      cycle,
      renewalDate: renewalDate || new Date().toISOString().slice(0, 10),
      noticeWindowDays: noticeDays,
      status,
      attachmentRef: attachmentS3Key,
    }

    // Persist the draft locally so the demo survives a refresh. Replace this
    // block with a POST to your own contracts API.
    try {
      const key = `${siteConfig.storagePrefix}.contract-drafts`
      const existing = JSON.parse(window.localStorage.getItem(key) ?? '[]') as unknown[]
      window.localStorage.setItem(key, JSON.stringify([...existing, draft]))
    } catch {
      // Ignore storage failures — the drawer still closes cleanly.
    }

    if (onSaveSuccess) onSaveSuccess()
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close contract drawer"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/55 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Register Contract / Subscription"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md transform flex-col border-l border-slate-800 bg-slate-950/95 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-400">Lifecycle</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white">
              Register Contract / Subscription
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-600"
            aria-label="Close"
          >
            <X className="size-4" />
            <span className="font-mono text-[10px] tracking-widest text-slate-500">ESC</span>
          </button>
        </div>

        <form className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5" onSubmit={handleSubmit}>
          {/* File Capture / Upload */}
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-3.5 text-center">
            <div className="flex flex-col items-center justify-center gap-1.5">
              <FileUp className="size-6 text-sky-400" />
              <p className="text-xs font-semibold text-slate-200">Upload attachment</p>
              <p className="text-[11px] text-slate-400">
                Photo or PDF — compressed to WebP under 300KB
              </p>
            </div>

            <label className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500 transition">
              <span>Choose file</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {uploadNotice && (
              <div className="mt-2.5 flex items-center justify-center gap-1.5 font-mono text-[11px] text-sky-300">
                {(isUploading || isOcrParsing) && <Loader2 className="size-3.5 animate-spin" />}
                {isOcrParsing && <Sparkles className="size-3.5 text-amber-400" />}
                <span>{uploadNotice}</span>
              </div>
            )}
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Service Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fibre Broadband 1000M"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-slate-600"
              required
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-slate-600"
            >
              {contractCategoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Billing Amount</span>
              <input
                type="text"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g. 48"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-slate-600 font-mono"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-slate-600 font-mono"
              >
                <option value="HKD">HKD ($)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Renewal / End Date</span>
            <input
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-slate-600 [color-scheme:dark] font-mono"
              required
            />
          </label>

          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-3.5">
            <ToggleRow
              label="Remind 30 days before deadline"
              checked={remindTwoMonths}
              onChange={setRemindTwoMonths}
            />
            <ToggleRow
              label="Remind 7 days before deadline"
              checked={remindDeadline}
              onChange={setRemindDeadline}
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-400 cursor-pointer"
          >
            Save draft (stored locally)
          </button>
        </form>
      </aside>
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-sm text-slate-200">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? 'bg-sky-500' : 'bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}
