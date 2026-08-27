<script lang="ts" setup>
onMounted(() => {
  useAppStore().setTitle('Student Allocation')
  document.title = 'Student Allocation | Hostel | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT]
})
</script>

<template>
  <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
    <Heading title="Student Allocation" subtitle="Assign students to rooms and manage vacancies">
      <HostelAllocationForm />
    </Heading>
    <HostelAllocationTable />
  </div>
</template>
