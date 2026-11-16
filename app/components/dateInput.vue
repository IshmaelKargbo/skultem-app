<!-- A date field with two ways in: type the day, month and year with the keyboard, or pick from the calendar.
     Same v-model as a native <input type="date">: a "YYYY-MM-DD" string, "" when empty. min/max are the same kind
     of string. Shown day-first (dd/mm/yyyy) through the app's en-GB locale. Emits change once a whole date is set
     or cleared, like the native input did. -->
<template>
  <UInputDate v-bind="$attrs" v-model="value" :min-value="toDate(min)" :max-value="toDate(max)" :disabled="disabled"
    :size="size" :variant="variant" :icon="icon" :leading-icon="leadingIcon" :aria-label="ariaLabel || placeholder" class="w-full">
    <template #trailing>
      <UPopover v-model:open="open" :content="{ align: 'end' }">
        <UButton color="neutral" variant="link" size="sm" icon="i-lucide-calendar" class="px-0"
          aria-label="Pick a date from the calendar" :disabled="disabled" />
        <template #content>
          <UCalendar v-model="value" :min-value="toDate(min)" :max-value="toDate(max)" class="p-2"
            @update:model-value="open = false" />
        </template>
      </UPopover>
    </template>
  </UInputDate>
</template>

<script setup lang="ts">
import { parseDate, type DateValue } from '@internationalized/date'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  modelValue?: string | null
  min?: string | null
  max?: string | null
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'outline' | 'soft' | 'subtle' | 'ghost' | 'none'
  icon?: string
  leadingIcon?: string
  ariaLabel?: string
  // Accepted but not passed on: UInputDate's placeholder is a date (it calls .compare() on it), so a text
  // placeholder breaks the field and the form around it. The field already shows dd/mm/yyyy.
  placeholder?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string], change: [value: string] }>()

const open = ref(false)

function toDate(value?: string | null): DateValue | undefined {
  if (!value) return undefined
  try {
    return parseDate(value.slice(0, 10))
  } catch {
    return undefined
  }
}

const value = computed<DateValue | undefined>({
  get: () => toDate(props.modelValue),
  set: (date) => {
    const next = date ? date.toString() : ''
    if (next === (props.modelValue ?? '')) return
    emit('update:modelValue', next)
    emit('change', next)
  }
})
</script>
