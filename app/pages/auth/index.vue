<template>
  <div class="p-7 overflow-y-auto h-full md:space-y-5 space-y-3">
    <Heading title="Users Management" subtitle="Manage users and explore your school data">
      <AuthUsersAdd />
    </Heading>

    <!-- Users Table -->
    <AuthUsersTable />
  </div>
</template>

<script setup lang="ts">
const appStore = useAppStore()

onMounted(() => {
  appStore.setTitle('Auth Management')
  document.title = 'Users | Auth | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>