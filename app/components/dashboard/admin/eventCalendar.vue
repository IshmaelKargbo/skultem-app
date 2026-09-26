<template>
  <UCard :ui="{ body: 'p-4 sm:p-5' }">
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <div>
          <h3 class="text-sm font-semibold text-highlighted">Event Calendar</h3>
          <p class="text-xs text-muted">Events and holidays coming up</p>
        </div>
        <UButton to="/communicate/events" size="xs" variant="ghost" color="neutral" trailing-icon="lucide:arrow-right">
          All events
        </UButton>
      </div>
    </template>

    <!-- Month header -->
    <div class="mb-3 flex items-center justify-between">
      <UButton icon="lucide:chevron-left" size="xs" variant="ghost" color="neutral" aria-label="Previous month"
        @click="shift(-1)" />
      <p class="text-sm font-medium text-highlighted">{{ monthLabel }}</p>
      <UButton icon="lucide:chevron-right" size="xs" variant="ghost" color="neutral" aria-label="Next month"
        @click="shift(1)" />
    </div>

    <!-- Month grid: a dot under each day that has something on -->
    <div class="grid grid-cols-7 gap-y-1 text-center text-[11px] text-muted">
      <span v-for="d in weekdays" :key="d">{{ d }}</span>
    </div>
    <div class="mt-1 grid grid-cols-7 gap-y-1 text-center">
      <button v-for="cell in cells" :key="cell.key" type="button" :disabled="!cell.day"
        class="mx-auto flex size-9 flex-col items-center justify-center rounded-full text-sm transition"
        :class="[
          !cell.day ? 'invisible' : 'hover:bg-elevated',
          cell.isToday ? 'bg-primary text-white hover:bg-primary' : 'text-highlighted',
          selectedDay === cell.day && !cell.isToday ? 'ring-2 ring-primary/50' : ''
        ]" @click="selectedDay = selectedDay === cell.day ? null : cell.day">
        <span class="leading-none">{{ cell.day }}</span>
        <span class="mt-0.5 flex h-1 gap-0.5">
          <span v-if="cell.hasEvent" class="size-1 rounded-full" :class="cell.isToday ? 'bg-white' : 'bg-primary'" />
          <span v-if="cell.hasHoliday" class="size-1 rounded-full" :class="cell.isToday ? 'bg-white' : 'bg-success'" />
        </span>
      </button>
    </div>

    <!-- What's on -->
    <div class="mt-4 border-t border-default pt-3">
      <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        {{ selectedDay ? `On ${monthLabel.split(' ')[0]} ${selectedDay}` : 'Upcoming' }}
      </p>

      <div v-if="loading" class="space-y-2">
        <USkeleton v-for="i in 3" :key="i" class="h-10 w-full rounded-lg" />
      </div>
      <p v-else-if="!listed.length" class="py-3 text-center text-xs text-muted">
        {{ selectedDay ? 'Nothing on this day.' : 'No upcoming events or holidays.' }}
      </p>
      <ul v-else class="space-y-2">
        <li v-for="e in listed" :key="e.id" class="flex items-start gap-3 rounded-lg bg-elevated/40 px-3 py-2">
          <div class="flex w-10 shrink-0 flex-col items-center rounded-md bg-default py-1 ring-1 ring-default">
            <span class="text-[10px] uppercase text-muted">{{ short(e.startDate, { month: 'short' }) }}</span>
            <span class="text-sm font-semibold leading-none text-highlighted">{{ short(e.startDate, { day: 'numeric' }) }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5">
              <p class="truncate text-sm font-medium text-highlighted">{{ e.title }}</p>
              <UBadge size="sm" variant="subtle" :color="e.type === 'HOLIDAY' ? 'success' : 'primary'">
                {{ e.type === 'HOLIDAY' ? 'Holiday' : 'Event' }}
              </UBadge>
              <CommunicateSectionBadge :section-id="e.managementSectionId" />
            </div>
            <p class="truncate text-xs text-muted">
              {{ timeRange(e) }}<template v-if="e.location"> · {{ e.location }}</template>
            </p>
          </div>
        </li>
      </ul>
    </div>
  </UCard>
</template>

<script setup lang="ts">
// The school calendar on the dashboard: a month grid marked with the days that have an event or holiday, and the next
// few coming up (or the ones on a tapped day). The events page has the full list and the editing.
const store = useCommunicateStore()
const { calendar, loading } = storeToRefs(store)

const view = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const selectedDay = ref<number | null>(null)
const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const monthLabel = computed(() => view.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }))
function shift(by: number) {
  view.value = new Date(view.value.getFullYear(), view.value.getMonth() + by, 1)
  selectedDay.value = null
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
const short = (iso: string, opts: Intl.DateTimeFormatOptions) => new Date(iso).toLocaleDateString(undefined, opts)

// Every calendar day an entry covers (an event can run over several days).
const byDay = computed(() => {
  const map = new Map<string, CalendarEntry[]>()
  for (const e of calendar.value || []) {
    const start = new Date(e.startDate), end = new Date(e.endDate || e.startDate)
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    for (let n = 0; cursor <= last && n < 62; n++, cursor.setDate(cursor.getDate() + 1)) {
      const k = dayKey(cursor)
      map.set(k, [...(map.get(k) ?? []), e])
    }
  }
  return map
})

const cells = computed(() => {
  const y = view.value.getFullYear(), m = view.value.getMonth()
  const lead = new Date(y, m, 1).getDay()
  const days = new Date(y, m + 1, 0).getDate()
  const today = dayKey(new Date())
  const out: { key: string, day: number | null, isToday: boolean, hasEvent: boolean, hasHoliday: boolean }[] = []
  for (let i = 0; i < lead; i++) out.push({ key: `b${i}`, day: null, isToday: false, hasEvent: false, hasHoliday: false })
  for (let d = 1; d <= days; d++) {
    const k = dayKey(new Date(y, m, d))
    const on = byDay.value.get(k) ?? []
    out.push({
      key: k, day: d, isToday: k === today,
      hasEvent: on.some(e => e.type !== 'HOLIDAY'), hasHoliday: on.some(e => e.type === 'HOLIDAY')
    })
  }
  return out
})

const listed = computed(() => {
  if (selectedDay.value) {
    const k = dayKey(new Date(view.value.getFullYear(), view.value.getMonth(), selectedDay.value))
    return byDay.value.get(k) ?? []
  }
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0)
  return [...(calendar.value || [])]
    .filter(e => new Date(e.endDate || e.startDate) >= startOfToday)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 4)
})

function timeRange(e: CalendarEntry) {
  const s = new Date(e.startDate), en = new Date(e.endDate || e.startDate)
  const t = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const sameDay = dayKey(s) === dayKey(en)
  const allDay = s.getHours() === 0 && s.getMinutes() === 0
  if (allDay) return sameDay ? 'All day' : `${s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${en.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
  return sameDay ? `${t(s)} - ${t(en)}` : `${s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${t(s)}`
}

onMounted(() => { store.fetchCalendar(1, 200) })
</script>
