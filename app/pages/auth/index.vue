<template>
  <div class="p-4 md:px-6  overflow-y-auto h-full space-y-4 sm:space-y-5">
    <Heading title="Users Management" subtitle="Manage users and explore your school data">
      <AuthUsersAdd />
    </Heading>
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
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
