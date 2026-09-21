<script setup lang="ts">
// Shown on the grade-entry screens when an approver has sent an assessment back: the reason they
// gave, right where the scores are edited, instead of only a "Returned" status. Renders nothing when
// no assessment is returned.
const { assessments } = defineProps<{
  assessments: Assessment[]
}>()

const returned = computed(() =>
  assessments
    .filter((assessment) => assessment.status === 'RETURNED')
    .sort((a, b) => a.position - b.position)
)
</script>

<template>
  <UAlert v-if="returned.length" color="error" variant="soft" icon="i-lucide-corner-up-left"
    :title="returned.length === 1
      ? `${returned[0]!.name} was returned for correction`
      : `${returned.length} assessments were returned for correction`">
    <template #description>
      <div class="space-y-3">
        <p class="text-sm">Fix what's noted below, then submit the assessment again.</p>

        <ul class="space-y-2">
          <li v-for="assessment in returned" :key="assessment.id"
            class="rounded-xl border border-error/20 bg-default/70 p-3">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <p class="text-sm font-semibold text-highlighted">{{ assessment.name }}</p>
              <span class="text-xs text-muted">{{ assessment.weight }}%</span>
            </div>

            <p class="mt-1 whitespace-pre-line text-sm text-toned">
              {{ assessment.returnReason || 'No reason was given.' }}
            </p>
          </li>
        </ul>
      </div>
    </template>
  </UAlert>
</template>
