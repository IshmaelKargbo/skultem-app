<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const store = useSectionStore();
const loading = ref(true);
const { records: data, meta } = storeToRefs(store);

const editRcord = ref<Section | null>(null);
const editState = ref(false);

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
];

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val }),
});

const size = computed<number>({
  get: () => Number(route.query.size ?? 6),
  set: (val) => updateQuery({ size: val }),
});

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery };

  if (merged.page === route.query.page && merged.size === route.query.size) {
    return;
  }

  router.replace({ query: merged });
}

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
      },
    });
  }

  loading.value = true;
  await store.fetchAll(page.value, size.value);
  loading.value = false;
});
</script>
<template>
  <UCard
    class="hidden md:block"
    :ui="{
      body: 'sm:p-0',
    }"
  >
    <!-- Desktop Table -->
    <div>
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />

            <p class="text-gray-500">No sections found.</p>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
      </UTable>
    </div>

    <template #footer>
      <!-- Footer -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Showing :meta="meta" />

        <div class="overflow-x-auto">
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
    </template>
  </UCard>
  
  <!-- Mobile -->
  <div class="space-y-4 md:hidden">
    <!-- Loading -->
    <template v-if="loading">
      <UCard
        v-for="i in 5"
        :key="i"
        class="overflow-hidden rounded-[28px]"
        :ui="{ body: 'p-0' }"
      >
        <!-- Header -->
        <div class="border-b border-default p-5">
          <div class="flex items-center gap-4">
            <USkeleton class="size-14 rounded-2xl" />

            <div class="flex-1 space-y-2">
              <USkeleton class="h-5 w-36 rounded-md" />
              <USkeleton class="h-3 w-24 rounded" />
            </div>

            <USkeleton class="h-6 w-16 rounded-full" />
          </div>
        </div>

        <!-- Body -->
        <div class="p-5">
          <div class="rounded-2xl border border-default p-4">
            <div class="mb-3 flex items-center gap-2">
              <USkeleton class="size-8 rounded-lg" />
              <USkeleton class="h-3 w-24 rounded" />
            </div>

            <div class="space-y-2">
              <USkeleton class="h-4 w-full rounded" />
              <USkeleton class="h-4 w-4/5 rounded" />
              <USkeleton class="h-4 w-2/3 rounded" />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-default px-5 py-4">
          <div class="flex items-center gap-2">
            <USkeleton class="size-8 rounded-lg" />
            <div class="space-y-1">
              <USkeleton class="h-3 w-20 rounded" />
              <USkeleton class="h-2 w-28 rounded" />
            </div>
          </div>

          <USkeleton class="size-10 rounded-xl" />
        </div>
      </UCard>
    </template>

    <!-- Empty -->
    <template v-else-if="!data?.length">
      <UCard class="overflow-hidden rounded-[28px]" :ui="{ body: 'p-8' }">
        <div class="flex flex-col items-center text-center">
          <div
            class="mb-5 flex size-20 items-center justify-center rounded-3xl bg-primary/10"
          >
            <UIcon name="i-lucide-layout-template" class="size-10 text-primary" />
          </div>

          <h3 class="text-lg font-semibold">No Sections Yet</h3>

          <p class="mt-2 max-w-xs text-sm text-muted">
            Create academic sections to organize classes and improve your school
            structure.
          </p>
        </div>
      </UCard>
    </template>

    <!-- Cards -->
    <template v-else>
      <UCard
        v-for="item in data"
        :key="item.id"
        class="group overflow-hidden rounded-[28px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        :ui="{ body: 'p-0' }"
      >
        <!-- Header -->
        <div class="border-b border-default p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-4">
              <div
                class="flex size-10 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary group-hover:text-white"
              >
                <UIcon
                  name="i-lucide-layout-template"
                  class="size-5 text-primary group-hover:text-white"
                />
              </div>

              <div>
                <h3 class="text-base font-bold">
                  {{ item.name }}
                </h3>
              </div>
            </div>

            <UBadge label="Active" color="success" variant="soft" />
          </div>
        </div>

        <!-- Description -->
        <div class="p-5">
          <div
            class="rounded-2xl border border-default bg-gray-100 p-4 dark:bg-neutral-800"
          >
            <div class="mb-3 flex items-center gap-2">
              <div
                class="flex size-8 items-center justify-center rounded-lg bg-primary/10"
              >
                <UIcon name="i-lucide-file-text" class="size-4 text-primary" />
              </div>

              <span class="text-[11px] font-medium uppercase tracking-wide text-muted">
                Description
              </span>
            </div>

            <p class="line-clamp-3 text-sm leading-6 text-toned">
              {{ item.description || "No description available." }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-default px-5 py-4">
          <div class="flex items-center gap-2">
            <div
              class="flex size-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15"
            >
              <UIcon
                name="i-lucide-check-circle-2"
                class="size-4 text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div>
              <p class="text-xs font-medium">Academic Structure</p>

              <p class="text-[11px] text-muted">Used in class organization</p>
            </div>
          </div>

          <!-- <UButton
          square
          color="neutral"
          variant="ghost"
          icon="i-lucide-chevron-right"
          class="rounded-xl transition-all group-hover:translate-x-1"
        /> -->
        </div>
      </UCard>
    </template>

    <!-- Pagination -->
    <div
      v-if="!loading && data?.length && meta.total > meta.size"
      class="flex flex-col items-center gap-3 pt-3"
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
</template>
