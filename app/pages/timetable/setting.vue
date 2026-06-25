<template>
  <div class="p-4 space-y-6">
    <UCard>
      <Heading title="Timetable Setting" subtitle="Manage timetable settings for grades and sections" />
    </UCard>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- School Timing -->
      <TimetableTiming />

      <!-- Working Days -->
      <TimetableWorkingDay />
    </div>

    <!-- Rooms -->
    <TimetableRoom />
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
    document.title = 'Setting| Timetable | Skultem'
})
</script>