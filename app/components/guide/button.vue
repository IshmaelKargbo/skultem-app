<!-- Replays this page's guide; opens it by itself the first time someone visits the page. -->
<template>
  <UButton data-guide="guide-button" icon="i-lucide-circle-help" color="neutral" variant="ghost" label="Guide"
    class="justify-center" @click="start(guide)" />
</template>

<script setup lang="ts">
const { guide, auto = true } = defineProps<{ guide: string, auto?: boolean }>()
const { start, autoStart } = usePageGuide()

onMounted(() => {
  // Give the page a moment to load its data, so the parts the guide points at are there.
  if (auto) setTimeout(() => autoStart(guide), 1200)
})
</script>
