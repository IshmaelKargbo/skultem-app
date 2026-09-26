<template>
  <UCard v-if="states.length">
    <template #header>
      <div>
        <h3 class="text-sm font-semibold">{{ title }}</h3>
        <p class="text-xs text-muted">
          Built from the classwork (CA) and formal test marks recorded so far - so the help can start before the exam, not after.
        </p>
      </div>
    </template>

    <!-- Where each continuous-assessment test is: still being recorded, saved and waiting for approval, or approved. -->
    <div class="mb-4 space-y-1.5 rounded-xl border border-default bg-elevated/30 p-3">
      <p class="text-xs font-semibold uppercase tracking-wide text-muted">Where each assessment is</p>
      <div v-for="st in states" :key="st.key" class="flex items-center justify-between gap-2 text-sm">
        <span class="min-w-0 truncate text-highlighted">{{ st.subject }} · {{ st.assessment }}</span>
        <UBadge size="sm" variant="subtle" :color="st.color" class="shrink-0">{{ st.label }}</UBadge>
      </div>
      <p class="pt-1 text-[11px] text-muted">
        Tips below use the marks saved so far. Anything still awaiting approval is provisional and can change.
      </p>
    </div>

    <ul v-if="items.length" class="space-y-3">
      <li v-for="item in items" :key="item.key" class="flex items-start gap-3">
        <div class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full"
          :class="item.tone === 'good' ? 'bg-success/10 text-success' : item.tone === 'help' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'">
          <UIcon :name="item.icon" class="size-4" />
        </div>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-sm font-medium text-highlighted">{{ item.subject }} · {{ item.assessment }}</p>
            <UBadge v-if="item.progress" size="sm" variant="subtle" :color="item.finished ? 'success' : 'warning'">
              {{ item.progress }}
            </UBadge>
          </div>
          <p class="text-xs text-muted">{{ item.text }}</p>
        </div>
      </li>
    </ul>
    <p v-else class="text-xs text-muted">
      No tips yet - they appear as classwork and test marks are saved.
    </p>
  </UCard>
</template>

<script setup lang="ts">
// Plain-language help for a parent (or the student) from the continuous-assessment marks in the grades already
// loaded on the page. It follows how far the assessment has got: with a mark or two in it says so and waits, while
// the weeks are still coming in it speaks of "so far" and of time to turn things around, once the classwork is
// finished it points to the formal test, and only when the grades are released does it talk about the final result.
// Pure arithmetic - no AI.
const props = defineProps<{ studentName?: string }>()
const store = useReportStore()
const { grades } = storeToRefs(store)

type Item = {
  key: string, subject: string, assessment: string, tone: 'good' | 'help' | 'info', icon: string, text: string,
  progress: string, finished: boolean
}

const who = computed(() => props.studentName || 'Your child')
const title = computed(() => props.studentName ? `How to support ${props.studentName}` : 'How to help at home')

const RELEASED = ['APPROVED', 'COMPLETED', 'LOCKED']

// The state of every continuous-assessment test, whether or not there is advice to give about it yet.
const states = computed(() => {
  const out: { key: string, subject: string, assessment: string, label: string, color: 'success' | 'warning' | 'error' | 'info' | 'neutral' }[] = []
  for (const g of (grades.value || []) as any[]) {
    const c: ContinuousBreakdown | null | undefined = g.continuous
    if (!c || c.structure !== 'CA_AND_TEST') continue
    const recorded = (c.caEntryScores ?? []).filter(v => v !== null && v !== undefined).length
    const unit = CA_UNITS[c.caFrequency].plural
    let label = '', color: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'neutral'
    if (RELEASED.includes(g.status)) { label = 'Approved'; color = 'success' }
    else if (g.status === 'SUBMITTED') { label = 'Saved · awaiting approval'; color = 'info' }
    else if (g.status === 'RETURNED') { label = 'Returned for correction'; color = 'error' }
    else if (recorded >= c.caEntries) { label = 'Classwork done · formal test next'; color = 'warning' }
    else { label = `Recording · ${recorded} of ${c.caEntries} ${unit}`; color = 'warning' }
    out.push({ key: g.id, subject: g.subject, assessment: g.name, label, color })
  }
  return out
})

const items = computed<Item[]>(() => {
  const out: Item[] = []
  for (const g of (grades.value || []) as any[]) {
    const c: ContinuousBreakdown | null | undefined = g.continuous
    if (!c || c.structure !== 'CA_AND_TEST') continue

    const marks = (c.caEntryScores ?? []).filter(v => v !== null && v !== undefined)
    const recorded = marks.length
    const expected = c.caEntries
    if (recorded === 0 && (c.formalScore === null || c.formalScore === undefined)) continue // nothing to say yet

    const finished = RELEASED.includes(g.status)          // grades released - this is the result
    const caDone = recorded >= expected                   // every classwork week is in
    const unit = CA_UNITS[c.caFrequency].plural
    const awaiting = g.status === 'SUBMITTED'
    const progress = finished ? 'Final' : awaiting ? 'Awaiting approval' : caDone ? 'Classwork complete' : `${recorded} of ${expected} ${unit} recorded`
    const left = expected - recorded

    const { trend } = caTrendOf(c.caEntryScores)
    const ca = c.caScore, ft = c.formalScore
    const formalIn = ft !== null && ft !== undefined
    const base = { key: g.id, subject: g.subject, assessment: g.name, progress, finished }
    const push = (tone: Item['tone'], icon: string, text: string) => out.push({ ...base, key: `${g.id}-${out.length}`, tone, icon, text })

    // One or two marks are not a picture yet - say so instead of reading too much into them.
    if (recorded < 2 && !caDone && !finished) {
      push('info', 'lucide:hourglass',
        `The first classwork mark for ${g.subject} is in. ${left} more ${left === 1 ? 'is' : 'are'} still to come, so it is too early to tell - tips appear as more marks are recorded.`)
      continue
    }

    if (ca !== null && ca !== undefined && ca < 50) {
      push('help', 'lucide:life-buoy', finished
        ? `${who.value}'s classwork average finished at ${ca}%. Regular help with homework and class notes in ${g.subject} would make a real difference next time.`
        : awaiting
          ? `${who.value}'s classwork finished at ${ca}%, which is low (marks are saved and waiting for approval). Regular help with homework and class notes in ${g.subject} would make a real difference.`
          : caDone
          ? `${who.value}'s classwork is complete at ${ca}%, which is low. The formal test is next - go back over the ${g.subject} topics together so it goes better.`
          : `${who.value}'s classwork average so far is ${ca}%. There ${left === 1 ? 'is' : 'are'} still ${left} ${left === 1 ? CA_UNITS[c.caFrequency].singular.toLowerCase() : unit} to go, so there is time to turn it around - a little regular help with ${g.subject} homework would make a difference.`)
    } else if (trend === 'declining') {
      push('help', 'lucide:trending-down', finished
        ? `Classwork marks in ${g.subject} dipped over the weeks. Ask ${who.value} what changed - a missed topic, or homework slipping - and check in with the teacher.`
        : `Classwork marks in ${g.subject} have dipped so far. Ask ${who.value} what changed - a missed topic, or homework slipping - while ${caDone && !formalIn ? 'the formal test is still ahead' : caDone ? 'these marks are being approved' : 'there are still weeks left to recover'}.`)
    } else if (trend === 'improving') {
      push('good', 'lucide:trending-up', finished
        ? `Classwork in ${g.subject} improved week by week. Worth praising - the effort paid off.`
        : `Classwork in ${g.subject} is improving week by week so far. Worth praising - keep the routine going${caDone && !formalIn ? ' into the formal test' : ''}.`)
    } else if (ca !== null && ca !== undefined && caDone && !finished && (ft === null || ft === undefined)) {
      push('info', 'lucide:notebook-pen',
        `Classwork in ${g.subject} is complete (${ca}%). The formal test is next - revising the topics covered will help ${who.value} finish strongly.`)
    }

    // The formal test only says something once it is in.
    if (ca !== null && ca !== undefined && ft !== null && ft !== undefined) {
      if (ca - ft >= 20) {
        push('info', 'lucide:timer',
          `${who.value} does well in classwork (${ca}%) but the formal test was lower (${ft}%). Practise timed, exam-style questions at home to build test confidence.`)
      } else if (ft - ca >= 20) {
        push('info', 'lucide:notebook-pen',
          `The formal test (${ft}%) was stronger than classwork (${ca}%). ${who.value} understands the work - steady daily practice and finished homework will lift the classwork marks.`)
      }
    }
  }
  return out
})
</script>
