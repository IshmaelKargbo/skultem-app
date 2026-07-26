<template>
  <div class="space-y-4">
    <!-- Loading -->
    <template v-if="loading">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        <UCard
          v-for="i in 6"
          :key="i"
          class="overflow-hidden rounded-3xl border border-gray-200 shadow-sm dark:border-gray-800"
        >
          <div class="space-y-5 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <USkeleton class="size-12 rounded-xl" />

                <div class="space-y-2">
                  <USkeleton class="h-3 w-28" />
                  <USkeleton class="h-2 w-20" />
                </div>
              </div>

              <USkeleton class="h-6 w-16 rounded-full" />
            </div>

            <div class="grid grid-cols-3 gap-2">
              <USkeleton class="h-16 rounded-xl" />
              <USkeleton class="h-16 rounded-xl" />
              <USkeleton class="h-16 rounded-xl" />
            </div>

            <div class="flex items-center gap-3">
              <USkeleton class="size-9 rounded-full" />

              <div class="space-y-2">
                <USkeleton class="h-3 w-24" />
                <USkeleton class="h-2 w-16" />
              </div>
            </div>
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
          class="group overflow-hidden rounded-3xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          :ui="{ body: 'p-0' }"
        >
          <!-- Header -->
          <div class="relative overflow-hidden">
            <div class="flex items-start justify-between p-5">
              <div class="flex items-center gap-4">
                <div
                  class="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                >
                  <UIcon name="i-lucide-school" class="size-10" />
                </div>

                <div>
                  <h3 class="text-base font-semibold">
                    {{ item.clazz }}
                  </h3>

                  <div class="mt-1 flex items-center gap-2 text-xs text-muted">
                    <UIcon name="i-lucide-graduation-cap" />

                    {{ item.grade }}

                    <span>•</span>

                    {{ parseLevel[item.classLevel] }}
                  </div>
                </div>
              </div>

              <UBadge color="primary" variant="soft" size="lg">
                {{ item.totalStudent }}
                Students
              </UBadge>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-3">
            <div class="rounded-xl border border-default p-3">
              <div class="flex space-x-2">
                <UIcon name="i-lucide-layout-grid" class="mb-2 text-primary" />

                <p class="text-xs text-muted">Section</p>
              </div>
              <p class="font-semibold">
                {{ item.sectionName || "N/A" }}
              </p>
            </div>

            <div class="rounded-xl border border-default p-3">
              <div class="flex space-x-2">
                <UIcon name="i-lucide-git-branch" class="mb-2 text-emerald-500" />

                <p class="text-xs text-muted">Stream</p>
              </div>

              <p class="font-semibold">
                {{ item.streamName || "N/A" }}
              </p>
            </div>

            <div class="rounded-xl border border-default p-3">
              <div class="flex space-x-2">
                <UIcon name="i-lucide-layers-3" class="mb-2 text-orange-500" />

                <p class="text-xs text-muted">Level</p>
              </div>
              <p class="font-semibold">
                {{ parseLevel[item.classLevel] }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-between border-t border-default px-5 py-4"
          >
            <div class="flex items-center gap-3">
              <UAvatar size="xl" :alt="item.teacherName" />

              <div>
                <p class="font-medium">
                  {{ item.teacherName }}
                </p>

                <p class="text-xs text-muted">Class Teacher</p>
              </div>
            </div>

            <UButton
              icon="i-lucide-arrow-right"
              color="neutral"
              variant="ghost"
              class="transition-all sm:opacity-0 sm:group-hover:translate-x-1 sm:group-hover:opacity-100"
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
