<script setup lang="ts">
// The printable timetable sheet. Used by the PDF download (admin/teacher/parent views) and by the live
// preview on Timetable > Design, so what you design is exactly what gets downloaded. Plain inline
// styles and hex colours only - the PDF renderer can't read the app's theme tokens or CSS colour mixing.
const props = defineProps<{
  id?: string
  settings: TimetableSetting
  periods: Period[]
  days: string[]
  schoolName: string
  subtitle?: string
  logo?: string
  brandColor?: string | null
}>()

const DEFAULT_BRAND = '#2f5f96'
const INK = '#111827'
const generated = new Date().toLocaleDateString()

function mixWithWhite(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const channel = (shift: number) => {
    const c = (n >> shift) & 255
    return Math.round(c + (255 - c) * amount).toString(16).padStart(2, '0')
  }
  return `#${channel(16)}${channel(8)}${channel(0)}`
}

function normalizeHex(value?: string | null) {
  let color = (value || '').trim()
  if (/^#[0-9a-f]{3}$/i.test(color)) color = `#${[...color.slice(1)].map(c => c + c).join('')}`
  return /^#[0-9a-f]{6}$/i.test(color) ? color : null
}

const landscape = computed(() => props.settings.orientation !== 'PORTRAIT')
const width = computed(() => (landscape.value ? 1123 : 794))
const accent = computed(() => normalizeHex(props.settings.accentColor) || normalizeHex(props.brandColor) || DEFAULT_BRAND)
const line = computed(() => mixWithWhite(accent.value, 0.55))
const tint = computed(() => mixWithWhite(accent.value, 0.92))

const titleSize = computed(() => (landscape.value ? 40 : 30))
const cellSize = computed(() => (landscape.value ? 14 : 12))
const smallSize = computed(() => (landscape.value ? 11 : 10))

const headCell = computed(() => ({
  border: `1px solid ${line.value}`,
  padding: '12px 8px',
  textAlign: 'center' as const,
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '1px',
  color: accent.value
}))
</script>

<template>
  <div :id="id" :style="{ width: `${width}px`, background: '#ffffff', color: INK, padding: '36px 40px', boxSizing: 'border-box' }">
    <!-- Title row -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px;">
      <div style="width: 84px; height: 84px; display: flex; align-items: center; justify-content: flex-start;">
        <img v-if="settings.showLogo && logo" :src="logo" alt="" style="max-width: 84px; max-height: 84px; object-fit: contain;">
        <svg v-else-if="settings.showIcons" width="76" height="76" viewBox="0 0 64 64">
          <circle cx="32" cy="35" r="22" :fill="line" :stroke="accent" stroke-width="3" />
          <circle cx="32" cy="35" r="16" fill="#ffffff" />
          <path d="M32 35 V25 M32 35 L40 40" :stroke="accent" stroke-width="3" stroke-linecap="round" />
          <circle cx="14" cy="12" r="6" fill="#e5484d" /><circle cx="50" cy="12" r="6" fill="#e5484d" />
        </svg>
      </div>

      <div style="text-align: center; flex: 1; padding: 0 12px;">
        <div :style="{ fontSize: `${titleSize}px`, fontWeight: 800, letterSpacing: '1px', color: accent, lineHeight: 1.1 }">
          {{ settings.title || 'SCHOOL TIMETABLE' }}
        </div>
        <div style="margin-top: 8px; font-size: 14px; color: #4b5563;">
          <strong>{{ schoolName }}</strong><template v-if="subtitle"> &middot; {{ subtitle }}</template>
        </div>
      </div>

      <div style="width: 84px; height: 84px; display: flex; align-items: center; justify-content: flex-end;">
        <svg v-if="settings.showIcons" width="64" height="76" viewBox="0 0 64 76">
          <rect x="10" y="34" width="44" height="38" rx="4" :fill="accent" />
          <rect x="10" y="34" width="44" height="8" rx="2" :fill="line" />
          <rect x="16" y="6" width="7" height="34" rx="2" fill="#f4b740" transform="rotate(-8 20 23)" />
          <rect x="28" y="2" width="7" height="38" rx="2" fill="#e5484d" />
          <rect x="40" y="8" width="7" height="32" rx="2" fill="#4cb782" transform="rotate(10 43 24)" />
        </svg>
      </div>
    </div>

    <!-- Grid -->
    <table :style="{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', border: `2px solid ${line}` }">
      <thead>
        <tr>
          <th :style="{ ...headCell, width: '130px' }">TIME</th>
          <th v-for="dayName in days" :key="dayName" :style="headCell">{{ clean(dayName).toUpperCase() }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in periods" :key="p.id">
          <td :style="{ border: `1px solid ${line}`, padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle', background: tint, height: '58px' }">
            <div :style="{ fontWeight: 700, color: accent }">{{ p.name }}</div>
            <div v-if="settings.showPeriodTimes" :style="{ fontSize: `${smallSize}px`, color: '#6b7280', marginTop: '2px' }">
              {{ p.startTime }} – {{ p.endTime }}
            </div>
          </td>

          <td v-if="p.isBreak || p.isLunch" :colspan="days.length"
            :style="{ border: `1px solid ${line}`, textAlign: 'center', verticalAlign: 'middle', background: tint, color: accent, fontWeight: 700, letterSpacing: '4px' }">
            {{ p.isBreak ? 'BREAK' : 'LUNCH' }}
          </td>
          <template v-else>
            <td v-for="(_, i) in days" :key="i"
              :style="{ border: `1px solid ${line}`, padding: '8px', textAlign: 'center', verticalAlign: 'middle' }">
              <template v-if="p.subjects?.[i]">
                <div :style="{ fontWeight: 700, color: accent, fontSize: `${cellSize}px` }">{{ p.subjects[i]!.subject }}</div>
                <div v-if="settings.showTeacher && p.subjects[i]!.teacher" :style="{ fontSize: `${smallSize}px`, color: '#4b5563', marginTop: '2px' }">{{ p.subjects[i]!.teacher }}</div>
                <div v-if="settings.showRoom && p.subjects[i]!.room" :style="{ fontSize: `${smallSize}px`, color: '#6b7280' }">{{ p.subjects[i]!.room }}</div>
              </template>
            </td>
          </template>
        </tr>
      </tbody>
    </table>

    <div v-if="settings.footerNote" :style="{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#4b5563' }">
      {{ settings.footerNote }}
    </div>
    <div :style="{ marginTop: settings.footerNote ? '6px' : '16px', textAlign: 'center', fontSize: '10px', color: '#9ca3af' }">
      Generated by Skultem &middot; {{ generated }}
    </div>
  </div>
</template>
