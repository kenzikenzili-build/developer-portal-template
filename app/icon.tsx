import { ImageResponse } from 'next/og'

import { siteConfig } from '@/config/site'

export const dynamic = 'force-static'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          borderRadius: 7,
          color: '#FFFFFF',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '-0.06em',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {siteConfig.monogram}
      </div>
    ),
    {
      ...size,
    },
  )
}
