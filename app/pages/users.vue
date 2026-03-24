<template>
  <div class="p-7 h-full overflow-y-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Users Management</h1>
        <p class="text-mute">
          Manage users and explore your school data
        </p>
      </div>

      <UsersAdd />
    </div>

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
  role: [Role.SCHOOL_ADMIN]
})
</script>