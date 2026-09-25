<template>
  <div class="flex items-center gap-3 min-w-0">
    <UAvatar
      size="lg"
      :src="photo"
      :alt="displayName"
      loading="lazy"
      class="ring-1 ring-gray-200 dark:ring-gray-700 shrink-0"
    />
    <div class="min-w-0 space-y-0.5">
      <div class="flex items-center gap-1.5 min-w-0">
        <p class="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
          {{ displayName }}
        </p>
        <UBadge v-if="studentHasLeft(status)" size="sm" variant="subtle" class="shrink-0"
          :color="status === 'EXPELLED' ? 'error' : 'warning'">
          {{ status === 'EXPELLED' ? 'Expelled' : 'Withdrawn' }}
        </UBadge>
      </div>
      <p v-if="subtitle" class="text-xs text-gray-500 dark:text-gray-400 truncate">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  givenNames?: string
  familyName?: string
  photo?: string | null
  subtitle?: string
  // Shows a Withdrawn/Expelled badge for a student who left the school.
  status?: string | null
}>()

const displayName = computed(() =>
  `${props.givenNames ?? ''} ${props.familyName ?? ''}`.trim() || 'Student'
)
</script>
