<script setup lang="ts">
// The full details of one lesson, shown in a popover over its card - the card itself cuts long names off.
const { entry, when, option } = defineProps<{
  entry: Timetable
  // e.g. "Monday · Period 3 · 08:00 - 08:40"
  when?: string
  // Set when the class splits between options at this time, e.g. "Option 1 of 2"
  option?: string
}>()

const isLibrary = computed(() => entry.kind === 'LIBRARY')
</script>

<template>
  <div class="w-64 space-y-3 p-3 text-sm">
    <div class="space-y-1">
      <p v-if="when || option" class="text-[11px] font-medium uppercase tracking-wide text-muted">
        {{ [when, option].filter(Boolean).join(' · ') }}
      </p>
      <h4 class="flex items-start gap-1.5 font-semibold leading-snug break-words">
        <UIcon v-if="isLibrary" :name="LIBRARY_ICON" class="mt-0.5 size-4 shrink-0 text-primary" />
        {{ entry.subject }}
      </h4>
    </div>
    <dl class="space-y-2 text-xs">
      <div class="flex items-start gap-2">
        <UIcon name="i-lucide-user-round" class="mt-0.5 size-3.5 shrink-0 text-muted" />
        <div class="min-w-0">
          <dt class="text-muted">Teacher</dt>
          <dd class="break-words font-medium">{{ isLibrary ? 'Librarian' : entry.teacher || 'No teacher assigned' }}</dd>
        </div>
      </div>
      <div class="flex items-start gap-2">
        <UIcon name="i-lucide-map-pin" class="mt-0.5 size-3.5 shrink-0 text-muted" />
        <div class="min-w-0">
          <dt class="text-muted">Room</dt>
          <dd class="break-words font-medium">{{ entry.room || 'No room assigned' }}</dd>
        </div>
      </div>
    </dl>
  </div>
</template>
