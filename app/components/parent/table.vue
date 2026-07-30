<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from "vue";

const route = useRoute();
const router = useRouter();

const store = useParentStore();
const { records: data, meta, loading } = storeToRefs(store);

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  DELETED: "Deleted",
};

const STATUS_COLORS: Record<string, any> = {
  ACTIVE: "success",
  INACTIVE: "warning",
  DELETED: "error",
};

const columns = [
  {
    accessorKey: "name",
    header: "Guardian",
  },
  {
    accessorKey: "students",
    header: "Students",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "street",
    header: "Street",
  },
  {
    accessorKey: "city",
    header: "City",
  },
];

const page = computed<number>({
  get: () => Number(route.query.page || 1),
  set: (value) => {
    updateQuery({
      page: value,
    });
  },
});

const size = computed<number>({
  get: () => Number(route.query.size || runtimeConf().limit),
  set: (value) => {
    updateQuery({
      size: value,
    });
  },
});

function updateQuery(query: Record<string, any>) {
  router.replace({
    query: {
      ...route.query,
      ...query,
    },
  });
}

async function fetchRecords() {
  try {
    loading.value = true;

    await store.fetchAll(page.value, size.value);
  } catch (error) {
    console.error("Failed to fetch parents:", error);
  } finally {
    loading.value = false;
  }
}

watch(
  [page, size],
  async () => {
    await fetchRecords();
  },
  {
    immediate: true,
  }
);

onMounted(() => {
  if (!route.query.page || !route.query.size) {
    updateQuery({
      page: page.value,
    });
  }
});
</script>
<template>
  <UCard
    class="hidden overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 md:block"
    :ui="{
      body: 'sm:p-0',
    }"
  >
    <UTable :columns="columns" :data="data" :loading="loading" class="min-w-full">
      <template #empty-state>
        <div class="flex flex-col items-center justify-center py-14">
          <UIcon name="i-lucide-users" class="mb-3 size-10 text-gray-400" />

          <p class="text-sm text-gray-500">No parents found</p>
        </div>
      </template>
      <template #name-cell="{ row }">
        <div>
          <p>{{ row.original.name }}</p>
          <p class="text-xs text-muted">{{ row.original.email }}</p>
        </div>
      </template>
      <template #students-cell="{ row }">
        <UBadge :label="`${row.original.students} Students`" variant="outline" />
      </template>
      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
    </UTable>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-between">
        <Showing :meta="meta" />

        <UPagination
          v-model:page="page"
          size="sm"
          :page-size="meta?.size || 10"
          :items-per-page="meta?.size || 10"
          :total="meta?.total || 0"
          show-edges
        />
      </div>
    </template>
  </UCard>

  <!-- Mobile -->
  <div class="space-y-4 md:hidden">
    <!-- Loading -->
    <template v-if="loading">
      <UCard v-for="i in 4" :key="i" class="overflow-hidden">
        <div class="space-y-5 p-4">
          <div class="flex items-center justify-between">
            <div class="flex min-w-0 items-center gap-3">
              <USkeleton class="size-12 rounded-2xl" />

              <div class="space-y-2">
                <USkeleton class="h-3 w-28" />
                <USkeleton class="h-2 w-20" />
              </div>
            </div>

            <USkeleton class="h-6 w-16 rounded-full" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <USkeleton class="h-16 rounded-2xl" />
            <USkeleton class="h-16 rounded-2xl" />
            <USkeleton class="h-16 rounded-2xl" />
            <USkeleton class="h-16 rounded-2xl" />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex min-w-0 items-center gap-3">
              <USkeleton class="size-9 rounded-full" />

              <div class="space-y-2">
                <USkeleton class="h-3 w-24" />
                <USkeleton class="h-2 w-16" />
              </div>
            </div>

            <USkeleton class="size-6 rounded-xl" />
          </div>
        </div>
      </UCard>
    </template>

    <template v-else-if="data?.length">
      <UCard
        v-for="parent in data"
        :key="parent.id"
        class="group overflow-hidden rounded-[28px] border border-gray-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900"
        :ui="{ body: 'p-0' }"
      >
        <!-- Hero -->
        <div
          class="relative overflow-hidden px-5 py-5 border-b border-gray-200 dark:border-gray-800"
        >
          <div class="relative flex items-start justify-between">
            <div class="flex space-x-4">
              <UAvatar icon="i-lucide-user" size="xl" class="rounded-2xl" />
              <div class="relative">
                <h3 class="text-lg font-bold">
                  {{ parent.name }}
                </h3>

                <div class="mt-1 flex items-center gap-2 text-xs">
                  <span class="truncate">{{ parent.email }}</span>
                </div>
              </div>
            </div>

            <UBadge
              :label="STATUS_LABELS[parent.status]"
              :color="STATUS_COLORS[parent.status]"
              variant="solid"
              class="rounded-full"
            />
          </div>
        </div>

        <!-- Information -->
        <div class="grid grid-cols-2 gap-3 p-4">
          <!-- Students -->
          <div class="rounded-2xl bg-gray-100 p-3 dark:bg-neutral-800">
            <div class="mb-2 flex items-center gap-2">
              <div
                class="flex size-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/15"
              >
                <UIcon name="i-lucide-graduation-cap" class="size-4 text-primary" />
              </div>

              <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Students
              </p>
            </div>

            <p class="text-lg font-semibold">
              {{ parent.students }}
            </p>
          </div>

          <!-- Phone -->
          <div class="rounded-2xl bg-gray-100 p-3 dark:bg-neutral-800">
            <div class="mb-2 flex items-center gap-2">
              <div
                class="flex size-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15"
              >
                <UIcon
                  name="i-lucide-phone"
                  class="size-4 text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Phone
              </p>
            </div>

            <p class="truncate text-sm font-medium">
              {{ parent.phone || "N/A" }}
            </p>
          </div>

          <!-- City -->
          <div class="rounded-2xl bg-gray-100 p-3 dark:bg-neutral-800">
            <div class="mb-2 flex items-center gap-2">
              <div
                class="flex size-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/15"
              >
                <UIcon
                  name="i-lucide-map-pinned"
                  class="size-4 text-amber-600 dark:text-amber-400"
                />
              </div>

              <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                City
              </p>
            </div>

            <p class="truncate text-sm font-medium">
              {{ parent.city || "N/A" }}
            </p>
          </div>

          <!-- Street -->
          <div class="rounded-2xl bg-gray-100 p-3 dark:bg-neutral-800">
            <div class="mb-2 flex items-center gap-2">
              <div
                class="flex size-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/15"
              >
                <UIcon
                  name="i-lucide-map"
                  class="size-4 text-violet-600 dark:text-violet-400"
                />
              </div>

              <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Street
              </p>
            </div>

            <p class="truncate text-sm font-medium">
              {{ parent.street || "N/A" }}
            </p>
          </div>
        </div>
        <!-- Footer -->
        <div
          class="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-800"
        >
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex size-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/15"
            >
              <UIcon name="i-lucide-users" class="size-5 text-primary" />
            </div>

            <div class="min-w-0">
              <p class="truncate text-sm font-medium">
                {{ parent.students }} Student{{ parent.students === 1 ? "" : "s" }}
              </p>

              <p class="truncate text-xs text-gray-500">Linked to this guardian</p>
            </div>
          </div>

          <UButton
            label="View"
            trailing-icon="i-lucide-chevron-right"
            variant="ghost"
            class="rounded-xl"
          />
        </div>
      </UCard>
    </template>

    <!-- Empty -->
    <template v-else>
      <div class="flex flex-col items-center justify-center py-14">
        <UIcon name="i-lucide-users" class="mb-3 size-10 text-gray-400" />

        <p class="text-sm text-gray-500">No parents found</p>
      </div>
    </template>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-3 md:hidden">
      <Showing :meta="meta" />
      <UPagination
        size="sm"
        v-model:page="page"
        :page-size="meta.size"
        :items-per-page="meta.size"
        :total="meta.total"
        show-edges
      />
    </div>
  </div>
</template>
