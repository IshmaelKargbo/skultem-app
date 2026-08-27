<script lang="ts" setup>
onMounted(() => {
  useAppStore().setTitle('Manage Hostels')
  document.title = 'Manage Hostels | Hostel | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT]
})
</script>

<template>
  <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
    <Heading title="Manage Hostels" subtitle="Hostel buildings, capacity and supervision at a glance">
      <HostelForm />
    </Heading>
    <HostelTable />
  </div>
</template>
