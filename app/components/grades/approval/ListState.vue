<script setup lang="ts">
// Empty and error states for the grade approval lists (admin and class master views).
const { error = null, filtered = false, emptyTitle, emptyDescription } = defineProps<{
  error?: string | null
  // A search or filter is active - the list may only look empty because of it.
  filtered?: boolean
  emptyTitle: string
  emptyDescription: string
}>()

const emit = defineEmits<{ retry: [], clear: [] }>()
</script>

<template>
  <div class="flex flex-col items-center gap-3 px-4 py-14 text-center">
    <template v-if="error">
      <div class="flex size-14 items-center justify-center rounded-2xl bg-error/10">
        <UIcon name="i-lucide-alert-triangle" class="size-7 text-error" />
      </div>
      <h3 class="font-semibold text-highlighted">Couldn't load approval requests</h3>
      <p class="max-w-sm text-sm text-muted">{{ error }}</p>
      <UButton label="Try again" :icon="REFRESH_ICON" color="primary" variant="soft" @click="emit('retry')" />
    </template>

    <template v-else-if="filtered">
      <div class="flex size-14 items-center justify-center rounded-2xl bg-elevated">
        <UIcon name="i-lucide-search-x" class="size-7 text-muted" />
      </div>
      <h3 class="font-semibold text-highlighted">No requests match your filters</h3>
      <p class="max-w-sm text-sm text-muted">Try a different search, status or class.</p>
      <UButton label="Clear filters" icon="i-lucide-x" color="neutral" variant="soft" @click="emit('clear')" />
    </template>

    <template v-else>
      <div class="flex size-14 items-center justify-center rounded-2xl bg-success/10">
        <UIcon name="i-lucide-inbox" class="size-7 text-success" />
      </div>
      <h3 class="font-semibold text-highlighted">{{ emptyTitle }}</h3>
      <p class="max-w-sm text-sm text-muted">{{ emptyDescription }}</p>
    </template>
  </div>
</template>
