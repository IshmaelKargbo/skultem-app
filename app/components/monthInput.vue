<!-- A month field with two ways in: type it as mm/yyyy, or pick the year and month from the grid. Same v-model as
     a native <input type="month">: "YYYY-MM", "" when empty. -->
<template>
  <UInput v-bind="$attrs" :model-value="draft" placeholder="mm/yyyy" inputmode="numeric" maxlength="7"
    :disabled="disabled" :size="size" :aria-label="ariaLabel" class="w-full" @update:model-value="type"
    @blur="settle">
    <template #trailing>
      <UPopover v-model:open="open" :content="{ align: 'end' }">
        <UButton color="neutral" variant="link" size="sm" icon="i-lucide-calendar" class="px-0"
          aria-label="Pick a month" :disabled="disabled" />
        <template #content>
          <div class="w-64 p-2">
            <div class="mb-2 flex items-center justify-between">
              <UButton icon="i-lucide-chevron-left" size="xs" color="neutral" variant="ghost" aria-label="Previous year"
                @click="() => { year-- }" />
              <p class="text-sm font-semibold text-highlighted">{{ year }}</p>
              <UButton icon="i-lucide-chevron-right" size="xs" color="neutral" variant="ghost" aria-label="Next year"
                @click="() => { year++ }" />
            </div>
            <div class="grid grid-cols-3 gap-1">
              <UButton v-for="(name, i) in MONTHS" :key="name" :label="name" size="sm" class="justify-center"
                :variant="isChosen(i + 1) ? 'solid' : 'ghost'" :color="isChosen(i + 1) ? 'primary' : 'neutral'"
                @click="pick(i + 1)" />
            </div>
          </div>
        </template>
      </UPopover>
    </template>
  </UInput>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  modelValue?: string | null
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  ariaLabel?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string], change: [value: string] }>()

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const open = ref(false)
const p = (n: number) => String(n).padStart(2, '0')

// "2026-11" <-> "11/2026"
const shown = (v?: string | null) => (v && /^\d{4}-\d{2}/.test(v) ? `${v.slice(5, 7)}/${v.slice(0, 4)}` : '')
const draft = ref(shown(props.modelValue))
const year = ref(Number(props.modelValue?.slice(0, 4)) || new Date().getFullYear())

watch(() => props.modelValue, (v) => {
  draft.value = shown(v)
  if (v) year.value = Number(v.slice(0, 4)) || year.value
})

function commit(next: string) {
  if (next === (props.modelValue ?? '')) return
  emit('update:modelValue', next)
  emit('change', next)
}

// Typing: digits only, the slash goes in by itself; a whole valid mm/yyyy is saved straight away.
function type(raw: string | number) {
  const digits = String(raw ?? '').replace(/\D/g, '').slice(0, 6)
  draft.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  const m = Number(digits.slice(0, 2)), y = Number(digits.slice(2))
  if (digits.length === 6 && m >= 1 && m <= 12 && y >= 1900) commit(`${y}-${p(m)}`)
  else if (!digits.length) commit('')
}

// Leaving a half-typed month puts back the saved one.
function settle() {
  draft.value = shown(props.modelValue)
}

function isChosen(month: number) {
  return props.modelValue === `${year.value}-${p(month)}`
}

function pick(month: number) {
  commit(`${year.value}-${p(month)}`)
  open.value = false
}
</script>
