import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const alt = 'پانیک | تولیدی کفش تبریز'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Default social-share card (used wherever a page has no product photo of its own).
export default async function OpengraphImage() {
  const font = await readFile(join(process.cwd(), 'src/app/fonts/Vazirmatn-Bold.ttf'))
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f3d6d2, #fbf1ee)',
          fontFamily: 'Vazirmatn',
          color: '#1d2a44',
        }}
      >
        <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: 6, display: 'flex' }}>PANIK</div>
        <div style={{ fontSize: 54, marginTop: 8, display: 'flex' }}>تولیدی کفش تبریز</div>
        <div style={{ fontSize: 34, marginTop: 28, color: '#a95562', display: 'flex' }}>زیبایی در هر قدم</div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Vazirmatn', data: font, weight: 700, style: 'normal' }] },
  )
}
