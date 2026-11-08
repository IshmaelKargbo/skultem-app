<template>
  <div class="space-y-3 px-4 md:px-6">
    <Heading class="hidden md:block" title="Timetable Setting" subtitle="Manage timetable settings for grades and sections" />
    <div data-guide="tt-tabs"><TimetableSectionNav /></div>
    <GuideBar topic="admin-timetable-settings" />
    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div data-guide="tts-timing"><TimetableTiming /></div>
      <div>
        <div data-guide="tts-days"><TimetableWorkingDay /></div>
      </div>
    </div>

    <div data-guide="tts-rooms"><TimetableRoom /></div>
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  useAppStore().setTitle('Timetable');
  document.title = 'Timetable Seetings | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
