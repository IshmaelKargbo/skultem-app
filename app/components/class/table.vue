<template>
  <div class="space-y-4">
    <!-- Loading -->
    <template v-if="loading">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        <UCard
          v-for="i in 6"
          :key="i"
          class="overflow-hidden rounded-[28px] border border-default"
          :ui="{ body: 'p-0' }"
        >
          <!-- Header -->
          <div
            class="border-b border-default p-5"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <USkeleton class="size-14 rounded-2xl" />

                <div class="space-y-2">
                  <USkeleton class="h-5 w-32 rounded-lg" />
                  <USkeleton class="h-3 w-24 rounded-lg" />
                </div>
              </div>

              <div class="space-y-2 text-right">
                <USkeleton class="ml-auto h-7 w-10 rounded-lg" />
                <USkeleton class="ml-auto h-3 w-16 rounded-lg" />
              </div>
            </div>
          </div>

          <!-- Information -->
          <div class="grid grid-cols-2 gap-3 p-5">
            <div
              v-for="j in 4"
              :key="j"
              class="rounded-2xl border border-default bg-gray-50 border border-gray-200 p-4 dark:bg-gray-800"
            >
              <div class="mb-3 flex items-center gap-2">
                <USkeleton class="size-8 rounded-lg" />
                <USkeleton class="h-3 w-16 rounded" />
              </div>

              <USkeleton class="h-5 w-24 rounded" />
            </div>
          </div>

          <!-- Teacher -->
          <div
            class="flex items-center justify-between border-t border-default px-5 py-4"
          >
            <div class="flex items-center gap-3">
              <USkeleton class="size-12 rounded-full" />

              <div class="space-y-2">
                <USkeleton class="h-4 w-32 rounded" />
                <USkeleton class="h-3 w-20 rounded" />
              </div>
            </div>

            <USkeleton class="size-10 rounded-xl" />
          </div>
        </UCard>
      </div>
    </template>

    <!-- Data -->
    <template v-else-if="data?.length">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        <UCard
          v-for="item in data"
          :key="item.id"
          class="group overflow-hidden  cursor-pointer border border-default bg-default shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow"
          :ui="{ body: 'p-0 sm:p-0' }"
        >
          <!-- Header -->
          <div class="relative overflow-hidden border-b border-default p-5">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div
                  class="flex size-11 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20"
                >
                  <UIcon name="i-lucide-school" class="size-6 text-primary" />
                </div>

                <div>
                  <h3 class="font-bold">
                    {{ item.clazz }}
                  </h3>

                  <div class="flex items-center gap-2 text-xs text-muted">
                    <UIcon name="i-lucide-graduation-cap" class="size-3.5" />
                    <span>{{ item.grade }}</span>

                    <span>•</span>

                    <span>{{ parseLevel[item.classLevel] }}</span>
                  </div>
                </div>
              </div>

              <div class="text-right">
                <p class="text-xl font-bold text-primary">
                  {{ item.totalStudent }}
                </p>
                <p class="text-xs uppercase tracking-wide text-muted">Students</p>
              </div>
            </div>
          </div>

          <!-- Information -->
          <div class="grid grid-cols-2 gap-3 p-5">
            <div class="rounded-2xl bg-gray-50 border border-gray-200 p-4 dark:bg-neutral-800">
              <div class="mb-3 flex items-center gap-2">
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-primary/10"
                >
                  <UIcon name="i-lucide-layout-grid" class="size-4 text-primary" />
                </div>

                <span class="text-[11px] uppercase tracking-wide text-muted">
                  Section
                </span>
              </div>

              <p class="font-semibold">
                {{ item.sectionName || "N/A" }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 border border-gray-200 p-4 dark:bg-neutral-800">
              <div class="mb-3 flex items-center gap-2">
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15"
                >
                  <UIcon name="i-lucide-git-branch" class="size-4 text-emerald-600" />
                </div>

                <span class="text-[11px] uppercase tracking-wide text-muted">
                  Stream
                </span>
              </div>

              <p class="font-semibold">
                {{ item.streamName || "N/A" }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 border border-gray-200 p-4 dark:bg-neutral-800">
              <div class="mb-3 flex items-center gap-2">
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/15"
                >
                  <UIcon name="i-lucide-layers-3" class="size-4 text-orange-600" />
                </div>

                <span class="text-[11px] uppercase tracking-wide text-muted">
                  Level
                </span>
              </div>

              <p class="font-semibold">
                {{ parseLevel[item.classLevel] }}
              </p>
            </div>

            <div class="rounded-2xl bg-primary-50 border-primary-200 p-4 dark:bg-primary-500/10">
              <div class="mb-3 flex items-center gap-2">
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-primary/10"
                >
                  <UIcon name="i-lucide-users" class="size-4 text-primary" />
                </div>

                <span class="text-[11px] uppercase tracking-wide text-muted">
                  Capacity
                </span>
              </div>

              <p class="text-lg font-bold text-primary">
                {{ item.totalStudent }}
              </p>
            </div>
          </div>

          <!-- Teacher -->
          <div
            class="flex items-center justify-between border-t border-default px-5 py-4"
          >
            <div class="flex items-center gap-3">
              <UAvatar size="lg" :alt="item.teacherName" />

              <div>
                <p class="font-semibold">
                  {{ item.teacherName || "No Teacher Assigned" }}
                </p>

                <p class="text-xs text-muted">Class Teacher</p>
              </div>
            </div>

            <UButton
              icon="i-lucide-arrow-right"
              color="neutral"
              variant="soft"
              square
              class="rounded-xl transition-all group-hover:translate-x-1"
            />
          </div>
        </UCard>
      </div>
    </template>

    <!-- Empty -->
    <template v-else>
      <UCard class="rounded-3xl border border-default shadow-sm">
        <div class="flex flex-col items-center justify-center py-14">
          <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400" />

          <p class="text-sm text-gray-500">No classes found</p>
        </div>
      </UCard>
    </template>

    <div class="mt-6">
      <div class="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
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
<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const store = useClassSessionStore();
const { records: data, meta, loading } = storeToRefs(store);

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (value) => updateQuery({ page: value }),
});

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (value) => updateQuery({ size: value }),
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

watch([page, size], fetchRecords, {
  immediate: true,
});

onMounted(() => {
  if (!route.query.page || !route.query.size) {
    updateQuery({
      page: page.value,
    });
  }
});
</script>
