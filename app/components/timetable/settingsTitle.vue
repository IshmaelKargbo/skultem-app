<!-- The heading of one part of Timetable settings: an icon, the name, and a line on what it's for. -->
<template>
  <div class="flex items-start gap-3">
    <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <UIcon :name="section.icon" class="size-4.5" />
    </span>
    <div class="min-w-0">
      <h2 class="text-base font-semibold text-highlighted">{{ section.title }}</h2>
      <p class="mt-0.5 max-w-2xl text-sm text-muted">{{ section.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ section: { title: string, description: string, icon: string } }>()
</script>
