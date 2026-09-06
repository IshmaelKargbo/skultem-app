<script setup lang="ts">
const store = useSystemStore();
const { stats, statsLoading } = storeToRefs(store);

onMounted(async () => {
  useAppStore().setTitle("System Admin");
  useAppStore().setBack(false);
  document.title = "System Admin | Skultem";

  await store.fetchStats();
});
</script>

<template>
  <div class="px-4 md:px-6 space-y-4">
    <Heading title="System Admin" subtitle="Platform-wide overview across every school on Skultem.">
      <UButton label="Manage Schools" trailing-icon="i-lucide-arrow-right" to="/schools" />
    </Heading>

    <UAlert
      color="warning"
      variant="soft"
      icon="i-lucide-shield-check"
      title="System-admin only"
      description="Cross-tenant view of every school on the platform. Nothing here is scoped to your own school."
    />

    <!-- Stats -->
    <div class="grid gap-4 sm:grid-cols-3">
      <Metric :record="{
        color: 'primary',
        icon: SCHOOL_ICON,
        label: 'Schools',
        value: stats.totalSchools,
        isReady: !statsLoading,
      }" />
      <Metric :record="{
        color: 'info',
        icon: USERS_ICON,
        label: 'Users',
        value: stats.totalUsers,
        isReady: !statsLoading,
      }" />
      <Metric :record="{
        color: 'success',
        icon: STUDENT_ICON,
        label: 'Students',
        value: stats.totalStudents,
        isReady: !statsLoading,
      }" />
    </div>
  </div>
</template>
