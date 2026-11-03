<template>
  <div class="flex flex-col items-center gap-3 px-4 py-12 text-center" :class="{ 'rounded-xl border border-default': bordered }">
    <div class="flex size-14 items-center justify-center rounded-2xl bg-error/10">
      <UIcon name="i-lucide-alert-triangle" class="size-7 text-error" />
    </div>
    <h3 class="font-semibold text-highlighted">{{ title }}</h3>
    <p v-if="message" class="max-w-sm text-sm text-muted">{{ message }}</p>
    <UButton label="Try again" :icon="REFRESH_ICON" color="primary" variant="soft" :loading="retrying"
      @click="emit('retry')" />
  </div>
</template>

<script setup lang="ts">
// Shown in place of a skeleton when the first load fails - so a failed request doesn't leave the skeleton spinning
// forever (or the screen blank) with only a toast that's already gone.
const { title = "Couldn't load this", message, bordered = false, retrying = false } = defineProps<{
  title?: string
  message?: string | null
  bordered?: boolean
  retrying?: boolean
}>()
const emit = defineEmits<{ retry: [] }>()
</script>
