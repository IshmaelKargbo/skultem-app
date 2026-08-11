<template>
  <div class="space-y-5">
    <TableViewToggle v-model="view" />

    <!-- Loading -->
    <template v-if="loading">
      <!-- Desktop -->
      <div v-if="view === 'table'" class="hidden md:block">
        <UCard :ui="{ body: 'sm:p-0' }">
          <TableLoading :size="columns.length" />
        </UCard>
      </div>

      <!-- Mobile -->
      <div
        class="space-y-4"
        :class="
          view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'
        "
      >
        <UCard
          v-for="i in 6"
          :key="i"
          class="overflow-hidden rounded-3xl border border-default"
          :ui="{ body: 'p-0' }"
        >
          <!-- Header -->
          <div class="flex items-start justify-between p-5">
            <div class="flex flex-1 items-center gap-4">
              <USkeleton class="size-12 rounded-2xl" />

              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-36 rounded-full" />
                <USkeleton class="h-3 w-24 rounded-full" />
              </div>
            </div>

            <USkeleton class="size-9 rounded-xl" />
          </div>

          <!-- Description -->
          <div class="space-y-2 px-5">
            <USkeleton class="h-3 w-full rounded-full" />
            <USkeleton class="h-3 w-5/6 rounded-full" />
            <USkeleton class="h-3 w-3/5 rounded-full" />
          </div>

          <!-- Info Cards -->
          <div class="mt-5 grid grid-cols-2 gap-3 px-5 pb-5">
            <div class="rounded-2xl border border-default p-3">
              <USkeleton class="mb-3 size-4 rounded-full" />
              <USkeleton class="h-3 w-14 rounded-full" />
              <USkeleton class="mt-2 h-4 w-20 rounded-full" />
            </div>

            <div class="rounded-2xl border border-default p-3">
              <USkeleton class="mb-3 size-4 rounded-full" />
              <USkeleton class="h-3 w-14 rounded-full" />
              <USkeleton class="mt-2 h-4 w-20 rounded-full" />
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-between border-t border-default px-5 py-4"
          >
            <USkeleton class="h-3 w-24 rounded-full" />
            <USkeleton class="size-5 rounded-full" />
          </div>
        </UCard>
      </div>
    </template>

    <!-- Data -->
    <template v-else-if="data.length">
      <!-- Desktop -->
      <UCard v-if="view === 'table'" class="hidden md:block" :ui="{ body: 'sm:p-0' }">
        <UTable :columns="columns" :data="data" :loading="loading">
          <template #empty-state>
            <div class="flex flex-col items-center gap-2 py-10">
              <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
              <p class="text-gray-500">No stream subject found.</p>
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
      <div
        class="space-y-4"
        :class="
          view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'
        "
      >
        <UCard
          v-for="value in data"
          :key="value.id"
          class="group overflow-hidden rounded-[28px] border border-default bg-white shadow transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-500 hover:shadow-sm dark:bg-neutral-900"
          :ui="{ body: 'p-0' }"
        >
          <!-- Header -->
          <div class="border-b border-default p-3 md:p-0 md:pb-3">
            <div class="flex items-start justify-between gap-4">
              <div class="flex min-w-0 items-center gap-4">
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"
                >
                  <UIcon name="i-lucide-book-open" class="size-5 text-primary" />
                </div>

                <div class="min-w-0">
                  <h3 class="truncate text-base font-semibold text-highlighted">
                    {{ value.name }}
                  </h3>
                </div>
              </div>

              <!-- <UButton
                icon="i-lucide-chevron-right"
                color="neutral"
                variant="ghost"
                square
                class="rounded-xl transition-transform group-hover:translate-x-1"
              /> -->
            </div>
          </div>

         <div class="p-4">
          <!-- Description -->
          <div class="">
            <div
              class="rounded-2xl border border-default bg-gray-100 p-4 dark:bg-neutral-800"
            >
              <div class="mb-3 flex items-center gap-2">
                <div
                  class="flex size-7 items-center justify-center rounded-lg bg-primary/10"
                >
                  <UIcon name="i-lucide-file-text" class="size-4 text-primary" />
                </div>

                <p class="text-xs font-medium uppercase tracking-wide text-muted">
                  Description
                </p>
              </div>

              <p class="line-clamp-3 text-sm leading-6 text-highlighted">
                {{ value.description || "No description available for this subject." }}
              </p>
            </div>
          </div>

          <!-- Information -->
          <div class="grid grid-cols-2 gap-3 py-2">
            <!-- Code -->
            <div
              class="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10"
            >
              <div class="mb-3 flex items-center gap-2">
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20"
                >
                  <UIcon
                    name="i-lucide-hash"
                    class="size-4 text-indigo-600 dark:text-indigo-400"
                  />
                </div>

                <span
                  class="text-[11px] font-medium uppercase tracking-wide text-indigo-700 dark:text-indigo-300"
                >
                  Code
                </span>
              </div>

              <p class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {{ value.code }}
              </p>
            </div>

            <!-- Type -->
            <div
              class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10"
            >
              <div class="mb-3 flex items-center gap-2">
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20"
                >
                  <UIcon
                    name="i-lucide-book-copy"
                    class="size-4 text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <span
                  class="text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
                >
                  Type
                </span>
              </div>

              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                Academic Subject
              </p>
            </div>
          </div>

         </div>
          <!-- Footer -->
          <div
            class="flex items-center justify-between border-t border-default p-3 md:p-0 md:pt-3"
          >
            <div class="flex items-center gap-2 text-xs text-muted">
              <UIcon name="i-lucide-school" class="size-4 text-primary" />

              Curriculum Subject
            </div>

            <!-- <div class="flex items-center gap-1 text-primary">
              <span class="text-xs font-medium"> View </span>

              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 transition-transform group-hover:translate-x-1"
              />
            </div> -->
          </div>
        </UCard>
           <div
        v-if="!loading && data?.length"
        class="flex flex-col md:flex-row md:justify-between md:w-full items-center gap-3 pt-2 col-span-full"
      >
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

    <!-- Empty -->
    <template v-else>
      <UCard>
        <div class="flex flex-col items-center justify-center py-16">
          <UIcon name="i-lucide-book-open" class="mb-4 size-12 text-muted" />

          <h3 class="font-semibold">No subjects found</h3>

          <p class="mt-1 text-sm text-muted">No records are available.</p>
        </div>
      </UCard>
    </template>
    <!-- Pagination -->
  </div>
</template>
<script setup lang="ts">
import { nextTick } from "vue";

const view = ref<"table" | "card">("table");
const route = useRoute();
const router = useRouter();

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
];
const store = useSubjectStore();

const { records: data, meta, loading } = storeToRefs(store);

const scrollContainer = inject<Ref<HTMLElement | null>>("scrollContainer");

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),

  set: (value) => {
    updateQuery({
      page: value,
    });
  },
});

const size = computed<number>({
  get: () => Number(route.query.size ?? 9),

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
  } finally {
    loading.value = false;
  }
}

watch(
  [page, size],
  async () => {
    nextTick(() => {
      scrollContainer?.value?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

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

  useAppStore().setTitle("Subjects");

  document.title = "Subjects | Skultem";
});

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER],
});
</script>
