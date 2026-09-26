// Icons: every icon the source uses, checked against the locally installed @iconify-json collections,
// and written to icons.bundle.json for nuxt.config's icon.clientBundle.
//
//   npm run icons          check only (exit 1 if an icon's collection isn't installed or its name doesn't exist)
//   npm run icons -- --write   also regenerate icons.bundle.json
//
// Why: an icon whose collection isn't installed - or that isn't in the client bundle - is fetched from a
// server / the Iconify API the first time it's shown, so it pops in late (or never, offline). With every
// collection installed as a dev dependency and every used icon listed in the bundle, they all ship
// with the app and render instantly.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(root)
const write = process.argv.includes('--write')

const installed = fs.readdirSync('node_modules/@iconify-json')
const data = {}
for (const c of installed) {
  const j = JSON.parse(fs.readFileSync(`node_modules/@iconify-json/${c}/icons.json`, 'utf8'))
  data[c] = new Set([...Object.keys(j.icons), ...Object.keys(j.aliases || {})])
}
// Longest prefix first so "streamline-plump" wins over "streamline".
const prefixes = [...installed].sort((a, b) => b.length - a.length)

// Collection names that look like icon references but aren't installed - so they'd be fetched at runtime.
const KNOWN_OTHER = /^(lucide|ph|mdi|fluent|carbon|solar|heroicons|tabler|bi|ri|ic|mi|fa|fa6|fa6-solid|fa-solid|majesticons|akar-icons|akar|iconamoon|material-symbols|material|bx|uil|line-md|line|eva|gg|octicon|simple-icons|simple|logos)$/

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.nuxt', '.output', '.data', 'dist'].includes(e.name)) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.(vue|ts|js|mjs)$/.test(e.name)) out.push(p)
  }
  return out
}

const used = new Map() // "collection:name" -> Set(files)
const unknownCollection = new Map() // as written -> Set(files)
const add = (map, key, file) => { if (!map.has(key)) map.set(key, new Set()); map.get(key).add(file) }

const STR = /(['"`])((?:i-)?[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?::|-)[a-z0-9]+(?:-[a-z0-9]+)*)\1/g
for (const file of [...walk('app'), 'nuxt.config.ts']) {
  const code = fs.readFileSync(file, 'utf8')
  for (const m of code.matchAll(STR)) {
    const s = m[2]
    if (s.includes(':')) {
      const [c, n] = s.split(':')
      if (data[c]) add(used, `${c}:${n}`, file)
      else if (KNOWN_OTHER.test(c)) add(unknownCollection, s, file)
    } else if (s.startsWith('i-')) {
      const rest = s.slice(2)
      const c = prefixes.find(p => rest.startsWith(p + '-'))
      if (c) add(used, `${c}:${rest.slice(c.length + 1)}`, file)
      else if (KNOWN_OTHER.test(rest.split('-')[0])) add(unknownCollection, s, file)
    }
  }
}

const missingNames = [...used.keys()].filter((k) => {
  const [c, n] = k.split(':')
  return !data[c].has(n)
})

console.log(`${used.size} distinct icons used across ${Object.keys(data).length} installed collections`)
if (unknownCollection.size) {
  console.log('\nCollection NOT installed (fetched at runtime) - `npm i -D @iconify-json/<collection>`:')
  for (const [k, f] of unknownCollection) console.log('  ', k, '<-', [...f][0])
}
if (missingNames.length) {
  console.log('\nName does NOT exist in its collection (renamed/removed upstream?):')
  for (const k of missingNames) console.log('  ', k, '<-', [...used.get(k)].slice(0, 2).join(', '))
}

if (write) {
  const list = [...used.keys()].filter(k => !missingNames.includes(k)).sort()
  fs.writeFileSync('icons.bundle.json', JSON.stringify(list, null, 2) + '\n')
  console.log(`\nwrote icons.bundle.json (${list.length} icons)`)
}

if (unknownCollection.size || missingNames.length) process.exit(1)
console.log('\nAll icons resolve locally.')
