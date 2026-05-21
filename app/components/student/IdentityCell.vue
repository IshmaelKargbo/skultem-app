<template>
  <div class="flex items-center gap-3 min-w-0">
    <UAvatar
      size="lg"
      :src="photoSrc"
      :alt="displayName"
      class="ring-1 ring-gray-200 dark:ring-gray-700 shrink-0"
    />
    <div class="min-w-0 space-y-0.5">
      <p class="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
        {{ displayName }}
      </p>
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
}>()

const displayName = computed(() =>
  `${props.givenNames ?? ''} ${props.familyName ?? ''}`.trim() || 'Student'
)

const photoSrc = computed(() => props.photo || '/avatar-placeholder.svg')
</script>
