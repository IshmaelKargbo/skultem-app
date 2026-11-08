<!-- The Guide + Help buttons for a page that has no header to put them in. topic is both the guide and the help. -->
<template>
  <div class="flex items-center justify-end">
    <GuideButton :guide="topic" />
    <HelpButton :topic="topic" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ topic: string }>()
</script>
