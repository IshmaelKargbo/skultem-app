import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const splashScreens = [
  [640, 1136],
  [750, 1334],
  [828, 1792],
  [1125, 2436],
  [1170, 2532],
  [1179, 2556],
  [1242, 2208],
  [1242, 2688],
  [1284, 2778],
  [1290, 2796],
  [1536, 2048],
  [1620, 2160],
  [1668, 2224],
  [1668, 2388],
  [2048, 2732]
]

// One palette per color scheme - iOS 16.4+ picks between them via the `prefers-color-scheme`
// clause on each <link rel="apple-touch-startup-image"> (see nuxt.config.ts). Dark values mirror
// the app's real dark theme (assets/css/main.css: --app-bg: #0f121f, --app-card: #111827).
const themes = {
  light: {
    pageBackground: `
        radial-gradient(circle at 18% 20%, rgba(94, 167, 255, 0.18), transparent 24%),
        radial-gradient(circle at 82% 78%, rgba(29, 158, 117, 0.16), transparent 22%),
        linear-gradient(145deg, #f7fbff 0%, #edf3fb 48%, #f5f7fb 100%)`,
    textColor: '#081225',
    auroraLeft: 'rgba(94, 167, 255, 0.24)',
    auroraRight: 'rgba(29, 158, 117, 0.2)',
    gridLine: 'rgba(16, 33, 63, 0.035)',
    badgeBackground: 'linear-gradient(145deg, #0d1b34, #16335f)',
    badgeBorder: 'none',
    badgeShadow: 'rgba(8, 18, 37, 0.18)'
  },
  dark: {
    pageBackground: `
        radial-gradient(circle at 18% 20%, rgba(94, 167, 255, 0.16), transparent 24%),
        radial-gradient(circle at 82% 78%, rgba(64, 199, 186, 0.14), transparent 22%),
        linear-gradient(145deg, #0f121f 0%, #0b0e18 48%, #0a0c15 100%)`,
    textColor: '#e5e7eb',
    auroraLeft: 'rgba(94, 167, 255, 0.22)',
    auroraRight: 'rgba(64, 199, 186, 0.18)',
    gridLine: 'rgba(255, 255, 255, 0.04)',
    badgeBackground: 'linear-gradient(145deg, #16335f, #1e4a85)',
    badgeBorder: '1px solid rgba(255, 255, 255, 0.08)',
    badgeShadow: 'rgba(0, 0, 0, 0.5)'
  }
}

const rootDir = resolve(import.meta.dirname, '..')
const outputDir = join(rootDir, 'public', 'splash')
const tempDir = join(rootDir, '.splash-render')
const chromeBin = process.env.CHROME_BIN || '/usr/bin/google-chrome'

if (!existsSync(chromeBin)) {
  throw new Error(`Chrome was not found at ${chromeBin}. Set CHROME_BIN to generate splash images.`)
}

mkdirSync(outputDir, { recursive: true })
mkdirSync(tempDir, { recursive: true })

const htmlPath = join(tempDir, 'splash.html')

function renderHtml(width, height, theme) {
  const scale = Math.min(width / 430, height / 932)
  const logoSize = Math.max(96, Math.round(132 * scale))
  const cardRadius = Math.round(32 * scale)
  const t = themes[theme]

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=${width}, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    body {
      width: ${width}px;
      height: ${height}px;
      margin: 0;
      overflow: hidden;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: ${t.pageBackground};
      color: ${t.textColor};
    }
    .aurora {
      position: absolute;
      border-radius: 9999px;
      filter: blur(${Math.round(44 * scale)}px);
      opacity: 0.55;
    }
    .aurora.left {
      width: ${Math.round(290 * scale)}px;
      height: ${Math.round(290 * scale)}px;
      top: ${Math.round(-80 * scale)}px;
      left: ${Math.round(-64 * scale)}px;
      background: ${t.auroraLeft};
    }
    .aurora.right {
      width: ${Math.round(256 * scale)}px;
      height: ${Math.round(256 * scale)}px;
      right: ${Math.round(-48 * scale)}px;
      bottom: ${Math.round(-48 * scale)}px;
      background: ${t.auroraRight};
    }
    .grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(${t.gridLine} 1px, transparent 1px),
        linear-gradient(90deg, ${t.gridLine} 1px, transparent 1px);
      background-size: ${Math.round(40 * scale)}px ${Math.round(40 * scale)}px;
      mask-image: radial-gradient(circle at center, black 38%, transparent 100%);
    }
    .shell {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .brand-mark {
      width: ${logoSize}px;
      height: ${logoSize}px;
      display: grid;
      place-items: center;
      border-radius: ${cardRadius}px;
      background: ${t.badgeBackground};
      border: ${t.badgeBorder};
      box-shadow: 0 ${Math.round(22 * scale)}px ${Math.round(42 * scale)}px ${t.badgeShadow};
    }
    .brand-mark img {
      width: 55%;
      height: 55%;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <div class="aurora left"></div>
  <div class="aurora right"></div>
  <div class="grid"></div>
  <main class="shell">
    <div class="brand-mark"><img src="../public/icon.svg" alt=""></div>
  </main>
</body>
</html>`
}

for (const theme of Object.keys(themes)) {
  for (const [width, height] of splashScreens) {
    writeFileSync(htmlPath, renderHtml(width, height, theme))

    execFileSync(chromeBin, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--user-data-dir=/tmp/skultem-splash-chrome',
      `--window-size=${width},${height}`,
      `--screenshot=${join(outputDir, `apple-splash-${width}x${height}-${theme}.png`)}`,
      `file://${htmlPath}`
    ], { stdio: 'inherit' })
  }
}

rmSync(tempDir, { recursive: true, force: true })
