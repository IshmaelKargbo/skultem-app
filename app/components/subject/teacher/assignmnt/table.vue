<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const store = useTeacherSubjectStore();
const { records: data, meta, loading } = storeToRefs(store);
const scrollContainer = inject<Ref<HTMLElement | null>>("scrollContainer");

const columns = [
  {
    accessorKey: "className",
    header: "Class",
  },
  {
    accessorKey: "sectionName",
    header: "Section",
  },
  {
    accessorKey: "streamName",
    header: "Stream",
  },
  {
    accessorKey: "subjectName",
    header: "Subject",
  },
  {
    accessorKey: "teacherName",
    header: "Teacher",
  },
  {
    accessorKey: "assignedAt",
    header: "Assign On",
    cell: ({ row }: any) => {
      return formatDate(row.original.assignedAt);
    },
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
    nextTick(() => {
      scrollContainer?.value?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
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
    <!-- Desktop -->
    <UCard
      class="hidden md:block"
      :ui="{
        body: 'sm:p-0',
      }"
    >
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />

            <p class="text-gray-500">No teacher assignments found.</p>
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

    <!-- Mobile -->
    <div class="space-y-4 md:hidden">
      <template v-if="loading">
        <UCard
          v-for="i in 4"
          :key="i"
          class="overflow-hidden rounded-[28px]"
          :ui="{ body: 'p-0' }"
        >
          <div class="p-5">
            <div class="flex items-center gap-4">
              <USkeleton class="size-14 rounded-2xl" />

              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-40" />
                <USkeleton class="h-3 w-28" />
              </div>

              <USkeleton class="h-7 w-20 rounded-full" />
            </div>
          </div>

          <div
            class="grid grid-cols-2 gap-3 border-t border-gray-200 dark:border-gray-800 p-4"
          >
            <USkeleton v-for="j in 4" :key="j" class="h-24 rounded-2xl" />
          </div>

          <div
            class="flex justify-between border-t border-gray-200 dark:border-gray-800 p-4"
          >
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-9 w-20 rounded-xl" />
          </div>
        </UCard>
      </template>

      <!-- Mobile Cards -->
      <template v-else-if="data?.length">
        <UCard
          v-for="item in data"
          :key="item.id"
          class="group overflow-hidden rounded-[28px] border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          :ui="{ body: 'p-0' }"
        >
          <!-- Header -->
          <div class="border-b border-gray-200 dark:border-gray-800 p-5">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-4">
                <div
                  class="flex size-10 items-center justify-center rounded-2xl bg-primary/10"
                >
                  <UIcon :name="SCHEME_ICON" class="size-5 text-primary" />
                </div>

                <div class="min-w-0">
                  <h3 class="truncate text-base font-semibold text-highlighted">
                    {{ item.subjectName }}
                  </h3>

                  <div class="flex items-center  text-sm text-muted">
                    {{ item.teacherName }}
                  </div>
                </div>
              </div>

              <UBadge color="primary" variant="soft">
                {{ item.className }}
              </UBadge>
            </div>
          </div>

          <!-- Information -->
          <div class="grid grid-cols-2 gap-3 p-4">
            <!-- Class -->
            <div
              class="rounded-2xl border border-violet-100 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10"
            >
              <div class="mb-3 flex items-center gap-2">
                <div
                  class="flex size-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20"
                >
                  <UIcon
                    name="i-lucide-school"
                    class="size-4 text-violet-600 dark:text-violet-400"
                  />
                </div>

                <span class="text-[11px] uppercase tracking-wide text-muted">
                  Class
                </span>
              </div>

              <p class="font-semibold">
                {{ item.className || "N/A" }}
              </p>
            </div>

            <!-- Section -->
            <div
              class="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10"
            >
              <div class="mb-3 flex items-center gap-2">
                <div
                  class="flex size-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20"
                >
                  <UIcon
                    name="i-lucide-layout-grid"
                    class="size-4 text-blue-600 dark:text-blue-400"
                  />
                </div>

                <span class="text-[11px] uppercase tracking-wide text-muted">
                  Section
                </span>
              </div>

              <p class="font-semibold">
                {{ item.sectionName || "N/A" }}
              </p>
            </div>

            <!-- Stream -->
            <div
              class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10"
            >
              <div class="mb-3 flex items-center gap-2">
                <div
                  class="flex size-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20"
                >
                  <UIcon
                    name="i-lucide-git-branch"
                    class="size-4 text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <span class="text-[11px] uppercase tracking-wide text-muted">
                  Stream
                </span>
              </div>

              <p class="font-semibold">
                {{ item.streamName || "N/A" }}
              </p>
            </div>

            <!-- Assigned -->
            <div
              class="rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10"
            >
              <div class="mb-3 flex items-center gap-2">
                <div
                  class="flex size-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20"
                >
                  <UIcon
                    name="i-lucide-calendar-days"
                    class="size-5 text-amber-600 dark:text-amber-400"
                  />
                </div>

                <span class="text-[11px] uppercase tracking-wide text-muted">
                  Assigned
                </span>
              </div>

              <p class="text-sm font-semibold">
                {{ formatDate(item.assignedAt) }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 px-5 py-4"
          >
            <div class="flex items-center space-x-3">
                <UAvatar size="lg" :alt="item.teacherName" />

              <div class="flex flex-col space-x-3">
                <p class="text-[15px] font-medium">{{ item.teacherName }}</p>
                <p class="text-xs text-muted">Subject Teacher</p>
              </div>
            </div>
          </div>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else>
        <div class="flex flex-col items-center justify-center py-14">
          <div
            class="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
          >
            <UIcon name="ph:books-light" class="text-3xl text-gray-400" />
          </div>

          <p class="text-sm font-medium text-gray-900 dark:text-white">
            No teacher assignments found
          </p>

          <p class="mt-1 text-xs text-gray-500">
            Assigned teacher subjects will appear here.
          </p>
        </div>
      </template>

      <!-- Mobile Pagination -->
      <UCard class="md:hidden">
        <div class="flex items-center justify-center flex-col">
          <UPagination
            v-model:page="page"
            size="md"
            :page-size="meta.size"
            :items-per-page="meta.size"
            :total="meta.total"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>
