'use client'

import dynamic from 'next/dynamic'

const CustomCursor = dynamic(
  () => import('@/components/CustomCursor').then((mod) => mod.CustomCursor),
  { ssr: false },
)

export function CustomCursorMount() {
  return <CustomCursor />
}
