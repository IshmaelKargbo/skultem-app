<template>
  <!-- What a class master / admin should look at first, worked out from data already on the page. -->
  <div v-if="ready" class="grid gap-4 lg:grid-cols-2">
    <!-- Needs attention -->
    <section class="rounded-2xl border border-default bg-default p-5 shadow-xs">
      <header class="mb-4 flex items-center gap-3">
        <span class="flex size-10 items-center justify-center rounded-xl"
          :class="flagged.length ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'">
          <UIcon :name="flagged.length ? 'i-lucide-alert-triangle' : 'i-lucide-circle-check'" class="size-5" />
        </span>
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold text-highlighted">Needs attention</h3>
          <p class="text-xs text-muted">
            {{ flagged.length ? `${flagged.length} student${flagged.length === 1 ? '' : 's'} flagged` : 'All clear' }}
          </p>
        </div>
      </header>
      <ul v-if="flagged.length" class="space-y-2.5">
        <li v-for="f in flagged.slice(0, 3)" :key="f.student.id">
          <button type="button" class="group flex w-full items-start gap-2.5 text-left" @click="open(f.student)">
            <span class="mt-1.5 size-2 shrink-0 rounded-full" :class="SEVERITY_DOT[f.severity]" />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-medium text-highlighted group-hover:underline">{{ name(f.student) }}</span>
              <span class="block truncate text-xs text-muted">{{ f.reason }}</span>
            </span>
          </button>
        </li>
        <li v-if="flagged.length > 3" class="pl-4.5 text-xs text-muted">+{{ flagged.length - 3 }} more in the list below</li>
      </ul>
      <p v-else class="text-sm text-muted">Nobody is flagged right now. Attendance and marks look healthy.</p>
    </section>

    <!-- Attendance overview -->
    <section class="rounded-2xl border border-default bg-default p-5 shadow-xs">
      <header class="mb-4 flex items-center gap-3">
        <span class="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info">
          <UIcon name="i-lucide-calendar-check" class="size-5" />
        </span>
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold text-highlighted">Attendance overview</h3>
          <p class="text-xs text-muted">Line is {{ threshold }}%</p>
        </div>
      </header>
      <template v-if="attendanceCount">
        <div class="flex items-center gap-4">
          <!-- Ring: progress = the students at or above the line, on a light gray track -->
          <div class="relative size-20 shrink-0">
            <svg viewBox="0 0 36 36" class="size-20 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke-width="3.5"
                class="stroke-neutral-200 dark:stroke-neutral-700" />
              <circle v-if="ringShare > 0" cx="18" cy="18" r="15.5" fill="none" stroke-width="3.5" stroke-linecap="round"
                :class="lowAttendance.length ? 'stroke-warning' : 'stroke-success'"
                :stroke-dasharray="`${ringShare} 100`" pathLength="100" />
            </svg>
            <span class="absolute inset-0 flex flex-col items-center justify-center leading-tight">
              <span class="text-sm font-semibold text-highlighted">{{ attendanceCount - lowAttendance.length }}/{{ attendanceCount }}</span>
              <span class="text-[10px] text-muted">on track</span>
            </span>
          </div>
          <div class="min-w-0 flex-1 text-sm">
            <p class="font-medium text-highlighted">
              {{ lowAttendance.length }} of {{ attendanceCount }} below {{ threshold }}%
            </p>
            <p v-if="!lowAttendance.length" class="text-xs text-muted">Everyone is above the line.</p>
            <ul v-else class="mt-1 space-y-0.5">
              <li v-for="s in lowAttendance.slice(0, 3)" :key="s.student.id" class="flex items-center justify-between gap-2 text-xs">
                <button type="button" class="truncate text-left hover:underline" @click="open(s.student)">{{ name(s.student) }}</button>
                <span class="shrink-0 font-medium text-warning">{{ s.rate }}%</span>
              </li>
            </ul>
          </div>
        </div>
        <p v-if="streaks.length" class="mt-3 flex items-start gap-1.5 rounded-lg bg-error/5 p-2 text-xs text-muted">
          <UIcon name="i-lucide-clock-alert" class="mt-0.5 size-3.5 shrink-0 text-error" />
          <span>{{ streaks.length }} absent 3+ days in a row:
            {{ streaks.slice(0, 2).map(s => `${name(s.student)} (${s.days})`).join(', ') }}{{ streaks.length > 2 ? '...' : '' }}</span>
        </p>
      </template>
      <p v-else class="text-sm text-muted">No attendance recorded yet.</p>
    </section>

    <!-- Academic performance -->
    <section class="rounded-2xl border border-default bg-default p-5 shadow-xs md:col-span-2">
      <header class="mb-4 flex items-center gap-3">
        <span class="flex size-10 items-center justify-center rounded-xl bg-success/10 text-success">
          <UIcon name="i-lucide-trending-up" class="size-5" />
        </span>
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold text-highlighted">Academic performance</h3>
          <p class="text-xs text-muted">
            <template v-if="ranked.length">Class average {{ classAverage }}% · {{ ranked.length }} of {{ students.length }} students scored on approved tests</template>
            <template v-else>Approved tests</template>
          </p>
        </div>
      </header>
      <template v-if="ranked.length">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p class="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">Top students</p>
            <ol class="space-y-1.5">
              <li v-for="(s, i) in topStudents" :key="s.student.id" class="flex items-center gap-2 text-sm">
                <span class="w-5 text-xs text-muted">{{ i + 1 }}</span>
                <button type="button" class="min-w-0 flex-1 truncate text-left hover:underline" @click="open(s.student)">{{ name(s.student) }}</button>
                <span class="shrink-0 font-semibold text-success">{{ s.score }}%</span>
              </li>
            </ol>
          </div>
          <div v-if="needSupport.length">
            <p class="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">Needs support</p>
            <ol class="space-y-1.5">
              <li v-for="s in needSupport" :key="s.student.id" class="flex items-center gap-2 text-sm">
                <span class="w-5 text-xs text-muted">{{ s.position }}</span>
                <button type="button" class="min-w-0 flex-1 truncate text-left hover:underline" @click="open(s.student)">{{ name(s.student) }}</button>
                <span class="shrink-0 font-semibold" :class="s.score < passMark ? 'text-error' : 'text-warning'">{{ s.score }}%</span>
              </li>
            </ol>
          </div>
        </div>
        <p v-if="declining || improving" class="mt-3 text-xs text-muted">
          <template v-if="declining">{{ declining }} slipping vs last term</template>
          <template v-if="declining && improving"> · </template>
          <template v-if="improving">{{ improving }} improving</template>
        </p>
      </template>
      <p v-else class="text-sm text-muted">No approved scores yet.</p>

      <footer v-if="subjects.length > 1" class="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-default pt-3 text-xs text-muted">
        <span>Strongest subject: <span class="font-medium text-highlighted">{{ subjects[0]!.name }}</span> ({{ subjects[0]!.score }}%)</span>
        <span>Weakest subject: <span class="font-medium text-highlighted">{{ subjects[subjects.length - 1]!.name }}</span> ({{ subjects[subjects.length - 1]!.score }}%)</span>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  students: Student[]
  attention: Record<string, StudentAttention>
  attendanceById: Record<string, number>
  // studentId -> average of approved scores this term.
  performanceById: Record<string, number>
  subjectScores: { name: string, score: number }[]
  // Attendance below this is flagged (the school's or section's line, from the attention check).
  threshold?: number
  // The class's pass mark - averages under it are shown as failing.
  passMark?: number
  classId: string
}>()

const threshold = computed(() => Math.round(props.threshold ?? 75))
const passMark = computed(() => props.passMark ?? 50)
const SEVERITY_DOT = { CRITICAL: 'bg-error', NEEDS_ATTENTION: 'bg-warning', WATCH: 'bg-neutral' } as const
const RANK = { CRITICAL: 0, NEEDS_ATTENTION: 1, WATCH: 2 } as const

const name = (s: Student) => `${s.givenNames} ${s.familyName}`.trim()
const open = (s: Student) => navigateTo(`/students/${s.id}?back=/classes/${props.classId}`)

const ready = computed(() => props.students.length > 0)
// How full the attendance ring is: the share of students at or above the line.
const ringShare = computed(() => attendanceCount.value ? Math.round((attendanceCount.value - lowAttendance.value.length) / attendanceCount.value * 100) : 0)

const flagged = computed(() => props.students
  .map(student => ({ student, a: props.attention[student.id] }))
  .filter((x): x is { student: Student, a: StudentAttention } => !!x.a)
  .sort((x, y) => RANK[x.a.severity] - RANK[y.a.severity])
  .map(({ student, a }) => {
    const parts: string[] = []
    if (a.attendanceFlag) parts.push(a.attendanceRate != null ? `attendance ${a.attendanceRate}%` : 'attendance')
    if (a.academicFlag) parts.push(a.academicAverage != null ? `average ${a.academicAverage}%` : 'average')
    if (a.absenceStreak >= 3) parts.push(`${a.absenceStreak} absences in a row`)
    return { student, severity: a.severity, reason: parts.join(' · ') || 'Worth a look' }
  }))

const withAttendance = computed(() => props.students
  .map(student => ({ student, rate: props.attendanceById[student.id] }))
  .filter((x): x is { student: Student, rate: number } => x.rate !== undefined))
const attendanceCount = computed(() => withAttendance.value.length)
const lowAttendance = computed(() => withAttendance.value.filter(x => x.rate < threshold.value)
  .sort((a, b) => a.rate - b.rate))
const streaks = computed(() => props.students
  .map(student => ({ student, days: props.attention[student.id]?.absenceStreak ?? 0 }))
  .filter(x => x.days >= 3)
  .sort((a, b) => b.days - a.days))

const ranked = computed(() => props.students
  .map(student => ({ student, score: props.performanceById[student.id] }))
  .filter((x): x is { student: Student, score: number } => x.score !== undefined)
  .map(x => ({ ...x, score: Math.round(x.score) }))
  .sort((a, b) => b.score - a.score))

const classAverage = computed(() => ranked.value.length
  ? Math.round(ranked.value.reduce((sum, x) => sum + x.score, 0) / ranked.value.length) : 0)

const topStudents = computed(() => ranked.value.slice(0, 3))

// The bottom of the class, shown with their real position (e.g. 5 of 5), never overlapping the top list,
// and only those below the class average - nobody is "needing support" for being the lowest of a strong class.
const needSupport = computed(() => ranked.value
  .map((x, i) => ({ ...x, position: i + 1 }))
  .slice(3)
  .filter(x => x.score < classAverage.value)
  .reverse()
  .slice(0, 3))

const declining = computed(() => Object.values(props.attention).filter(a => a.academicTrend === 'DECLINING').length)
const improving = computed(() => Object.values(props.attention).filter(a => a.academicTrend === 'IMPROVING').length)

const subjects = computed(() => [...props.subjectScores]
  .map(s => ({ name: s.name, score: Math.round(s.score) }))
  .sort((a, b) => b.score - a.score))
</script>
