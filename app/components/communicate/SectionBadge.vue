<script setup lang="ts">
// "Primary School" badge on an announcement that is for one management section only; nothing for a
// whole-school one (the default), so ordinary notices look exactly as before.
defineProps<{ sectionId?: string | null }>()
const { sectionName, load } = useSchoolStructure()
onMounted(() => { load() })
</script>

<template>
  <UBadge v-if="sectionId && sectionName(sectionId)" color="primary" variant="subtle" size="sm"
    icon="i-lucide-users-round">
    {{ sectionName(sectionId) }} only
  </UBadge>
</template>
