<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Timetable Setting" subtitle="Manage timetable settings for grades and sections" />
    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <TimetableTiming />
      <TimetableWorkingDay />
    </div>

    <TimetableRoom />
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Timetable');
    document.title = 'Timetable Seetings | Skultem'
})
</script>
