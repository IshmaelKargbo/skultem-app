<template>
  <div class="flex flex-col items-center gap-1">
    <!-- Draft: type the grade (BECE 1-7, WASSCE A1-F9) or the score; Enter / arrows move like a spreadsheet. -->
    <template v-if="!confirmed">
      <UInput :model-value="draft.scores[subjectId] ?? ''" size="md" :placeholder="byGrades ? 'Grade' : 'Score'"
        :inputmode="byGrades && !numericGrades ? 'text' : 'decimal'" autocomplete="off"
        :maxlength="byGrades ? 3 : 5" :color="state.tone === 'error' ? 'error' : 'neutral'"
        :highlight="state.tone === 'error'" variant="outline"
        :ui="{ base: 'w-16 text-center font-semibold uppercase tabular-nums' }"
        :data-result-cell="subjectId" :aria-label="`${subjectName} ${byGrades ? 'grade' : 'score'} for ${candidateName}`"
        :aria-invalid="state.tone === 'error'"
        @update:model-value="onInput" @keydown="onKey" @focus="($event.target as HTMLInputElement).select()" />
      <span class="min-h-5 rounded-full px-2 py-0.5 text-[11px] font-medium leading-4" :class="chipClass">
        {{ state.label }}
      </span>
    </template>

    <!-- Confirmed: the result as it prints. -->
    <template v-else>
      <span v-if="!result" class="text-xs text-dimmed" title="Not taken">—</span>
      <span v-else-if="result.grade === 'ABS'" class="rounded-full bg-elevated px-2 py-0.5 text-xs text-muted">Absent</span>
      <template v-else>
        <span class="text-base font-semibold tabular-nums" :class="toneText(toneFor(result?.points ?? null))">
          {{ result?.grade ?? '-' }}
        </span>
        <span class="text-[11px] text-muted">
          {{ byGrades ? (result?.points != null ? `${result.points} pts` : '') : result?.score }}
        </span>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
// One subject's result for one candidate. While the results are a draft: a small box to type the grade (or score)
// with what it means shown under it, coloured by how good it is. Once confirmed: the result as it prints.
// draft is the candidate's row being edited (shared with the page; '' = not sat).
const props = defineProps<{
  draft: { scores: Record<string, string> }
  subjectId: string
  subjectName: string
  candidateName: string
  confirmed: boolean
  byGrades: boolean
  scale: ExamGrade[]
  result?: ExamSubjectResult
}>()

type Tone = 'good' | 'fair' | 'poor' | 'error' | 'empty'

// Grades like BECE's 1-7 are numbers, so phones get the number keypad.
const numericGrades = computed(() => props.scale.every(g => /^\d+$/.test(g.grade)))
const points = computed(() => props.scale.map(g => g.points))
const best = computed(() => Math.min(...points.value))
const worst = computed(() => Math.max(...points.value))

// Best third green, the worst grade red, the rest amber.
function toneFor(p: number | null): Tone {
  if (p == null) return 'empty'
  if (p >= worst.value) return 'poor'
  const span = Math.max(worst.value - best.value, 1)
  return (p - best.value) / span <= 0.34 ? 'good' : 'fair'
}

const state = computed<{ tone: Tone, label: string }>(() => {
  const raw = String(props.draft.scores[props.subjectId] ?? '').trim()
  // With grades, empty means the candidate doesn't take the subject (left off their result); ABS means absent.
  if (!raw) return { tone: 'empty', label: props.byGrades ? 'Not taken' : 'Not sat' }
  if (props.byGrades && raw.toUpperCase() === 'ABS') return { tone: 'poor', label: 'Absent' }
  if (props.byGrades) {
    const band = props.scale.find(g => g.grade.toLowerCase() === raw.toLowerCase())
    if (!band) return { tone: 'error', label: `Use ${props.scale.map(g => g.grade).join(', ')} or ABS` }
    return { tone: toneFor(band.points), label: `${band.remark || band.grade} · ${band.points} pts` }
  }
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0 || n > 100) return { tone: 'error', label: '0 to 100' }
  const band = props.scale.find(g => Math.round(n) >= g.minScore && Math.round(n) <= g.maxScore)
  return band ? { tone: toneFor(band.points), label: `Grade ${band.grade}` } : { tone: 'fair', label: '' }
})

const chipClass = computed(() => ({
  good: 'bg-success/10 text-success',
  fair: 'bg-warning/10 text-warning',
  poor: 'bg-error/10 text-error',
  error: 'bg-error/10 text-error',
  empty: 'text-dimmed'
})[state.value.tone])

function toneText(t: Tone) {
  return ({ good: 'text-success', fair: 'text-warning', poor: 'text-error', error: 'text-error', empty: 'text-highlighted' })[t]
}

function onInput(value: string | number | null | undefined) {
  let v = String(value ?? '').trim()
  // A known grade typed in any case is stored as the exam writes it ("b3" -> "B3").
  if (props.byGrades) {
    const band = props.scale.find(g => g.grade.toLowerCase() === v.toLowerCase())
    if (band) v = band.grade
    else if (v.toUpperCase() === 'ABS') v = 'ABS'
  }
  props.draft.scores[props.subjectId] = v
}

// Enter / Down: the next candidate's same subject; Up: the previous one (Tab still goes across subjects).
function onKey(e: KeyboardEvent) {
  if (!['Enter', 'ArrowDown', 'ArrowUp'].includes(e.key)) return
  const cells = Array.from(document.querySelectorAll<HTMLInputElement>(`input[data-result-cell="${props.subjectId}"]`))
    .filter(el => el.offsetParent !== null)
  const i = cells.indexOf(e.target as HTMLInputElement)
  const next = cells[e.key === 'ArrowUp' ? i - 1 : i + 1]
  if (next) {
    e.preventDefault()
    next.focus()
  }
}
</script>
