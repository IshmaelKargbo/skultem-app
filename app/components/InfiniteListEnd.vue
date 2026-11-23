<script setup lang="ts">
// The end of a scrolling list (see useInfiniteList): loading more, a retry, or how many are shown.
defineProps<{
  loadingMore: boolean
  failed: boolean
  loading: boolean
  shown: number
  total?: number
  noun: string
  error?: string | null
}>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="flex items-center justify-center px-4 py-3 text-xs text-muted">
    <span v-if="loadingMore" class="flex items-center gap-2">
      <UIcon name="i-lucide-loader-circle" class="animate-spin" /> Loading more...
    </span>
    <div v-else-if="failed" class="flex flex-col items-center gap-2 text-center">
      <p class="text-error">{{ shown ? `Couldn't load more ${noun}` : `Couldn't load the ${noun}` }}{{ error ? `: ${error}` : '' }}</p>
      <UButton size="xs" variant="soft" label="Try again" @click="$emit('retry')" />
    </div>
    <span v-else-if="!loading && total">Showing {{ shown }} of {{ total }} {{ noun }}</span>
  </div>
</template>
