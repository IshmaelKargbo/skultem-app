<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const store = useSystemStore();
const { demoRequests, demoRequestsMeta, demoRequestsLoading } = storeToRefs(store);

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } }),
});

const view = ref<"table" | "card">("table");

const columns = [
  { accessorKey: "school", header: "School" },
  { id: "contact", header: "Contact" },
  { id: "location", header: "Location" },
  { id: "interest", header: "Interest" },
  { accessorKey: "createdAt", header: "Requested" },
];

watch(page, () => store.fetchDemoRequests(page.value, 10));

onMounted(() => {
  useAppStore().setTitle("System Admin · Demo Requests");
  useAppStore().setBack(false);
  document.title = "Demo Requests | System Admin | Skultem";
  store.fetchDemoRequests(page.value, 10);
});

definePageMeta({
  role: [Role.SYSTEM_ADMIN],
});
</script>

<template>
  <div class="px-4 md:px-6 space-y-4">
    <Heading title="Demo Requests" subtitle="Schools that asked for a walkthrough from the market page." />

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-sm font-semibold text-highlighted">Requests</h2>
          <TableViewToggle v-model="view" />
        </div>
      </template>

      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="demoRequests"
        :loading="demoRequestsLoading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-presentation" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No demo requests yet.</p>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #school-cell="{ row }">
          <div class="space-y-1">
            <p class="font-medium">{{ row.original.school }}</p>
            <p class="text-xs text-muted">{{ row.original.name }}</p>
          </div>
        </template>

        <template #contact-cell="{ row }">
          <div class="space-y-1 text-sm">
            <a :href="`mailto:${row.original.email}`" class="block text-primary">{{ row.original.email }}</a>
            <a :href="`tel:${row.original.phone}`" class="block text-xs text-muted">{{ row.original.phone }}</a>
          </div>
        </template>

        <template #location-cell="{ row }">
          <div class="space-y-1">
            <p class="text-sm">{{ row.original.city }}</p>
            <p class="text-xs text-muted">{{ row.original.address }}</p>
          </div>
        </template>

        <template #interest-cell="{ row }">
          <div class="space-y-1">
            <div class="flex flex-wrap gap-1">
              <UBadge size="xs" variant="subtle" color="primary" :label="row.original.preferred" />
              <UBadge size="xs" variant="subtle" color="info" :label="row.original.priority" />
            </div>
            <p v-if="row.original.message" class="max-w-xs truncate text-xs text-muted"
              :title="row.original.message">{{ row.original.message }}</p>
          </div>
        </template>

        <template #createdAt-cell="{ row }">
          <p class="text-xs text-muted">{{ formatDateTime(row.original.createdAt) }}</p>
        </template>
      </UTable>

      <!-- Mobile -->
      <div class="space-y-3 p-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <template v-if="demoRequestsLoading">
          <UCard v-for="i in 4" :key="i" class="overflow-hidden">
            <div class="animate-pulse space-y-2 p-4">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-48" />
            </div>
          </UCard>
        </template>

        <UCard v-else-if="!demoRequests.length" class="col-span-full">
          <div class="flex flex-col items-center justify-center py-14">
            <UIcon name="i-lucide-presentation" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />
            <h3 class="text-sm font-semibold text-highlighted">No demo requests yet</h3>
          </div>
        </UCard>

        <template v-else>
          <UCard v-for="req in demoRequests" :key="req.id" class="overflow-hidden rounded-xl" :ui="{ body: 'p-0' }">
            <div class="p-3">
              <p class="truncate text-sm font-semibold text-highlighted">{{ req.school }}</p>
              <p class="truncate text-xs text-muted">{{ req.name }} · {{ req.city }}</p>
              <a :href="`mailto:${req.email}`" class="mt-1 block truncate text-xs text-primary">{{ req.email }}</a>
              <a :href="`tel:${req.phone}`" class="block text-xs text-muted">{{ req.phone }}</a>
              <p v-if="req.message" class="mt-2 text-xs text-muted whitespace-pre-line">{{ req.message }}</p>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 border-t border-default p-3 text-xs text-muted">
              <div class="flex flex-wrap gap-1">
                <UBadge size="xs" variant="subtle" color="primary" :label="req.preferred" />
                <UBadge size="xs" variant="subtle" color="info" :label="req.priority" />
              </div>
              <span>{{ formatDateTime(req.createdAt) }}</span>
            </div>
          </UCard>
        </template>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <Showing :meta="demoRequestsMeta" />
          <UPagination size="sm" v-model:page="page" :page-size="demoRequestsMeta.size"
            :items-per-page="demoRequestsMeta.size" :total="demoRequestsMeta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
