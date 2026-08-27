<script lang="ts" setup>
onMounted(() => {
  useAppStore().setTitle('Hostel Dashboard')
  document.title = 'Hostel Dashboard | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT]
})
</script>

<template>
  <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
    <Heading title="Hostel Dashboard" subtitle="Occupancy, capacity and allocation activity at a glance">
      <div class="flex space-x-3">
        <UButton to="/hostel/allocation" color="primary" :icon="ALLOCATE_ICON" label="Allocate Student" />
      </div>
    </Heading>
    <HostelDashboard />
  </div>
</template>
