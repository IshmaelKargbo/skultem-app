<script setup lang="ts">
// Opens the "Start a Sick Bay Visit" page (pages/health-care/start-visit.vue). `studentId` starts it with that student.
const props = withDefaults(defineProps<{ block?: boolean, studentId?: string }>(), { block: false, studentId: undefined })
const to = computed(() => props.studentId
  ? `/health-care/start-visit?student=${encodeURIComponent(props.studentId)}`
  : '/health-care/start-visit')
</script>

<template>
  <UButton color="primary" label="Start Visit" icon="i-lucide-plus" :block="props.block" :to="to" />
</template>
