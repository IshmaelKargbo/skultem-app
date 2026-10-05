<script setup lang="ts">
const store = useSystemStore();
const { stats, statsLoading, demoRequests, demoRequestsMeta, demoRequestsLoading } = storeToRefs(store);

onMounted(async () => {
  useAppStore().setTitle("System Admin");
  useAppStore().setBack(false);
  document.title = "System Admin | Skultem";

  await Promise.all([store.fetchStats(), store.fetchDemoRequests(1, 5)]);
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

    <!-- Recent demo requests -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-presentation" class="size-5 text-muted" />
            <h3 class="font-semibold text-highlighted">Recent demo requests</h3>
            <UBadge v-if="demoRequestsMeta.total" size="sm" variant="subtle" :label="demoRequestsMeta.total" />
          </div>
          <UButton label="View all" size="xs" variant="ghost" trailing-icon="i-lucide-arrow-right" to="/demo-requests" />
        </div>
      </template>

      <div v-if="demoRequestsLoading" class="space-y-3 p-4">
        <USkeleton v-for="i in 3" :key="i" class="h-10 w-full" />
      </div>

      <p v-else-if="!demoRequests.length" class="py-10 text-center text-sm text-muted">
        No demo requests yet.
      </p>

      <ul v-else class="divide-y divide-default">
        <li v-for="req in demoRequests" :key="req.id" class="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-highlighted">{{ req.school }}</p>
            <p class="truncate text-xs text-muted">{{ req.name }} · {{ req.email }} · {{ req.phone }}</p>
          </div>
          <div class="flex items-center gap-2">
            <UBadge size="xs" variant="subtle" color="info" :label="req.priority" />
            <span class="text-xs text-muted">{{ formatDateTime(req.createdAt) }}</span>
          </div>
        </li>
      </ul>
    </UCard>
  </div>
</template>
