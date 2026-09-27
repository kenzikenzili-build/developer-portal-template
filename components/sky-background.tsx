'use client'

import { useEffect, useRef } from 'react'

/** Mixkit: gentle blue sky with soft white clouds (Option B family). */
const CALM_SKY_CDN = 'https://assets.mixkit.co/videos/3138/3138-720.mp4'

/**
 * Bright, slow daytime sky loop — calm playback + lifted brightness.
 */
export function SkyBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    try {
      el.playbackRate = 0.4
    } catch {
      // Mobile Safari / battery saver may reject playbackRate adjustments
    }
  }, [])

  return (
    <>
      <video
        ref={videoRef}
        className="pointer-events-none fixed inset-0 -z-20 h-full w-full object-cover brightness-110 contrast-95 saturate-110"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/videos/daylight-clouds-poster.jpg"
      >
        <source src={CALM_SKY_CDN} type="video/mp4" />
        <source src="/videos/daylight-clouds.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-white/30 backdrop-blur-[1px] transition-colors duration-300 dark:bg-slate-950/55" />
    </>
  )
}

