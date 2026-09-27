/**
 * Build identifier baked into the client bundle. A new deployment therefore
 * gets a new id, which lets `app/layout.tsx` detect the upgrade and purge any
 * stale Cache Storage / service-worker shell before the app boots.
 */
const buildId =
  process.env.GITHUB_SHA ||
  process.env.NEXT_PUBLIC_BUILD_ID ||
  `local-${Date.now().toString(36)}`

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Pure static export — drop the `out/` folder onto S3 + CloudFront, GitHub
   * Pages, Netlify, or any bucket. Note that `output: 'export'` disables Route
   * Handlers and middleware, which is exactly why this template ships with no
   * backend coupling: every section reads bundled mock data or a public JSON
   * endpoint you control.
   */
  output: 'export',
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
  allowedDevOrigins: ['localhost:3000'],
  images: {
    unoptimized: true,
  },
}

export default nextConfig
