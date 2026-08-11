<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute();
const router = useRouter();
const store = useStreamSubjectStore();
const { records: data, meta, loading } = storeToRefs(store);

const columns = [
  {
    accessorKey: "streamName",
    header: "Stream",
  },
  {
    accessorKey: "subjectName",
    header: "Subject",
  },
  {
    accessorKey: "groupName",
    header: "Group",
  },
];

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val }),
});

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val }),
});

async function fetchRecord() {
  loading.value = true;
  await store.fetchAll(page.value, size.value);
  loading.value = false;
}

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery };

  if (merged.page === route.query.page && merged.size === route.query.size) {
    return;
  }

  router.replace({ query: merged });
}

watch(
  () => page.value,
  () => {
    router.replace({
      query: {
        page: page.value,
      },
    });

    fetchRecord();
  },
  { immediate: true }
);

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
      },
    });
  }

  fetchRecord();
});
</script>
<template>
  <div class="space-y-4">
    <TableViewToggle v-model="view" />

    <UCard
      v-if="view === 'table'"
      class="hidden md:block"
      :ui="{
        body: 'sm:p-0',
      }"
    >
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-muted" aria-hidden="true" />
            <p class="text-muted">No stream subject found.</p>
          </div>
        </template>
        <template #mandatory-cell="{ row }">
          <div class="flex items-center gap-2">
            <USwitch v-model="row.original.mandatory" disabled />
            <UBadge
              v-if="row.original.locked"
              variant="outline"
              color="error"
              label="Locked"
            />
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
      </UTable>

      <template #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />
          <UPagination
            v-model:page="page"
            size="sm"
            :page-size="meta.size"
            :items-per-page="meta.size"
            :total="meta.total"
            show-edges
          />
        </div>
      </template>
    </UCard>

    <div class="space-y-4" :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
      <template v-if="loading">
        <UCard
          v-for="i in 4"
          :key="i"
          class="overflow-hidden rounded-3xl border border-default bg-default shadow-sm"
        >
          <div class="space-y-4 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <USkeleton class="size-12 rounded-2xl" />
                <div class="space-y-2">
                  <USkeleton class="h-3 w-28" />
                  <USkeleton class="h-2 w-20" />
                </div>
              </div>
              <USkeleton class="size-8 rounded-xl" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <USkeleton class="h-16 rounded-2xl" />
              <USkeleton class="h-16 rounded-2xl" />
              <USkeleton class="h-16 rounded-2xl" />
              <USkeleton class="h-16 rounded-2xl" />
            </div>
          </div>
        </UCard>
      </template>

      <template v-else-if="data?.length">
        <UCard
          v-for="item in data"
          :key="item.id"
          class="overflow-hidden rounded-3xl border border-default bg-default shadow-sm"
          :ui="{
            body: 'p-0',
          }"
        >
          <div class="border-b border-default p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <div
                  class="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                >
                  <UIcon name="i-lucide-book-open" class="size-6" aria-hidden="true" />
                </div>

                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-highlighted">
                    {{ item.subjectName }}
                  </p>

                  <p class="truncate text-xs text-muted">
                    {{ item.streamName || "No stream" }}
                  </p>
                </div>
              </div>

              <UIcon
                :name="item.locked ? 'i-lucide-lock' : 'i-lucide-lock-open'"
                :class="['size-5 shrink-0', item.locked ? 'text-error' : 'text-success']"
                :aria-label="item.locked ? 'Locked' : 'Active'"
              />
            </div>
          </div>
<div class="grid grid-cols-2 gap-3 p-4">
  <!-- Subject Type -->
  <div
    class="min-w-0 rounded-2xl border border-primary-200 bg-primary-50 p-3 dark:border-primary-500/20 dark:bg-primary-500/10"
  >
    <div class="mb-2 flex items-center gap-2">
      <div
        class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20"
      >
        <UIcon
          name="i-lucide-book-open-check"
          class="size-4 text-primary-600 dark:text-primary-400"
        />
      </div>

      <p
        class="text-[10px] font-medium uppercase tracking-wide text-primary-700 dark:text-primary-300"
      >
        Subject Type
      </p>
    </div>

    <UBadge
      variant="soft"
      size="sm"
      :color="item.mandatory ? 'success' : 'info'"
      :label="item.mandatory ? 'Core' : 'Optional'"
    />
  </div>

  <!-- Group -->
  <div
    class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10"
  >
    <div class="mb-2 flex items-center gap-2">
      <div
        class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20"
      >
        <UIcon
          name="i-lucide-layers-3"
          class="size-4 text-violet-600 dark:text-violet-400"
        />
      </div>

      <p
        class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300"
      >
        Group
      </p>
    </div>

    <p class="truncate text-sm font-semibold text-violet-900 dark:text-violet-100">
      {{ item.groupName || "N/A" }}
    </p>
  </div>

  <!-- Status -->
  <div
    class="col-span-2 flex items-center justify-between rounded-2xl border p-3"
    :class="
      item.locked
        ? 'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10'
        : 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10'
    "
  >
    <div class="flex min-w-0 items-center gap-3">
      <div
        class="flex size-8 shrink-0 items-center justify-center rounded-xl"
        :class="
          item.locked
            ? 'bg-red-100 dark:bg-red-500/20'
            : 'bg-emerald-100 dark:bg-emerald-500/20'
        "
      >
        <UIcon
          :name="item.locked ? 'i-lucide-lock' : 'i-lucide-circle-check'"
          class="size-4"
          :class="
            item.locked
              ? 'text-red-600 dark:text-red-400'
              : 'text-emerald-600 dark:text-emerald-400'
          "
        />
      </div>

      <div class="min-w-0">
        <p
          class="text-[10px] font-medium uppercase tracking-wide"
          :class="
            item.locked
              ? 'text-red-700 dark:text-red-300'
              : 'text-emerald-700 dark:text-emerald-300'
          "
        >
          Status
        </p>

        <p class="mt-0.5 text-sm font-semibold text-highlighted">
          {{ item.locked ? "Subject is locked" : "Subject is active" }}
        </p>
      </div>
    </div>

    <UBadge
      variant="soft"
      size="sm"
      :color="item.locked ? 'error' : 'success'"
      :label="item.locked ? 'Locked' : 'Active'"
    />
  </div>
</div>
        </UCard>
      </template>

      <template v-else>
        <UCard class="rounded-3xl col-span-full">
          <div class="flex flex-col items-center justify-center py-14">
            <UIcon name="ph:books-light" class="mb-3 text-4xl text-muted" aria-hidden="true" />
            <p class="text-sm text-muted">No stream subject found.</p>
          </div>
        </UCard>
      </template>

      <div
        v-if="!loading && data?.length"
        class="col-span-full flex flex-col items-center gap-3 pt-2 md:flex-row md:justify-between"
      >
        <Showing :meta="meta" />
        <UPagination
          v-model:page="page"
          size="sm"
          :page-size="meta.size"
          :items-per-page="meta.size"
          :total="meta.total"
          show-edges
        />
      </div>
    </div>
  </div>
</template>