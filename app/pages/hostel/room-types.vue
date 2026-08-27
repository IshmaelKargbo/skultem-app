<script lang="ts" setup>
onMounted(() => {
  useAppStore().setTitle('Room Types')
  document.title = 'Room Types | Hostel | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT]
})
</script>

<template>
  <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
    <Heading title="Room Types" subtitle="Room classes, capacity and pricing for hostel accommodation">
      <HostelRoomTypeAdd />
    </Heading>
    <HostelRoomTypeTable />
  </div>
</template>
