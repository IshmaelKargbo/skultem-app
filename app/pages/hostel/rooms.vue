<script lang="ts" setup>
onMounted(() => {
  useAppStore().setTitle('Manage Rooms')
  document.title = 'Manage Rooms | Hostel | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT]
})
</script>

<template>
  <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
    <Heading title="Manage Rooms" subtitle="Track room availability and occupancy across all hostels">
      <HostelRoomAdd />
    </Heading>
    <HostelRoomTable />
  </div>
</template>
