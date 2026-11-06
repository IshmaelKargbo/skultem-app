<template>
  <div class="space-y-3">
    <UCard v-for="day in days" :key="day.date" :ui="{ body: 'p-0 sm:p-0' }" class="break-inside-avoid">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <div class="min-w-0">
            <p class="font-semibold">{{ formatExamDay(day.date) }}</p>
            <p v-if="dayNumber" class="text-xs text-muted">Day {{ day.index + 1 }}</p>
          </div>
          <UBadge variant="subtle" color="neutral">{{ day.papers.length }} {{ day.papers.length === 1 ? 'paper' : 'papers' }}</UBadge>
        </div>
      </template>
      <div class="divide-y divide-default">
        <div v-for="p in day.papers" :key="p.id" class="flex items-start justify-between gap-3 px-4 py-3">
          <div class="flex min-w-0 gap-3">
            <div class="w-24 shrink-0">
              <p class="text-sm font-semibold tabular-nums text-highlighted">
                {{ examTime(p.startTime) }}–{{ examTime(p.endTime) }}
              </p>
              <p class="text-[11px] text-muted">{{ sittingOf(p.startTime) }}</p>
            </div>
            <div class="min-w-0 space-y-1">
              <p class="text-sm font-medium text-highlighted">
                {{ p.subjectName }}<span v-if="p.paper" class="text-muted"> · {{ p.paper }}</span>
              </p>
              <div v-if="showClasses" class="flex flex-wrap gap-1">
                <UBadge v-for="c in p.classes" :key="c.id" size="sm" variant="soft" color="neutral" :label="c.name" />
              </div>
              <p v-if="p.venue || (showInvigilators && p.invigilators.length)" class="text-xs text-muted">
                <template v-if="p.venue"><UIcon name="i-lucide-map-pin" class="-mt-0.5 size-3" /> {{ p.venue }}</template>
                <template v-if="p.venue && showInvigilators && p.invigilators.length"> · </template>
                <template v-if="showInvigilators && p.invigilators.length">
                  Invigilator{{ p.invigilators.length > 1 ? 's' : '' }}: {{ p.invigilators.map(i => i.name).join(', ') }}
                </template>
              </p>
              <p v-if="p.notes" class="text-xs italic text-muted">{{ p.notes }}</p>
            </div>
          </div>
          <div v-if="canManage" class="flex shrink-0 gap-1 print:hidden">
            <UButton :icon="SCHEME_EDIT_ICON" size="xs" variant="ghost" color="neutral" aria-label="Edit"
              @click="emit('edit', p)" />
            <UButton :icon="DELETE_ICON" size="xs" variant="ghost" color="error" aria-label="Remove"
              @click="emit('remove', p)" />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { papers, canManage = false, showClasses = true, showInvigilators = true, dayNumber = true } = defineProps<{
  papers: ExamPaper[]
  canManage?: boolean
  showClasses?: boolean
  showInvigilators?: boolean
  dayNumber?: boolean
}>()

const emit = defineEmits<{ edit: [ExamPaper], remove: [ExamPaper] }>()

const days = computed(() => groupPapersByDay(papers))
</script>
