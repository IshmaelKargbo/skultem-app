<template>
<div class="space-y-5">

  <!-- Loading -->
  <template v-if="loading">

    <!-- Desktop -->
    <div class="hidden md:block">
      <UCard :ui="{ body: 'sm:p-0' }">
        <TableLoading :size="columns.length" />
      </UCard>
    </div>

    <!-- Mobile -->
    <div class="space-y-4 md:hidden">
    <UCard
      v-for="i in 6"
      :key="i"
      class="overflow-hidden rounded-3xl border border-default"
      :ui="{ body: 'p-0' }"
    >
      <!-- Accent -->
      <USkeleton class="h-1 w-full rounded-none" />

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
      <div class="flex items-center justify-between border-t border-default px-5 py-4">
        <USkeleton class="h-3 w-24 rounded-full" />
        <USkeleton class="size-5 rounded-full" />
      </div>
    </UCard>
    </div>

  </template>

  <!-- Data -->
  <template v-else-if="data.length">

    <!-- Desktop -->
    <UCard
      class="hidden md:block"
      :ui="{ body: 'sm:p-0' }"
    >
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
    <div class="space-y-4 md:hidden">
      <UCard
        v-for="value in data"
        :key="value.id"
        class="group overflow-hidden rounded-3xl border border-default transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
        :ui="{ body: 'p-0' }"
      >
        <!-- Accent -->
        <div class="h-1 bg-primary" />

        <!-- Header -->
        <div class="flex items-start justify-between p-5">
          <div class="flex min-w-0 items-center gap-4">
            <div
              class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            >
              <UIcon name="i-lucide-book-open" class="size-6" />
            </div>

            <div class="min-w-0">
              <h3 class="truncate text-base font-semibold text-highlighted">
                {{ value.name }}
              </h3>

              <div class="mt-1 flex items-center gap-2 text-xs text-muted">
                <UBadge color="neutral" variant="soft" size="xs">
                  {{ value.code }}
                </UBadge>

                <span>•</span>

                <span>Subject</span>
              </div>
            </div>
          </div>

          <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" square />
        </div>

        <!-- Description -->
        <div class="px-5">
          <p class="line-clamp-3 text-sm leading-6 text-muted">
            {{ value.description || "No description available for this subject." }}
          </p>
        </div>

        <!-- Info -->
        <div class="mt-5 grid grid-cols-2 gap-3 px-5 pb-5">
          <div class="rounded-2xl border border-default bg-muted/20 p-3">
            <div class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-hash" class="size-4 text-primary" />
              <span class="text-xs text-muted"> Code </span>
            </div>

            <p class="font-medium">
              {{ value.code }}
            </p>
          </div>

          <div class="rounded-2xl border border-default bg-muted/20 p-3">
            <div class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-book-copy" class="size-4 text-primary" />
              <span class="text-xs text-muted"> Type </span>
            </div>

            <p class="font-medium">Subject</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-default px-5 py-3">
          <span class="text-xs text-muted"> Academic Subject </span>
        </div>
      </UCard>
    </div>

  </template>

  <!-- Empty -->
  <template v-else>

    <UCard>
      <div class="flex flex-col items-center justify-center py-16">

        <UIcon
          name="i-lucide-book-open"
          class="mb-4 size-12 text-muted"
        />

        <h3 class="font-semibold">
          No subjects found
        </h3>

        <p class="mt-1 text-sm text-muted">
          No records are available.
        </p>

      </div>
    </UCard>

  </template>

</div>
</template>
<script setup lang="ts">
import { nextTick } from "vue";

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
