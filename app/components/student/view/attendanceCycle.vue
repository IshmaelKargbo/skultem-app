<script lang="ts" setup>
const { student } = defineProps<{
    student: Student | undefined
}>()

const reportStore = useReportStore()
const { attendances } = storeToRefs(reportStore)
const loading = ref(true)

const cursor = ref(startOfMonth(new Date()))
const recordsByDate = ref<Record<string, string>>({})
const eventsByDate = ref<Record<string, CalendarEntry[]>>({})

// Deliberately off the attendance palette (success/error/warning/info) so events and
// holidays never share a color with Present/Absent/Late/Excused.
const eventDotClass: Record<CalendarEntryType, string> = {
    EVENT: 'bg-secondary-500',
    HOLIDAY: 'bg-purple-500'
}

const statusStyles: Record<string, { circle: string, text: string, dot: string }> = {
    Present: {
        circle: 'bg-success-100 text-success-700 dark:bg-success-900/60 dark:text-success-300',
        text: 'text-success-600 dark:text-success-400',
        dot: 'bg-success-500'
    },
    Absent: {
        circle: 'bg-error-100 text-error-700 dark:bg-error-900/60 dark:text-error-300',
        text: 'text-error-600 dark:text-error-400',
        dot: 'bg-error-500'
    },
    Late: {
        circle: 'bg-warning-100 text-warning-700 dark:bg-warning-900/60 dark:text-warning-300',
        text: 'text-warning-600 dark:text-warning-400',
        dot: 'bg-warning-500'
    },
    Excused: {
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
    const counts: Record<string, number> = { Present: 0, Absent: 0, Late: 0, Excused: 0 }

    for (const status of Object.values(recordsByDate.value)) {
        if (status in counts) counts[status]!++
    }

    const total = counts.Present! + counts.Absent! + counts.Late! + counts.Excused!
    const percent = total === 0 ? 0 : Math.round((counts.Present! / total) * 100)

    return {
        Present: counts.Present!,
        Absent: counts.Absent!,
        Late: counts.Late!,
        Excused: counts.Excused!,
        total,
        percent
    }
})

const tiles = computed(() =>
    (['Present', 'Absent', 'Late', 'Excused'] as const).map(key => ({
        key,
        value: stats.value[key]
    }))
)

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const dashOffset = computed(() => CIRCUMFERENCE * (1 - stats.value.percent / 100))

function circleClass(key: string) {
    if (key === todayKey) return 'bg-primary-600 text-white'

    const status = recordsByDate.value[key]
    return status ? statusStyles[status]?.circle : 'text-muted'
}

function statusOf(key: string) {
    return recordsByDate.value[key]
}

function statusTextClass(key: string) {
    const status = recordsByDate.value[key]
    return status ? statusStyles[status]?.text : ''
}

function eventsOf(key: string) {
    return eventsByDate.value[key] || []
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

    if (!student?.id) {
        loading.value = false
        return
    }

    await reportStore.runReport(
        {
            entity: 'attendances',
            filters: [
                {
                    field: 'enrollment.student.id',
                    value: student.id,
                    operator: 'EQUALS',
                    type: 'select'
                },
                {
                    field: 'date',
                    value: dateKey(cursor.value),
                    valueTo: dateKey(monthEnd.value),
                    operator: 'BETWEEN',
                    type: 'date'
                }
            ]
        },
        1,
        40
    )

    const map: Record<string, string> = {}

    for (const record of attendances.value) {
        map[dateKey(new Date(record.date))] = record.state
    }

    recordsByDate.value = map
    loading.value = false
}

// Communicate's school-wide events & holidays, overlaid on the same calendar so a
// multi-day entry (e.g. a mid-term break) marks every day it spans, not just its start.
async function fetchEvents() {
    eventsByDate.value = {}

    try {
        const res = await CalendarEventApi().getAll(1, 100) as any
        const entries: CalendarEntry[] = res?.data || []
        const map: Record<string, CalendarEntry[]> = {}

        for (const entry of entries) {
            const start = new Date(entry.startDate)
            const end = new Date(entry.endDate)
            if (end < cursor.value || start > monthEnd.value) continue

            const from = start < cursor.value ? cursor.value : start
            const to = end > monthEnd.value ? monthEnd.value : end

            for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
                const key = dateKey(d)
                map[key] = [...(map[key] || []), entry]
            }
        }

        eventsByDate.value = map
    } catch {
        // Best-effort overlay — attendance itself still renders without it.
    }
}

watch(() => [student?.id, cursor.value], fetchMonth, { immediate: true })
watch(() => cursor.value, fetchEvents, { immediate: true })
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
                            tile.key === 'Present' && 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-950',
                            tile.key === 'Absent' && 'border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-950',
                            tile.key === 'Late' && 'border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-950',
                            tile.key === 'Excused' && 'border-info-200 bg-info-50 dark:border-info-800 dark:bg-info-950'
                        ]"
                    >
                        <USkeleton v-if="loading" class="mx-auto h-7 w-10" />

                        <h2 v-else class="text-2xl font-bold" :class="statusStyles[tile.key]?.text">
                            {{ tile.value }}
                        </h2>

                        <p class="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                            {{ tile.key }}
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
                    class="flex min-h-20 flex-col items-center gap-1.5 border-b border-r border-default p-2 [&:nth-child(7n)]:border-r-0"
                >
                    <template v-if="cell">
                        <span
                            class="flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium"
                            :class="circleClass(cell.key)"
                        >
                            {{ cell.day }}
                        </span>

                        <span v-if="statusOf(cell.key)" class="text-[9px] font-semibold uppercase"
                            :class="statusTextClass(cell.key)"
                        >
                            {{ statusOf(cell.key) }}
                        </span>

                        <UTooltip
                            v-if="eventsOf(cell.key).length"
                            :delay-duration="0"
                            arrow
                            :text="eventsOf(cell.key).map(e => e.title).join(', ')"
                        >
                            <div class="flex w-full flex-col items-center gap-0.5">
                                <span class="flex items-center gap-0.5">
                                    <span
                                        v-for="event in eventsOf(cell.key).slice(0, 3)"
                                        :key="event.id"
                                        class="h-1.5 w-1.5 rounded-full"
                                        :class="eventDotClass[event.type]"
                                    />
                                </span>

                                <span class="max-w-full truncate text-[8px] leading-none text-muted">
                                    {{ eventsOf(cell.key)[0]?.title }}
                                    <template v-if="eventsOf(cell.key).length > 1">+{{ eventsOf(cell.key).length - 1 }}</template>
                                </span>
                            </div>
                        </UTooltip>
                    </template>
                </div>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-4 px-4 py-3">
                <div v-for="(style, label) in statusStyles" :key="label" class="flex items-center gap-1.5">
                    <span class="h-2 w-2 rounded-full" :class="style.dot" />
                    <span class="text-xs text-muted">{{ label }}</span>
                </div>

                <div class="flex items-center gap-1.5">
                    <span class="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <span class="text-xs text-muted">No Record</span>
                </div>

                <div class="flex items-center gap-1.5">
                    <span class="h-2 w-2 rounded-full bg-secondary-500" />
                    <span class="text-xs text-muted">Event</span>
                </div>

                <div class="flex items-center gap-1.5">
                    <span class="h-2 w-2 rounded-full bg-purple-500" />
                    <span class="text-xs text-muted">Holiday</span>
                </div>
            </div>
        </UCard>
    </div>
</template>
