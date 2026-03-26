<template>
  <div class="p-7 overflow-y-auto h-full space-y-5">
    <Heading title="Users Management" subtitle="Manage users and explore your school data">

      <UsersAdd />
    </Heading>

    <!-- Users Table -->
    <UsersTable />
  </div>
</template>

<script setup lang="ts">
const appStore = useAppStore()

onMounted(() => {
  appStore.setTitle('Users')
  document.title = 'Users | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>