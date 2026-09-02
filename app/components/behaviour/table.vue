<script setup lang="ts">
const classSession = useClassSessionStore()
const route = useRoute();
const router = useRouter();

const { state, selectable = true } = defineProps<{
  state: {
    classId: string
  }
  // Set to false when the parent already scopes and picks the class (e.g. a teacher
  // restricted to their own classes) so this component doesn't offer every class in the school.
  selectable?: boolean
}>();
const store = useBehaviourStore();
const { records: data, meta, loading } = storeToRefs(store);
const view = ref<'table' | 'card'>('table');
const reportRef = ref()

function refreshReport() {
  reportRef.value?.fetchRecord()
}

const classes = computed(() => classSession.records.map(e => ({
  label: parseClassSession(e),
  value: e.clazzId
})))

const columns = [
  {
    accessorKey: "student",
    header: "Student",
  },
  {
    accessorKey: "kind",
    header: "Type",
    cell: ({ row }: any) => parseBehaviourKind[row.original.kind],
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "note",
    header: "Note",
  },
];

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val }),
});

const size = ref(runtimeConf().limit);

async function fetchRecords() {
  if (state.classId == null) return;
  loading.value = true;
  await store.fetchAll(state.classId, page.value, size.value);
  loading.value = false;
}

watch(
  () => page.value,
  () => {
    router.replace({
      query: {
        page: page.value,
      },
    });

    fetchRecords();
  },
  { immediate: true }
);

watch(
  () => state.classId,
  () => fetchRecords(),
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

  fetchRecords();
  if (selectable) await classSession.fetchAll(0, 0)
});
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex justify-between">
        <div class="flex space-x-3 w-full">
          <USelectMenu v-if="selectable" :items="classes" v-model="state.classId" placeholder="Select class"
            value-key="value" />
          <BehaviourAdd @refresh="refreshReport" :clazz="state.classId" />
        </div>

        <TableViewToggle v-model="view" />
      </div>
    </template>
    <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />

          <p class="text-gray-500">No behaviour found.</p>
        </div>
      </template>

      <template #kind-cell="{ row }">
        <UBadge :label="parseBehaviourKind[row.original.kind]" :color="parseBehaviourKindColor[row.original.kind]"
          variant="outline" />
      </template>
    </UTable>
    <!-- Mobile -->
    <div class="p-4" :class="{ 'md:hidden': view === 'table' }">
      <!-- Loading -->
      <template v-if="loading">
        <div class="space-y-4"
          :class="{ 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3': view === 'card' }">
          <UCard v-for="i in 6" :key="i" class="overflow-hidden rounded-[28px]" :ui="{ body: 'p-0' }">
            <!-- Header -->
            <div class="border-b border-default p-5">
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-center gap-4">
                  <div class="relative">
                    <USkeleton class="size-14 rounded-full" />

                    <USkeleton
                      class="absolute -bottom-1 -right-1 size-6 rounded-full ring-2 ring-white dark:ring-neutral-900" />
                  </div>

                  <div class="space-y-2">
                    <USkeleton class="h-5 w-40 rounded-md" />

                    <div class="flex items-center gap-2">
                      <USkeleton class="size-3 rounded-full" />
                      <USkeleton class="h-3 w-20 rounded" />
                      <USkeleton class="size-1 rounded-full" />
                      <USkeleton class="h-3 w-16 rounded" />
                    </div>
                  </div>
                </div>

                <USkeleton class="h-7 w-20 rounded-full" />
              </div>
            </div>

            <!-- Behaviour Note -->
            <div class="p-3">
              <div class="rounded-2xl border border-default bg-gray-100 p-4 dark:bg-neutral-800">
                <div class="mb-3 flex items-center gap-3">
                  <USkeleton class="size-8 rounded-lg" />
                  <USkeleton class="h-3 w-28 rounded" />
                </div>

                <div class="space-y-2">
                  <USkeleton class="h-4 w-full rounded" />
                  <USkeleton class="h-4 w-full rounded" />
                  <USkeleton class="h-4 w-3/4 rounded" />
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between border-t border-default px-5 py-4">
              <div class="flex items-center gap-2">
                <USkeleton class="size-4 rounded" />
                <USkeleton class="h-3 w-28 rounded" />
              </div>

              <USkeleton class="size-10 rounded-xl" />
            </div>
          </UCard>
        </div>
      </template>

      <!-- Empty -->
      <div v-else-if="!data?.length" class="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div
          class="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
        </div>

        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
          No behaviour found
        </h3>

        <p class="mt-1 max-w-xs text-sm text-gray-500">
          Student behaviour records will appear here.
        </p>
      </div>

      <!-- Cards -->
      <div v-else class="space-y-4"
        :class="{ 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3': view === 'card' }">
        <UCard v-for="row in data" :key="row.id" :ui="{ body: 'p-0 sm:p-0' }">
          <!-- Header -->
          <div class="border-b border-default p-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar size="lg" :src="row.student?.photo" :alt="`${row.student}`" class="ring-2 ring-primary/10" />
                <div class="min-w-0">
                  <h3 class="truncate text-base font-semibold">
                    {{ row.student }}
                  </h3>
                  <p class="text-xs-base text-muted">{{ row.category }}</p>
                </div>
              </div>

              <UBadge :color="row.kind === 'POSITIVE' ? 'success' : 'error'" variant="soft">
                {{ parseBehaviourKind[row.kind] }}
              </UBadge>
            </div>
          </div>

          <!-- Content -->
          <div class="p-3">
            <div class="rounded-2xl border border-default bg-gray-50 p-3 dark:bg-neutral-800">
              <p class="text-xs-base font-medium uppercase tracking-wide text-muted">
                Behaviour Note
              </p>
              <p class="text-sm">
                {{ row.note || "No behaviour note recorded." }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </template>
  </UCard>
</template>
