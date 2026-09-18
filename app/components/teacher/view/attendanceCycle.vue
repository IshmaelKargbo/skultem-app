<script lang="ts" setup>
const { teacher, mine = false } = defineProps<{
    teacher?: Teacher | undefined
    mine?: boolean
}>()

const loading = ref(true)

const cursor = ref(startOfMonth(new Date()))
const recordsByDate = ref<Record<string, TeacherAttendanceDay>>({})

const statusStyles: Record<TeacherAttendanceStatus, { circle: string, text: string, dot: string }> = {
    PRESENT: {
        circle: 'bg-success-100 text-success-700 dark:bg-success-900/60 dark:text-success-300',
        text: 'text-success-600 dark:text-success-400',
        dot: 'bg-success-500'
    },
    ABSENT: {
        circle: 'bg-error-100 text-error-700 dark:bg-error-900/60 dark:text-error-300',
        text: 'text-error-600 dark:text-error-400',
        dot: 'bg-error-500'
    },
    LATE: {
        circle: 'bg-warning-100 text-warning-700 dark:bg-warning-900/60 dark:text-warning-300',
        text: 'text-warning-600 dark:text-warning-400',
        dot: 'bg-warning-500'
    },
    EXCUSED: {
        circle: 'bg-info-100 text-info-700 dark:bg-info-900/60 dark:text-info-300',
        text: 'text-info-600 dark:text-info-400',
        dot: 'bg-info-500'
    }
}

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, n: number) {
    return new Date(date.getFullYear(), date.getMonth() + n, 1)
}

function dateKey(date: Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

const today = new Date()
const todayKey = dateKey(today)

const monthLabel = computed(() =>
    cursor.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
)

const prevMonthLabel = computed(() =>
    addMonths(cursor.value, -1).toLocaleDateString(undefined, { month: 'short' })
)

const nextMonthLabel = computed(() =>
    addMonths(cursor.value, 1).toLocaleDateString(undefined, { month: 'short' })
)

const monthEnd = computed(() => new Date(cursor.value.getFullYear(), cursor.value.getMonth() + 1, 0))

const calendarCells = computed(() => {
    const firstWeekday = cursor.value.getDay()
    const daysInMonth = monthEnd.value.getDate()
    const cells: ({ key: string, day: number } | null)[] = []

    for (let i = 0; i < firstWeekday; i++) cells.push(null)

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(cursor.value.getFullYear(), cursor.value.getMonth(), d)
        cells.push({ key: dateKey(date), day: d })
    }

    return cells
})

const stats = computed(() => {
    const counts: Record<TeacherAttendanceStatus, number> = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 }

    for (const record of Object.values(recordsByDate.value)) {
        if (record.status && record.status in counts) counts[record.status]++
    }

    const total = counts.PRESENT + counts.ABSENT + counts.LATE + counts.EXCUSED
    const percent = total === 0 ? 0 : Math.round((counts.PRESENT / total) * 100)

    return {
        PRESENT: counts.PRESENT,
        ABSENT: counts.ABSENT,
        LATE: counts.LATE,
        EXCUSED: counts.EXCUSED,
        total,
        percent
    }
})

const tiles = computed(() =>
    TEACHER_ATTENDANCE_STATUS_OPTIONS.map(option => ({
        key: option.value,
        label: option.label,
        value: stats.value[option.value]
    }))
)

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const dashOffset = computed(() => CIRCUMFERENCE * (1 - stats.value.percent / 100))

function circleClass(key: string) {
    if (key === todayKey) return 'bg-primary-600 text-white'

    const status = recordsByDate.value[key]?.status
    return status ? statusStyles[status]?.circle : 'text-muted'
}

function recordOf(key: string) {
    return recordsByDate.value[key]
}

function statusTextClass(key: string) {
    const status = recordsByDate.value[key]?.status
    return status ? statusStyles[status]?.text : ''
}

function statusLabel(status: TeacherAttendanceStatus) {
    return TEACHER_ATTENDANCE_STATUS_OPTIONS.find(o => o.value === status)?.label || status
}

function tooltipOf(key: string) {
    const record = recordOf(key)
    if (!record) return ''

    const parts = [statusLabel(record.status as TeacherAttendanceStatus)]

    if (record.clockedInAt) {
        parts.push(`In: ${formatTime(record.clockedInAt)}${record.clockInByAdmin ? ' (by admin)' : ''}`)
    }
    if (record.clockedOutAt) {
        parts.push(`Out: ${formatTime(record.clockedOutAt)}${record.clockOutByAdmin ? ' (by admin)' : ''}`)
    }

    return parts.join(' • ')
}

const historyList = computed(() =>
    Object.values(recordsByDate.value)
        .filter(record => record.status || record.clockedInAt)
        .sort((a, b) => b.date.localeCompare(a.date))
)

function formatDay(date: string) {
    const [y, m, d] = date.split('-').map(Number)
    return new Date(y!, m! - 1, d!).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

function goPrevMonth() {
    cursor.value = addMonths(cursor.value, -1)
}

function goNextMonth() {
    cursor.value = addMonths(cursor.value, 1)
}

async function fetchMonth() {
    loading.value = true
    recordsByDate.value = {}

    if (!mine && !teacher?.id) {
        loading.value = false
        return
    }

    const from = dateKey(cursor.value)
    const to = dateKey(monthEnd.value)
    const days = await (mine
        ? TeacherAttendanceApi().myHistory(from, to)
        : TeacherAttendanceApi().byTeacher(teacher!.id, from, to)) as TeacherAttendanceDay[] | undefined

    const map: Record<string, TeacherAttendanceDay> = {}

    for (const day of days || []) {
        // day.date is a bare "YYYY-MM-DD" (a LocalDate, no time-of-day) already in dateKey's own
        // format - round-tripping it through `new Date(...)` parses it as UTC midnight, which a
        // viewer west of UTC would see roll back to the previous day once re-read with the local
        // getters dateKey() uses, misplacing the mark on the wrong calendar cell.
        map[day.date] = day
    }

    recordsByDate.value = map
    loading.value = false
}

watch(() => [mine, teacher?.id, cursor.value], fetchMonth, { immediate: true })
</script>

<template>
    <div class="space-y-4">
        <!-- Summary -->
        <UCard>
            <div class="flex flex-col items-center gap-6 lg:flex-row">
                <!-- Ring -->
                <div class="flex shrink-0 flex-col items-center">
                    <div class="relative h-32 w-32">
                        <svg viewBox="0 0 120 120" class="h-32 w-32 -rotate-90">
                            <circle cx="60" cy="60" r="52" fill="none" stroke-width="14"
                                class="stroke-error-100 dark:stroke-error-950" />

                            <circle cx="60" cy="60" r="52" fill="none" stroke-width="14" stroke-linecap="round"
                                :stroke-dasharray="CIRCUMFERENCE" :stroke-dashoffset="dashOffset"
                                class="stroke-success-500 transition-all duration-700 ease-out" />
                        </svg>

                        <div class="absolute inset-0 flex flex-col items-center justify-center">
                            <USkeleton v-if="loading" class="h-7 w-12" />

                            <span v-else class="text-2xl font-bold text-highlighted">
                                {{ stats.percent }}%
                            </span>

                            <span class="text-[10px] font-semibold uppercase tracking-wide text-muted">
                                Present
                            </span>
                        </div>
                    </div>

                    <div class="mt-3 flex items-center gap-4">
                        <div class="flex items-center gap-1.5">
                            <span class="h-2 w-2 rounded-full bg-success-500" />
                            <span class="text-xs text-muted">Present</span>
                        </div>

                        <div class="flex items-center gap-1.5">
                            <span class="h-2 w-2 rounded-full bg-error-400" />
                            <span class="text-xs text-muted">Absent</span>
                        </div>
                    </div>
                </div>

                <!-- Stat tiles -->
                <div class="grid w-full flex-1 grid-cols-2 gap-3 md:grid-cols-4">
                    <div v-for="tile in tiles" :key="tile.key"
                        class="rounded-xl border-2 p-4 text-center"
                        :class="[
                            tile.key === 'PRESENT' && 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-950',
                            tile.key === 'ABSENT' && 'border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-950',
                            tile.key === 'LATE' && 'border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-950',
                            tile.key === 'EXCUSED' && 'border-info-200 bg-info-50 dark:border-info-800 dark:bg-info-950'
                        ]"
                    >
                        <USkeleton v-if="loading" class="mx-auto h-7 w-10" />

                        <h2 v-else class="text-2xl font-bold" :class="statusStyles[tile.key]?.text">
                            {{ tile.value }}
                        </h2>

                        <p class="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                            {{ tile.label }}
                        </p>
                    </div>
                </div>
            </div>
        </UCard>

        <!-- Calendar -->
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
            <div class="flex items-center justify-between border-b border-default px-4 py-3">
                <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-chevron-left"
                    :label="prevMonthLabel" @click="goPrevMonth" />

                <div class="flex items-center gap-2 text-sm font-semibold text-highlighted">
                    <UIcon name="i-lucide-calendar" class="size-4 text-primary" />
                    {{ monthLabel }}
                </div>

                <UButton variant="ghost" color="neutral" size="sm" trailing-icon="i-lucide-chevron-right"
                    :label="nextMonthLabel" @click="goNextMonth" />
            </div>

            <div class="grid grid-cols-7 border-b border-default text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
                <div v-for="day in weekdays" :key="day" class="px-2 py-2">
                    {{ day }}
                </div>
            </div>

            <div class="grid grid-cols-7">
                <div v-for="(cell, i) in calendarCells" :key="cell?.key ?? `blank-${i}`"
                    class="flex md:min-h-16 flex-col items-center gap-1.5 border-b border-r border-default p-2 [&:nth-child(7n)]:border-r-0"
                >
                    <template v-if="cell">
                        <UTooltip v-if="recordOf(cell.key)" :delay-duration="0" arrow :text="tooltipOf(cell.key)">
                            <span
                                class="flex h-7 w-7 items-center justify-center rounded-full text-xs md:text-sm font-medium"
                                :class="circleClass(cell.key)"
                            >
                                {{ cell.day }}
                            </span>
                        </UTooltip>

                        <span v-else
                            class="flex h-7 w-7 items-center justify-center rounded-full text-xs md:text-sm font-medium"
                            :class="circleClass(cell.key)"
                        >
                            {{ cell.day }}
                        </span>

                        <span v-if="recordOf(cell.key)?.status" class="text-[7px] md:text-[9px] font-semibold"
                            :class="statusTextClass(cell.key)"
                        >
                            {{ statusLabel(recordOf(cell.key)!.status as TeacherAttendanceStatus) }}
                        </span>
                    </template>
                </div>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-4 px-4 py-3">
                <div v-for="option in TEACHER_ATTENDANCE_STATUS_OPTIONS" :key="option.value" class="flex items-center gap-1.5">
                    <span class="h-2 w-2 rounded-full" :class="statusStyles[option.value]?.dot" />
                    <span class="text-xs text-muted">{{ option.label }}</span>
                </div>

                <div class="flex items-center gap-1.5">
                    <span class="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <span class="text-xs text-muted">No Record</span>
                </div>
            </div>
        </UCard>

        <!-- History list - spells out clock in/out times the calendar only shows on hover -->
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
            <div class="flex items-center gap-2 border-b border-default px-4 py-3">
                <UIcon name="i-lucide-list" class="size-4 text-primary" />
                <h3 class="text-sm font-semibold text-highlighted">Daily Log</h3>
            </div>

            <div v-if="loading" class="space-y-3 p-4">
                <USkeleton v-for="i in 3" :key="i" class="h-12 w-full" />
            </div>

            <p v-else-if="!historyList.length" class="p-4 text-center text-sm text-muted">
                No attendance records for this month yet.
            </p>

            <div v-else class="divide-y divide-default">
                <div v-for="record in historyList" :key="record.date"
                    class="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                >
                    <div class="flex min-w-0 items-center gap-2.5">
                        <span class="h-2 w-2 shrink-0 rounded-full" :class="record.status ? statusStyles[record.status]?.dot : 'bg-gray-300 dark:bg-gray-700'" />
                        <div class="min-w-0">
                            <p class="truncate text-sm font-medium text-highlighted">{{ formatDay(record.date) }}</p>
                            <UBadge v-if="record.status" :color="teacherAttendanceStatusColor(record.status)" variant="subtle" size="xs">
                                {{ statusLabel(record.status) }}
                            </UBadge>
                        </div>
                    </div>

                    <div class="flex flex-col md:flex-row shrink-0 items-end md:items-center md:gap-3 gap-0 gap-y-1.5 text-xs">
                        <div v-if="record.clockedInAt" class="flex items-center gap-1 text-muted">
                            <UIcon name="i-lucide-log-in" class="size-3.5 text-primary" />
                            <span class="font-medium text-highlighted">{{ formatTime(record.clockedInAt) }}</span>
                            <span v-if="record.clockInByAdmin" class="text-muted">(admin)</span>
                        </div>

                        <div v-if="record.clockedOutAt" class="flex items-center gap-1 text-muted">
                            <UIcon name="i-lucide-log-out" class="size-3.5 text-primary" />
                            <span class="font-medium text-highlighted">{{ formatTime(record.clockedOutAt) }}</span>
                            <span v-if="record.clockOutByAdmin" class="text-muted">(admin)</span>
                        </div>

                        <span v-if="!record.clockedInAt && !record.clockedOutAt" class="text-muted">No clock times</span>
                    </div>
                </div>
            </div>
        </UCard>
    </div>
</template>
