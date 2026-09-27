import type { ReactNode } from 'react'

/** Render a limited subset of markdown inline: **bold**, *italic*, `code`. */
export function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let part = 0

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    const key = `${keyPrefix}-${part++}`
    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={key} className="font-semibold text-slate-900 dark:text-slate-100">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>,
      )
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-slate-800 dark:bg-slate-800 dark:text-slate-200"
        >
          {token.slice(1, -1)}
        </code>,
      )
    } else {
      nodes.push(token)
    }
    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : [text]
}

type BlockProps = {
  block: string
  blockKey: string
  headingClass: string
  bodyClass: string
}

/** Render one stored body line as heading, list item, or paragraph. */
export function ReportMarkdownBlock({ block, blockKey, headingClass, bodyClass }: BlockProps) {
  const trimmed = block.trim()
  if (!trimmed) return null

  const headingMatch = /^(#{1,3})\s+(.+)$/.exec(trimmed)
  if (headingMatch) {
    const level = headingMatch[1].length
    const text = headingMatch[2]
    if (level === 1) {
      return (
        <h2 key={blockKey} className={`pt-3 text-xl font-semibold ${headingClass}`}>
          {renderInlineMarkdown(text, `${blockKey}-h`)}
        </h2>
      )
    }
    if (level === 2) {
      return (
        <h3 key={blockKey} className={`pt-2 text-lg font-semibold ${headingClass}`}>
          {renderInlineMarkdown(text, `${blockKey}-h`)}
        </h3>
      )
    }
    return (
      <h4 key={blockKey} className={`pt-2 text-base font-semibold ${headingClass}`}>
        {renderInlineMarkdown(text, `${blockKey}-h`)}
      </h4>
    )
  }

  const bulletMatch = /^[-*•]\s+(.+)$/.exec(trimmed)
  if (bulletMatch) {
    return (
      <p key={blockKey} className={`pl-1 text-sm leading-7 ${bodyClass}`}>
        <span className="mr-2 text-slate-400">•</span>
        {renderInlineMarkdown(bulletMatch[1], `${blockKey}-li`)}
      </p>
    )
  }

  const numberedMatch = /^(\d+)[.)]\s+(.+)$/.exec(trimmed)
  if (numberedMatch) {
    return (
      <p key={blockKey} className={`pl-1 text-sm leading-7 ${bodyClass}`}>
        <span className="mr-2 font-mono text-slate-500">{numberedMatch[1]}.</span>
        {renderInlineMarkdown(numberedMatch[2], `${blockKey}-ol`)}
      </p>
    )
  }

  return (
    <p key={blockKey} className={`text-sm leading-7 ${bodyClass}`}>
      {renderInlineMarkdown(trimmed, `${blockKey}-p`)}
    </p>
  )
}
