<template>
  <!-- Names the parts of the continuous assessment and what each is worth. Every weight is a share of the WHOLE
       assessment, so the parts plus the formal test always total 100. Used for the section default and for one
       test in one term. -->
  <div class="space-y-3">
    <div class="space-y-2">
      <div v-for="(part, i) in parts" :key="i" class="flex items-center gap-2">
        <UInput v-model="part.name" placeholder="e.g. Attendance" class="min-w-0 flex-1" :disabled="disabled" />
        <UTooltip :text="part.source === 'ATTENDANCE' ? 'Marked from the attendance register - click to enter by hand' : 'Take this mark from the attendance register'">
          <UButton icon="lucide:calendar-check" size="sm" :disabled="disabled || (part.source !== 'ATTENDANCE' && hasAttendance)"
            :color="part.source === 'ATTENDANCE' ? 'info' : 'neutral'"
            :variant="part.source === 'ATTENDANCE' ? 'subtle' : 'ghost'" aria-label="From attendance"
            @click="toggleAttendance(part)" />
        </UTooltip>
        <UInput v-model.number="part.weight" type="number" min="1" max="99" class="w-24" :disabled="disabled"
          :ui="{ trailing: 'pe-3 text-muted text-sm' }">
          <template #trailing>%</template>
        </UInput>
        <UButton icon="lucide:x" color="neutral" variant="ghost" size="sm" aria-label="Remove part"
          :disabled="disabled" @click="parts.splice(i, 1)" />
      </div>
      <p v-if="!parts.length" class="text-xs text-muted">No parts yet. Add the first one below.</p>
    </div>

    <div class="flex flex-wrap items-center gap-1.5">
      <UButton icon="lucide:plus" label="Add part" size="xs" variant="subtle" :disabled="disabled || parts.length >= 40"
        @click="parts.push({ name: '', weight: 10 })" />
      <template v-for="s in suggestions" :key="s">
        <UButton v-if="!has(s)" :label="s" size="xs" color="neutral" variant="ghost" :disabled="disabled"
          @click="parts.push({ name: s, weight: 10, source: s === 'Attendance' && !hasAttendance ? 'ATTENDANCE' : 'MANUAL' })" />
      </template>
    </div>
    <p v-if="hasAttendance" class="text-xs text-muted">
      <UIcon name="lucide:calendar-check" class="mr-1 align-text-bottom text-info" />
      The attendance part is filled in from the register: days present or late, over the school days recorded in the
      term. Teachers can't type it in.
    </p>

    <UFormField :label="`Name of the final part (the one marked 0-100 last)`" help="Shown to teachers and families. Leave empty for “Formal test”.">
      <UInput v-model="formalLabel" placeholder="Formal test" class="w-full" :disabled="disabled" />
    </UFormField>

    <div class="rounded-lg px-3 py-2 text-xs"
      :class="valid ? 'bg-elevated/40 text-muted' : 'bg-warning/10 text-warning'">
      <template v-if="valid">
        Parts <span class="font-medium text-highlighted">{{ total }}%</span> +
        {{ formalLabel || 'Formal test' }} <span class="font-medium text-highlighted">{{ 100 - total }}%</span> = 100%
      </template>
      <template v-else>{{ problem }}</template>
    </div>
  </div>
</template>

<script setup lang="ts">
const parts = defineModel<CaComponent[]>('parts', { required: true })
const formalLabel = defineModel<string>('formalLabel', { default: '' })
defineProps<{ disabled?: boolean }>()

const suggestions = ['Attendance', 'Assignment', 'Class participation', 'Homework', 'Quiz', 'Project', 'Test']
const has = (name: string) => parts.value.some(p => p.name.trim().toLowerCase() === name.toLowerCase())
const hasAttendance = computed(() => parts.value.some(p => p.source === 'ATTENDANCE'))
function toggleAttendance(part: CaComponent) {
  part.source = part.source === 'ATTENDANCE' ? 'MANUAL' : 'ATTENDANCE'
  if (part.source === 'ATTENDANCE' && !part.name.trim()) part.name = 'Attendance'
}
const total = computed(() => parts.value.reduce((sum, p) => sum + (Number(p.weight) || 0), 0))

// null when the parts are usable, otherwise what to fix.
const problem = computed(() => partsProblem(parts.value))
const valid = computed(() => !problem.value)
</script>
