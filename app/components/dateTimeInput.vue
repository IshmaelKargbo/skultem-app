<!-- A date-and-time field with two ways in: type the day, month, year, hour and minute with the keyboard, or pick
     the day from the calendar (the time typed is kept; 8:00 AM if none yet). Times show as AM/PM. Same v-model as a native
     <input type="datetime-local">: "YYYY-MM-DDTHH:mm", "" when empty; min/max the same kind of string. -->
<template>
  <UInputDate v-bind="$attrs" v-model="value" granularity="minute" :hour-cycle="12" :min-value="toDateTime(min)"
    :max-value="toDateTime(max)" :disabled="disabled" :size="size" :icon="icon" :aria-label="ariaLabel" class="w-full">
    <template #trailing>
      <UPopover v-model:open="open" :content="{ align: 'end' }">
        <UButton color="neutral" variant="link" size="sm" icon="i-lucide-calendar" class="px-0"
          aria-label="Pick a day from the calendar" :disabled="disabled" />
        <template #content>
          <UCalendar :model-value="day" :min-value="toDay(min)" :max-value="toDay(max)" class="p-2"
            @update:model-value="pickDay" />
        </template>
      </UPopover>
    </template>
  </UInputDate>
</template>

<script setup lang="ts">
import { CalendarDate, CalendarDateTime, parseDateTime } from '@internationalized/date'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  modelValue?: string | null
  min?: string | null
  max?: string | null
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  icon?: string
  ariaLabel?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string], change: [value: string] }>()

const open = ref(false)

function toDateTime(value?: string | null): CalendarDateTime | undefined {
  if (!value) return undefined
  try {
    return parseDateTime(value.length === 10 ? `${value}T00:00` : value.slice(0, 16))
  } catch {
    return undefined
  }
}

function toDay(value?: string | null): CalendarDate | undefined {
  const d = toDateTime(value)
  return d ? new CalendarDate(d.year, d.month, d.day) : undefined
}

// Same text as the native field: no seconds.
function text(d?: CalendarDateTime) {
  if (!d) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.year}-${p(d.month)}-${p(d.day)}T${p(d.hour)}:${p(d.minute)}`
}

function commit(next: string) {
  if (next === (props.modelValue ?? '')) return
  emit('update:modelValue', next)
  emit('change', next)
}

const value = computed<CalendarDateTime | undefined>({
  get: () => toDateTime(props.modelValue),
  set: (d) => commit(text(d as CalendarDateTime | undefined))
})

const day = computed(() => toDay(props.modelValue))

// The calendar's value can also be a range or a list in other modes; here it is one day.
function pickDay(picked: unknown) {
  if (!picked || typeof picked !== 'object' || !('day' in picked)) return
  const current = toDateTime(props.modelValue)
  const d = picked as { year: number, month: number, day: number }
  commit(text(new CalendarDateTime(d.year, d.month, d.day, current?.hour ?? 8, current?.minute ?? 0)))
  open.value = false
}
</script>
