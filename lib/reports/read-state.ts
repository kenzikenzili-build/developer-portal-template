export function isReportMarkedRead(id: string, readIds: Set<string>): boolean {
  return readIds.has(id)
}

export function markReportRead(id: string, readIds: Set<string>): Set<string> {
  if (!id) return readIds
  const next = new Set(readIds)
  next.add(id)
  return next
}

export function markReportUnread(id: string, readIds: Set<string>): Set<string> {
  if (!id) return readIds
  const next = new Set(readIds)
  next.delete(id)
  return next
}

export function toggleReportRead(id: string, readIds: Set<string>): Set<string> {
  if (readIds.has(id)) return markReportUnread(id, readIds)
  return markReportRead(id, readIds)
}
