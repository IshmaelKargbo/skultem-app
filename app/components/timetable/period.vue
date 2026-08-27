<script setup lang="ts">
const { isAdmin = false } = defineProps<{
  isAdmin?: boolean
}>()

const store = useTimetableStore()
const { periods, periodLoading: loading, days } = storeToRefs(store)

const selectedDayIndex = ref(0)
const day = ref<string | undefined>()
const period = ref<string | undefined>()
const index = ref<string | undefined>()
const deleteModal = ref(false)
const subjectModal = ref(false)
const selectPeriod = ref<Period>()
const selectedSubject = ref<any>({
  period: '',
  periodId: '',
  subject: '',
  room: '',
  color: 'bg-primary/5 border-primary/20',
})

const colorOptions = [
  { value: 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900', swatch: 'bg-blue-200 dark:bg-blue-900' },
  { value: 'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900', swatch: 'bg-green-200 dark:bg-green-900' },
  { value: 'bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900', swatch: 'bg-purple-200 dark:bg-purple-900' },
  { value: 'bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-900', swatch: 'bg-orange-200 dark:bg-orange-900' },
  { value: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:border-cyan-900', swatch: 'bg-cyan-200 dark:bg-cyan-900' },
  { value: 'bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:border-pink-900', swatch: 'bg-pink-200 dark:bg-pink-900' },
  { value: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-900', swatch: 'bg-yellow-200 dark:bg-yellow-900' },
  { value: 'bg-primary/5 border-primary/20', swatch: 'bg-primary/30' },
]

const selectedDayName = computed(() => {
  const value = days.value[selectedDayIndex.value]
  return value ? clean(value) : 'No working day selected'
})

const selectedDayPeriods = computed(() =>
  periods.value.map((periodItem) => {
    const subject = periodItem.subjects?.[selectedDayIndex.value]
    return { periodItem, subject }
  })
)

watch(days, (value) => {
  if (!value.length) {
    selectedDayIndex.value = 0
    return
  }

  if (selectedDayIndex.value >= value.length) {
    selectedDayIndex.value = 0
  }
}, { immediate: true })

function openSubject(periodItem: Period, dayIndex: number) {
  if (!isAdmin) return

  const subject = periodItem.subjects?.[dayIndex]
  if (!subject) return

  period.value = periodItem.id
  day.value = days.value[dayIndex]
  index.value = String(dayIndex)
  selectedSubject.value = {
    ...subject,
    color: subject.color || colorOptions[0].value,
  }
  subjectModal.value = true
}

function addSubject(periodItem: Period, dayIndex: number) {
  if (!isAdmin) return

  period.value = periodItem.id
  day.value = days.value[dayIndex]
  index.value = String(dayIndex)
  selectedSubject.value = {
    subject: '',
    teacher: '',
    room: '',
    color: colorOptions[0].value,
  }
  subjectModal.value = true
}

function deletePeriodRecord(periodItem: Period) {
  selectPeriod.value = periodItem
  deleteModal.value = true
}
</script>

<template>
  <div v-if="loading" class="space-y-3 p-2">
    <div class="space-y-3 px-4 pb-4 md:hidden md:px-0 md:pb-0">
      <div v-for="row in 3" :key="row" class="rounded-3xl border border-default p-4">
        <div class="mb-4 flex items-center justify-between gap-3">
          <USkeleton class="h-5 w-24 rounded-full" />
          <USkeleton class="h-8 w-8 rounded-full" />
        </div>

        <div class="space-y-3">
          <USkeleton v-for="col in 3" :key="`${row}-${col}`" class="h-20 rounded-2xl" />
        </div>
      </div>
    </div>

    <div class="hidden md:block">
      <div class="grid grid-cols-6 gap-3">
        <USkeleton class="h-12 rounded-xl" />
        <USkeleton v-for="i in 5" :key="i" class="h-12 rounded-xl" />
      </div>

      <div v-for="row in 4" :key="row" class="mt-3 grid grid-cols-6 gap-3">
        <USkeleton class="h-28 rounded-2xl" />
        <USkeleton v-for="col in 5" :key="`${row}-${col}`" class="h-28 rounded-2xl" />
      </div>
    </div>
  </div>

  <div v-else class="space-y-4">
    <div class="space-y-3 px-4 pb-4 mt-5 md:hidden md:px-0 md:pb-0">
      <div v-if="days.length" class="overflow-x-auto pb-2 pt-1">
        <div class="flex min-w-max gap-2">
          <button
            v-for="(dayName, dayIndex) in days"
            :key="dayName"
            type="button"
            class="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
            :class="selectedDayIndex === dayIndex
              ? 'border-primary bg-primary text-white'
              : 'border-default  bg-white text-muted hover:border-primary/40 hover:bg-primary/5 hover:text-primary'"
            @click="selectedDayIndex = dayIndex"
          >
            {{ clean(dayName) }}
          </button>
        </div>
      </div>

      <div class="rounded-3xl border border-default bg-muted/20 p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              Selected day
            </p>
            <h4 class="text-base font-semibold">
              {{ selectedDayName }}
            </h4>
          </div>
          <UIcon name="i-lucide-calendar-days" class="size-5 text-primary" />
        </div>
      </div>

      <article
        v-for="{ periodItem, subject } in selectedDayPeriods"
        :key="periodItem.id"
        class="rounded-3xl border border-default bg-white p-4 shadow-sm dark:bg-neutral-950"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              Period
            </p>
            <h4 class="truncate text-base font-semibold">
              {{ periodItem.name }}
            </h4>
            <p class="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted">
              <UIcon name="i-lucide-clock" class="size-3" />
              <span>{{ periodItem.startTime }}</span>
              <span>to</span>
              <span>{{ periodItem.endTime }}</span>
            </p>
          </div>

          <UButton
            v-if="isAdmin && periodItem.id === periods[periods.length - 1]?.id"
            :icon="DELETE_ICON"
            size="xs"
            color="error"
            variant="ghost"
            @click="deletePeriodRecord(periodItem)"
          />
        </div>

        <div
          v-if="periodItem.isBreak || periodItem.isLunch"
          class="mt-4 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-4 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
        >
          <div class="flex items-center justify-center gap-2">
            <UIcon name="i-lucide-coffee" class="size-4" />
            <span class="text-sm font-medium">
              {{ periodItem.isBreak ? 'Break' : 'Lunch' }} - no classes scheduled
            </span>
          </div>
        </div>

        <button
          v-else-if="subject"
          type="button"
          class="mt-4 block w-full text-left"
          @click="openSubject(periodItem, selectedDayIndex)"
        >
          <div
            class="rounded-2xl border p-4 shadow-sm transition-transform duration-200 active:scale-[0.99]"
            :class="subject.color"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-[11px] font-medium uppercase tracking-wide text-muted">
                  {{ selectedDayName }}
                </p>
                <h5 class="truncate font-semibold leading-tight">
                  {{ subject.subject }}
                </h5>
              </div>

              <UIcon v-if="isAdmin" name="i-lucide-pencil" class="size-4 text-muted" />
            </div>

            <div class="mt-3 space-y-1.5 text-xs text-muted">
              <div class="flex items-center gap-1.5">
                <UIcon name="i-lucide-user-round" class="size-3.5" />
                <span>{{ subject.teacher || '—' }}</span>
              </div>

              <div class="flex items-center gap-1.5">
                <UIcon name="i-lucide-map-pin" class="size-3.5" />
                <span>{{ subject.room || '—' }}</span>
              </div>
            </div>
          </div>
        </button>

        <button
          v-else-if="isAdmin"
          type="button"
          class="mt-4 flex w-full items-center justify-between rounded-2xl border-2 border-dashed border-default px-4 py-4 text-left text-muted transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
          @click="addSubject(periodItem, selectedDayIndex)"
        >
          <div>
            <p class="text-[11px] font-medium uppercase tracking-wide text-muted">
              {{ selectedDayName }}
            </p>
            <p class="mt-0.5 text-sm font-medium">
              Add subject
            </p>
          </div>

          <UIcon name="i-lucide-plus" class="size-5" />
        </button>

        <div v-else class="mt-4 rounded-2xl border-2 border-dashed border-default px-4 py-4 text-muted">
          <p class="text-[11px] font-medium uppercase tracking-wide text-muted">
            {{ selectedDayName }}
          </p>
          <p class="mt-0.5 text-sm font-medium">
            Free period
          </p>
        </div>
      </article>
    </div>

    <div class="hidden overflow-x-auto md:block">
      <table class="min-w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-default bg-muted/30">
            <th class="w-40 p-4 text-left font-medium text-muted">
              Period
            </th>

            <th
              v-for="dayName in days"
              :key="dayName"
              class="min-w-45 p-4 text-left font-medium text-muted"
            >
              {{ dayName }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(periodItem, pIndex) in periods"
            :key="periodItem.id"
            class="border-b border-default last:border-b-0"
          >
            <td class="p-3 align-top">
              <div
                class="flex h-full flex-col justify-center rounded-xl p-4"
                :class="(periodItem.isBreak || periodItem.isLunch) ? 'bg-amber-50 dark:bg-amber-950/40' : 'bg-muted/30'"
              >
                <div class="flex items-center justify-between gap-2">
                  <h4 class="font-semibold">
                    {{ periodItem.name }}
                  </h4>

                  <UButton
                    v-if="pIndex === periods.length - 1 && isAdmin"
                    :icon="DELETE_ICON"
                    variant="ghost"
                    color="error"
                    size="xs"
                    @click="deletePeriodRecord(periodItem)"
                  />
                </div>

                <p class="mt-1 flex items-center gap-1 text-xs text-muted">
                  <UIcon name="i-lucide-clock" class="size-3" />
                  <span>{{ periodItem.startTime }}</span>
                  <span>{{ periodItem.endTime }}</span>
                </p>
              </div>
            </td>

            <template v-if="periodItem.isBreak">
              <td :colspan="days.length" class="p-3">
                <div class="flex h-16 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
                  <UIcon name="i-lucide-coffee" class="size-4" />
                  <span class="text-sm font-medium">Break - no classes scheduled</span>
                </div>
              </td>
            </template>

            <template v-else-if="periodItem.isLunch">
              <td :colspan="days.length" class="p-3">
                <div class="flex h-16 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
                  <UIcon name="i-lucide-coffee" class="size-4" />
                  <span class="text-sm font-medium">Lunch - no classes scheduled</span>
                </div>
              </td>
            </template>

            <template v-else>
              <td
                v-for="(dayName, dayIndex) in days"
                :key="dayName"
                class="p-3"
              >
                <button
                  v-if="periodItem.subjects?.[dayIndex]"
                  type="button"
                  class="group w-full text-left"
                  @click="openSubject(periodItem, dayIndex)"
                >
                  <div
                    class="relative h-28 rounded-2xl border p-4 shadow transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    :class="periodItem.subjects[dayIndex].color"
                  >
                    <h4 class="font-semibold leading-tight">
                      {{ periodItem.subjects[dayIndex].subject }}
                    </h4>

                    <div class="mt-3 space-y-1.5 text-xs text-muted">
                      <div class="flex items-center gap-1.5">
                        <UIcon name="i-lucide-user-round" class="size-3.5" />
                        {{ periodItem.subjects[dayIndex].teacher || '—' }}
                      </div>

                      <div class="flex items-center gap-1.5">
                        <UIcon name="i-lucide-map-pin" class="size-3.5" />
                        {{ periodItem.subjects[dayIndex].room || '—' }}
                      </div>
                    </div>

                    <UIcon
                      v-if="isAdmin"
                      name="i-lucide-pencil"
                      class="absolute right-3 top-3 size-3.5 text-muted opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                </button>

                <button
                  v-else-if="isAdmin"
                  type="button"
                  class="flex h-28 w-full items-center justify-center rounded-2xl border-2 border-dashed border-default text-muted transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  @click="addSubject(periodItem, dayIndex)"
                >
                  <div class="flex flex-col items-center gap-1.5">
                    <UIcon name="i-lucide-plus" class="size-5" />
                    <span class="text-xs font-medium">
                      Add Subject
                    </span>
                  </div>
                </button>

                <div v-else class="flex h-28 w-full items-center justify-center rounded-2xl border-2 border-dashed border-default text-muted">
                  <div class="flex flex-col items-center gap-1.5">
                    <UIcon name="i-lucide-ban" class="size-5" />
                    <span class="text-xs font-medium">
                      Free Period
                    </span>
                  </div>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <TimetableAddTimetable
    v-model:open="subjectModal"
    :state="selectedSubject"
    :index="index"
    :period="period"
    :day="day"
  />
  <TimetableDeletePrompt
    v-model:open="deleteModal"
    :period-id="selectPeriod?.id || ''"
    :period-name="selectPeriod?.name || ''"
  />
</template>
