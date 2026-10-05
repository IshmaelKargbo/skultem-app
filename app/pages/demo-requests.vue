<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const store = useSystemStore();
const { demoRequests, demoRequestsMeta, demoRequestsLoading } = storeToRefs(store);

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } }),
});

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
    <div v-if="demoRequestsLoading" class="grid gap-3 sm:grid-cols-2">
      <UCard v-for="i in 4" :key="i">
        <div class="animate-pulse space-y-2 p-2">
          <USkeleton class="h-4 w-40" />
          <USkeleton class="h-3 w-56" />
        </div>
      </UCard>
    </div>

    <UCard v-else-if="!demoRequests.length">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-presentation" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />
        <p class="text-sm font-semibold text-highlighted">No demo requests yet</p>
        <p class="mt-1 text-xs text-muted">Requests submitted from the market page will show up here.</p>
      </div>
    </UCard>

    <template v-else>
      <UCard v-for="req in demoRequests" :key="req.id" :ui="{ body: 'p-4' }">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="font-semibold text-highlighted">{{ req.school }}</p>
            <p class="text-sm text-muted">{{ req.name }}</p>
          </div>
          <span class="text-xs text-muted">{{ formatDateTime(req.createdAt) }}</span>
        </div>

        <div class="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          <a :href="`mailto:${req.email}`" class="flex items-center gap-2 text-primary">
            <UIcon name="i-lucide-mail" class="size-4 shrink-0 text-muted" />{{ req.email }}
          </a>
          <a :href="`tel:${req.phone}`" class="flex items-center gap-2 text-primary">
            <UIcon name="i-lucide-phone" class="size-4 shrink-0 text-muted" />{{ req.phone }}
          </a>
          <span class="flex items-center gap-2">
            <UIcon name="i-lucide-map-pin" class="size-4 shrink-0 text-muted" />{{ req.address }}, {{ req.city }}
          </span>
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          <UBadge size="sm" variant="subtle" color="primary" :label="req.preferred" icon="i-lucide-video" />
          <UBadge size="sm" variant="subtle" color="info" :label="req.priority" icon="i-lucide-star" />
        </div>

        <p v-if="req.message" class="mt-3 rounded-xl border border-default p-2.5 text-sm text-muted whitespace-pre-line">
          {{ req.message }}
        </p>
      </UCard>

      <div class="flex justify-between items-center">
        <Showing :meta="demoRequestsMeta" />
        <UPagination size="sm" v-model:page="page" :page-size="demoRequestsMeta.size"
          :items-per-page="demoRequestsMeta.size" :total="demoRequestsMeta.total" show-edges />
      </div>
    </template>
  </div>
</template>
