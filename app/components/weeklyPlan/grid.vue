<!-- One week of a weekly plan laid out like the timetable: weekdays across, sessions down. Editable cells (staff)
     pick a subject; read-only cells (teachers, parents) show it. Days outside the term are greyed; holidays say so. -->
<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[44rem] table-fixed border-collapse text-sm">
      <thead>
        <tr class="bg-elevated/50">
          <th class="w-36 border-b border-default p-2 text-left text-xs font-medium text-muted">Session</th>
          <th v-for="col in columns" :key="col.weekday" class="border-b border-l border-default p-2 text-left">
            <p class="font-semibold text-highlighted">{{ col.weekday }}</p>
            <p class="text-xs font-normal text-muted">{{ col.day ? formatDate(col.day.date) : '' }}</p>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(slot, i) in slots" :key="i">
          <th class="border-b border-default p-2 text-left align-top">
            <p class="font-medium text-highlighted">{{ slot.name }}</p>
            <p v-if="slotTime(slot)" class="text-xs font-normal text-muted">{{ slotTime(slot) }}</p>
          </th>
          <td v-for="col in columns" :key="col.weekday" class="border-b border-l border-default p-1.5 align-top"
            :class="!col.day ? 'bg-elevated/40' : col.day.holiday ? 'bg-warning/5' : ''">
            <template v-if="!col.day" />
            <p v-else-if="col.day.holiday" class="px-1 text-xs text-muted">{{ i === 0 ? `${col.day.holiday} - no school` : '' }}</p>
            <USelectMenu v-else-if="editable && picks" v-model="picks[`${col.day.date}|${i}`]" :items="subjectItems"
              value-key="value" placeholder="—" size="sm" class="w-full" />
            <p v-else class="px-1 font-medium text-highlighted">{{ subjectOf(col.day, i) || '—' }}</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { slotTime, type WeeklyPlanDay, type WeeklyPlanSlot, type WeeklyPlanWeek } from '~/api/weeklyPlan.api'

const props = defineProps<{
  week: WeeklyPlanWeek
  slots: WeeklyPlanSlot[]
  editable?: boolean
  // "date|slot" -> subject id (staff editing); read-only cells use the week's entries.
  picks?: Record<string, string | undefined>
  subjects?: { id: string, name: string }[]
}>()

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// Always Monday to Friday, so every week lines up like the timetable.
const columns = computed(() => WEEKDAYS.map(weekday => ({ weekday, day: props.week.days.find(d => d.weekday === weekday) })))
const subjectItems = computed(() => [{ label: 'No subject', value: '' }, ...(props.subjects ?? []).map(s => ({ label: s.name, value: s.id }))])

function subjectOf(day: WeeklyPlanDay, slot: number) {
  if (props.picks) return props.subjects?.find(s => s.id === props.picks![`${day.date}|${slot}`])?.name
  return day.entries.find(e => e.slot === slot)?.subjectName
}
</script>
