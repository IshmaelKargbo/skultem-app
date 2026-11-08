<!-- The exam timetable as it downloads: one page per class (for notice boards and to send home), or the whole
     timetable on one document. Styled inline so the PDF capture keeps it exactly as previewed; each page is a
     .exam-pdf-page so it lands on its own PDF page. Designed on Exam Office > Timetable > Design. -->
<template>
  <div :style="{ width: `${pageWidth}px`, background: '#ffffff', color: '#111827', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' }">
    <section v-for="page in pages" :key="page.key" class="exam-pdf-page"
      :style="{ width: `${pageWidth}px`, padding: '36px 40px', boxSizing: 'border-box', background: '#ffffff' }">
      <!-- Header -->
      <div :style="{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: `3px solid ${accent}`, paddingBottom: '14px', marginBottom: '16px' }">
        <img v-if="design.showLogo && logo" :src="logo" alt="" :style="{ width: '64px', height: '64px', objectFit: 'contain' }">
        <div :style="{ flex: 1, textAlign: 'center' }">
          <div :style="{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }">{{ schoolName }}</div>
          <div :style="{ fontSize: '15px', fontWeight: 800, color: accent, letterSpacing: '2px', marginTop: '4px' }">{{ design.heading }}</div>
          <div :style="{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }">{{ timetable.title }}</div>
          <div :style="{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }">
            {{ timetable.termName }}<template v-if="period"> · {{ period }}</template>
          </div>
        </div>
        <div v-if="design.showLogo && logo" :style="{ width: '64px' }" />
      </div>

      <div v-if="page.className" :style="{ display: 'inline-block', background: accent, color: '#ffffff', fontWeight: 700, fontSize: '13px', lineHeight: '18px', padding: '4px 14px 6px', borderRadius: '999px', marginBottom: '12px' }">
        Class: {{ page.className }}
      </div>

      <!-- Papers -->
      <table :style="{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }">
        <thead>
          <tr>
            <th v-for="h in headers(page)" :key="h" :style="th">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="day in page.days" :key="day.date">
            <tr v-for="(p, i) in day.papers" :key="p.id">
              <td v-if="i === 0" :rowspan="day.papers.length" :style="{ ...td, fontWeight: 700, background: tint, verticalAlign: 'top', width: '120px' }">
                {{ shortDay(day.date) }}
              </td>
              <td :style="{ ...td, whiteSpace: 'nowrap' }">
                {{ examTime(p.startTime) }} – {{ examTime(p.endTime) }}
                <div v-if="design.showDuration" :style="{ fontSize: '10px', color: '#6b7280' }">{{ examDuration(p.startTime, p.endTime) }}</div>
              </td>
              <td :style="{ ...td, fontWeight: 600 }">
                {{ p.subjectName }}
                <div v-if="p.paper" :style="{ fontSize: '10px', color: '#6b7280', fontWeight: 400 }">{{ p.paper }}</div>
              </td>
              <td v-if="!page.className" :style="td">{{ p.classes.map(c => c.name).join(', ') }}</td>
              <td v-if="design.showVenue" :style="td">{{ p.venue ?? '' }}</td>
              <td v-if="design.showInvigilators && !page.className" :style="td">{{ p.invigilators.map(x => x.name).join(', ') }}</td>
            </tr>
          </template>
          <tr v-if="!page.days.length">
            <td :colspan="headers(page).length" :style="{ ...td, textAlign: 'center', color: '#6b7280', padding: '24px' }">No papers yet.</td>
          </tr>
        </tbody>
      </table>

      <!-- Instructions -->
      <div v-if="design.showInstructions && instructionLines.length" :style="{ marginTop: '16px', border: `1px solid ${line}`, borderRadius: '8px', padding: '10px 14px', background: tint }">
        <div :style="{ fontSize: '11px', fontWeight: 800, color: accent, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }">Instructions to candidates</div>
        <ol :style="{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', lineHeight: 1.6 }">
          <li v-for="(l, i) in instructionLines" :key="i">{{ l }}</li>
        </ol>
      </div>

      <div v-if="design.footerNote" :style="{ marginTop: '12px', fontSize: '11px', color: '#374151', textAlign: 'center', fontStyle: 'italic' }">
        {{ design.footerNote }}
      </div>

      <!-- Signatures -->
      <div v-if="design.showSignatures" :style="{ display: 'flex', justifyContent: 'space-between', marginTop: '44px', fontSize: '12px' }">
        <div :style="{ textAlign: 'center', minWidth: '180px' }">
          <div :style="{ borderTop: '1px solid #111827', paddingTop: '4px' }">{{ design.leftSignature }}</div>
        </div>
        <div :style="{ textAlign: 'center', minWidth: '180px' }">
          <div :style="{ borderTop: '1px solid #111827', paddingTop: '4px' }">{{ design.rightSignature }}</div>
        </div>
      </div>

      <div :style="{ marginTop: '18px', fontSize: '9px', color: '#9ca3af', textAlign: 'center' }">Generated by Skultem · {{ today }}</div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { timetable, design, mode = 'classes', classIds = [], schoolName, logo = '', brandColor = null } = defineProps<{
  timetable: ExamTimetable
  design: ExamTimetableDesign
  // classes: a page per class; full: the whole timetable on one document
  mode?: 'classes' | 'full'
  // classes mode: which classes get a page (empty = every class with a paper)
  classIds?: string[]
  schoolName: string
  logo?: string
  brandColor?: string | null
}>()

const accent = computed(() => {
  const ok = (c?: string | null) => !!c && /^#[0-9a-f]{6}$/i.test(c)
  return ok(design.accentColor) ? design.accentColor! : ok(brandColor) ? brandColor! : '#1878c5'
})
// Light versions of the accent for the day column and boxes.
const tint = computed(() => `${accent.value}12`)
const line = computed(() => `${accent.value}55`)
const th = computed(() => ({
  background: accent.value, color: '#ffffff', textAlign: 'left' as const, padding: '7px 8px', fontSize: '11px',
  fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.5px', border: `1px solid ${accent.value}`,
}))
const td = computed(() => ({ border: `1px solid ${line.value}`, padding: '6px 8px', verticalAlign: 'top' as const }))

const pageWidth = computed(() => (design.orientation === 'LANDSCAPE' ? 1123 : 794))
const period = computed(() => timetable.startDate && timetable.endDate
  ? `${formatDate(timetable.startDate)} – ${formatDate(timetable.endDate)}`
  : '')
const instructionLines = computed(() => (timetable.instructions ?? '').split('\n').map(l => l.trim()).filter(Boolean))
const today = new Date().toLocaleDateString()

type Page = { key: string, className: string | null, days: ReturnType<typeof groupPapersByDay> }

const pages = computed<Page[]>(() => {
  if (mode === 'full') {
    return [{ key: 'full', className: null, days: groupPapersByDay(timetable.papers) }]
  }
  const wanted = classIds.length ? classIds : timetable.classes.map(c => c.id)
  return timetable.classes
    .filter(c => wanted.includes(c.id))
    .map(c => ({
      key: c.id,
      className: c.name,
      days: groupPapersByDay(timetable.papers.filter(p => p.classes.some(pc => pc.id === c.id))),
    }))
    .filter(p => p.days.length || classIds.length)
})

function headers(page: Page) {
  return [
    'Day', 'Time', 'Subject',
    ...(page.className ? [] : ['Classes']),
    ...(design.showVenue ? ['Venue'] : []),
    ...(design.showInvigilators && !page.className ? ['Invigilators'] : []),
  ]
}

function shortDay(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })
}
</script>
