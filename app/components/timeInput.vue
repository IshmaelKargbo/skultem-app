<!-- A time field with two ways in: type the hour and minute with the keyboard, or pick from a list (every 15
     minutes), shown as AM/PM. Same v-model as a native <input type="time">: "HH:mm" (24-hour), "" when empty. -->
<template>
  <UInputTime v-bind="$attrs" v-model="value" :hour-cycle="12" :disabled="disabled" :size="size" :icon="icon"
    :aria-label="ariaLabel" class="w-full">
    <template #trailing>
      <UPopover v-model:open="open" :content="{ align: 'end' }">
        <UButton color="neutral" variant="link" size="sm" icon="i-lucide-clock" class="px-0"
          aria-label="Pick a time from the list" :disabled="disabled" />
        <template #content>
          <div class="grid max-h-64 grid-cols-3 gap-1 overflow-y-auto p-2">
            <UButton v-for="t in times" :key="t" :label="ampm(t)" size="xs" class="justify-center"
              :variant="t === modelValue ? 'solid' : 'ghost'" :color="t === modelValue ? 'primary' : 'neutral'"
              @click="pick(t)" />
          </div>
        </template>
      </UPopover>
    </template>
  </UInputTime>
</template>

<script setup lang="ts">
import { Time, parseTime } from '@internationalized/date'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  modelValue?: string | null
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  icon?: string
  ariaLabel?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string], change: [value: string] }>()

const open = ref(false)
const p = (n: number) => String(n).padStart(2, '0')
const times = Array.from({ length: 96 }, (_, i) => `${p(Math.floor(i / 4))}:${p((i % 4) * 15)}`)

// "13:30" -> "1:30 PM" (the list's labels; the value stays 24-hour)
function ampm(t: string) {
  const [h, m] = t.split(':').map(Number) as [number, number]
  return `${h % 12 || 12}:${p(m)} ${h < 12 ? 'AM' : 'PM'}`
}

function commit(next: string) {
  if (next === (props.modelValue ?? '')) return
  emit('update:modelValue', next)
  emit('change', next)
}

const value = computed<Time | undefined>({
  get: () => {
    if (!props.modelValue) return undefined
    try {
      return parseTime(props.modelValue.slice(0, 5))
    } catch {
      return undefined
    }
  },
  set: (t) => commit(t ? `${p(t.hour)}:${p(t.minute)}` : '')
})

function pick(t: string) {
  commit(t)
  open.value = false
}
</script>
