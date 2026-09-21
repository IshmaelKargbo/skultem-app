<script setup lang="ts">
// The assessment stages of a class's cycle as a vertical stepper: a numbered marker per stage
// (a check once completed, the brand colour while it's the active one), joined by a line, with the
// stage's name, weight and status beside it. Used in the mobile drawer and the desktop card so the
// two read the same.
const { assessments, loading = false } = defineProps<{
  assessments: Assessment[]
  loading?: boolean
}>()

const STATUS: Record<string, { label: string, color: 'success' | 'info' | 'neutral' }> = {
  COMPLETED: { label: 'Completed', color: 'success' },
  ACTIVE: { label: 'Active', color: 'info' },
  INACTIVE: { label: 'Inactive', color: 'neutral' },
}

// A status the cycle endpoint doesn't send falls back to a neutral "Pending" instead of rendering
// blank, so an unrecognised value can't disappear from the timeline.
function statusOf(status: string) {
  return STATUS[status] ?? { label: 'Pending', color: 'neutral' as const }
}

function ordinal(position: number) {
  const remainder = position % 100
  if (remainder >= 11 && remainder <= 13) return `${position}th`

  switch (position % 10) {
    case 1: return `${position}st`
    case 2: return `${position}nd`
    case 3: return `${position}rd`
    default: return `${position}th`
  }
}

function markerClass(status: string) {
  if (status === 'COMPLETED') return 'bg-success text-white'
  if (status === 'ACTIVE') return 'bg-primary text-white ring-4 ring-primary/20'
  return 'border border-default bg-elevated text-muted'
}
</script>

<template>
  <div v-if="loading" class="space-y-3">
    <USkeleton v-for="i in 4" :key="i" class="h-16 rounded-xl" />
  </div>

  <ol v-else-if="assessments.length">
    <li v-for="(assessment, index) in assessments" :key="assessment.id"
      class="relative flex gap-3 pb-4 last:pb-0">
      <!-- Line down to the next stage; brand-green while this stage is done -->
      <span v-if="index < assessments.length - 1" aria-hidden="true"
        class="absolute left-5 top-11 -bottom-0 w-px -translate-x-1/2"
        :class="assessment.status === 'COMPLETED' ? 'bg-success/50' : 'bg-accented'" />

      <div class="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
        :class="markerClass(assessment.status)">
        <UIcon v-if="assessment.status === 'COMPLETED'" name="i-lucide-check" class="size-5" />
        <span v-else>{{ index + 1 }}</span>
      </div>

      <div class="min-w-0 flex-1 rounded-xl border p-3"
        :class="assessment.status === 'ACTIVE' ? 'border-primary/40 bg-primary/5' : 'border-default bg-elevated/40'">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-highlighted">{{ ordinal(index + 1) }} Assessment</p>
            <p class="mt-0.5 truncate text-xs text-muted">{{ assessment.name }}</p>
          </div>

          <UBadge size="sm" variant="soft" :color="statusOf(assessment.status).color"
            :label="statusOf(assessment.status).label" />
        </div>

        <p class="mt-2 text-xs text-muted">
          Weight <span class="font-semibold text-toned">{{ assessment.weight }}%</span>
        </p>
      </div>
    </li>
  </ol>

  <div v-else class="rounded-xl border border-dashed border-default py-12 text-center">
    <div class="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-elevated">
      <UIcon name="i-lucide-clipboard-list" class="size-6 text-muted" />
    </div>

    <p class="font-medium">No assessments found</p>
    <p class="mt-1 px-4 text-sm text-muted">Add assessments in Academics → Template.</p>
  </div>
</template>
