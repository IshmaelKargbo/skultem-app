<template>
  <div v-if="flags.length" class="rounded-xl border border-warning/30 bg-warning/5 p-3">
    <div class="mb-2 flex items-center gap-2">
      <UIcon name="i-lucide-search-check" class="size-4 text-warning" />
      <p class="text-sm font-semibold text-highlighted">Worth checking before you approve</p>
    </div>
    <ul class="space-y-2">
      <li v-for="flag in flags" :key="flag.key" class="flex gap-2 text-sm">
        <UIcon :name="flag.tone === 'warning' ? 'i-lucide-alert-triangle' : 'i-lucide-info'"
          class="mt-0.5 size-4 shrink-0" :class="flag.tone === 'warning' ? 'text-warning' : 'text-info'" />
        <div class="min-w-0">
          <p class="font-medium text-highlighted">{{ flag.title }}</p>
          <p class="text-xs text-muted">{{ flag.detail }}</p>
          <template v-if="flag.students?.length">
            <button type="button" class="mt-0.5 text-xs font-medium text-primary hover:underline"
              @click="toggle(flag.key)">
              {{ open[flag.key] ? 'Hide students' : `Show ${flag.students.length === 1 ? 'student' : `${flag.students.length} students`}` }}
            </button>
            <ul v-if="open[flag.key]" class="mt-1 space-y-0.5 text-xs text-muted">
              <li v-for="name in flag.students" :key="name">• {{ name }}</li>
            </ul>
          </template>
        </div>
      </li>
    </ul>
    <p class="mt-2 text-xs text-muted">These are prompts, not errors - there can be good reasons. Send the grades back
      with a note if something needs correcting.</p>
  </div>

  <p v-else-if="hasContinuous" class="flex items-center gap-1.5 text-xs text-muted">
    <UIcon name="i-lucide-check-circle" class="size-3.5 text-success" />
    No unusual patterns in the CA marks.
  </p>
</template>

<script setup lang="ts">
// Prompts for the approver about a class's continuous assessment (same mark for everyone, CA far from the test,
// recordings missing or re-opened) - see caReviewFlags in utils/assessment.ts.
const { scores } = defineProps<{ scores: AssessmentScore[] }>()

const hasContinuous = computed(() => scores.some(s => s.continuous))
const flags = computed(() => caReviewFlags(scores))

const open = reactive<Record<string, boolean>>({})
function toggle(key: string) {
  open[key] = !open[key]
}
</script>
