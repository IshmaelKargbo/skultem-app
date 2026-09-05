<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { format } = useMoney();
const store = useFeeStructureStore();
const termStore = useTermStore();
const clazzStore = useClassStore();
const loading = ref(true);
const { records: data, meta } = storeToRefs(store);
const view = ref<"table" | "card">("table");

const deleteModal = ref(false);
const selected = ref<FeeStructure>();

const termOptions = computed(() =>
  termStore.records.map((e) => ({ label: e.name, value: e.id }))
);

const classOptions = computed(() =>
  clazzStore.records.map((e) => ({ label: e.name, value: e.id }))
);

// No "All Students" entry here - a Reka UI Combobox item's value can't be an empty string (it's
// reserved internally to mean "cleared", and an item using it throws "A <ComboboxItem /> must
// have a value prop that is not an empty string" the moment the list renders, breaking every item
// in it, not just that one). Nothing selected already shows the "All students" placeholder, and
// the select's own clear button (:clear below) gets back to it.
const studentTypeOptions = [
  { label: "New Students Only", value: "NEW" },
  { label: "Old Students Only", value: "OLD" },
];

const genderOptions = [
  { label: "Boys Only", value: "MALE" },
  { label: "Girls Only", value: "FEMALE" },
];

const sortOptions = [
  { label: "Newest First", value: "createdAt:desc" },
  { label: "Oldest First", value: "createdAt:asc" },
  { label: "Amount: High to Low", value: "amount:desc" },
  { label: "Amount: Low to High", value: "amount:asc" },
  { label: "Due Date: Soonest", value: "dueDate:asc" },
  { label: "Due Date: Latest", value: "dueDate:desc" },
];
const DEFAULT_SORT = "createdAt:desc";

function remove(fee: FeeStructure) {
  selected.value = fee;
  deleteModal.value = true;
}

const columns = [
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell({ row }: any) {
      return format((row.original as FeeStructure).amount);
    },
  },
  {
    accessorKey: "students",
    header: "Students",
  },
  {
    accessorKey: "hasSupply",
    header: "Supply",
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
  },
  {
    accessorKey: "allowInstallment",
    header: "Installment",
  },
  {
    id: "actions",
    meta: {
      class: {
        td: "text-right",
      },
    },
  },
];

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val }),
});

const termId = computed<string>({
  get: () => String(route.query.termId ?? ""),
  set: (val) => updateQuery({ termId: val || undefined, page: 1 }),
});

const classId = computed<string>({
  get: () => String(route.query.classId ?? ""),
  set: (val) => updateQuery({ classId: val || undefined, page: 1 }),
});

const studentType = computed<string>({
  get: () => String(route.query.studentType ?? ""),
  set: (val) => updateQuery({ studentType: val || undefined, page: 1 }),
});

const gender = computed<string>({
  get: () => String(route.query.gender ?? ""),
  set: (val) => updateQuery({ gender: val || undefined, page: 1 }),
});

const sort = computed<string>({
  get: () => String(route.query.sort ?? DEFAULT_SORT),
  set: (val) => updateQuery({ sort: val === DEFAULT_SORT ? undefined : val, page: 1 }),
});

const sortBy = computed(() => sort.value.split(":")[0]);
const sortDirection = computed(() => sort.value.split(":")[1]);

// Whether any filter/sort differs from its default - drives whether "Clear" is enabled.
const hasActiveFilters = computed(
  () => !!termId.value || !!classId.value || !!studentType.value || !!gender.value || sort.value !== DEFAULT_SORT
);

function resetFilters() {
  updateQuery({
    termId: undefined,
    classId: undefined,
    studentType: undefined,
    gender: undefined,
    sort: undefined,
    page: 1,
  });
}

const size = ref(runtimeConf().limit);

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } });
}

async function fetchRecord() {
  loading.value = true;
  await store.fetchAll(
    page.value,
    size.value,
    termId.value || undefined,
    classId.value || undefined,
    studentType.value || undefined,
    sortBy.value,
    sortDirection.value,
    gender.value || undefined
  );
  loading.value = false;
}

watch(() => page.value, () => fetchRecord());

// Setting a filter also resets the page to 1: if the page was already 1 that query change
// won't fire the page watcher above, so fetch here too.
watch([() => termId.value, () => classId.value, () => studentType.value, () => gender.value, () => sort.value], () => {
  if (page.value === 1) fetchRecord();
});

onMounted(async () => {
  updateQuery({
    page: page.value
  })
  useAppStore().setTitle('Fees Structures');
  document.title = 'Fees Structures | Fees Payment | Skultem'

  termStore.fetchAll(0, 0);
  clazzStore.fetchAll(0, 0);
  await fetchRecord();
})

definePageMeta({
  role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
<template>
  <div class="px-4 md:px-6">
    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex px-4 py-3 flex-wrap items-center justify-between gap-3">
            <h2 class="text-sm font-semibold text-highlighted">Fee Structures</h2>

            <div class="flex flex-wrap items-center gap-2">
              <UButton color="primary" label="Add Fee Structure" icon="prime:plus" to="/fees-payment/structure/add" />
              <TableViewToggle v-model="view" />
            </div>
          </div>

          <div class="border-t p-4 border-default flex flex-wrap items-center justify-between gap-3">
            <div class="flex-1 col-span-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <USelectMenu v-model="termId" value-key="value" label-key="label" :items="termOptions"
                placeholder="All terms" />
              <USelectMenu v-model="classId" value-key="value" label-key="label" :items="classOptions"
                placeholder="All classes" />
              <USelectMenu v-model="studentType" value-key="value" label-key="label" :items="studentTypeOptions"
                placeholder="All students" clear />
              <USelectMenu v-model="gender" value-key="value" label-key="label" :items="genderOptions"
                placeholder="All genders" clear />
              <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions"
                placeholder="Sort by" />
            </div>
            <div>
              <UButton class="col-span-2 justify-center sm:col-span-1" :trailing-icon="DELETE_ICON" variant="outline"
                color="error" label="Clear" :disabled="!hasActiveFilters" @click="resetFilters" />
            </div>
          </div>
        </div>
      </template>
      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />

            <p class="text-gray-500">No fee structures found.</p>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #allowInstallment-cell="{ row }">
          <UBadge variant="outline" :label="row.original.allowInstallment ? 'Yes' : 'No'"
            :color="row.original.allowInstallment ? 'success' : 'neutral'" />
        </template>

        <template #type-cell="{ row }">
          <div class="space-y-1">
            <p>{{ clean(row.original.type) }}</p>

            <p class="text-xs text-muted">
              {{ row.original.clazz?.name || "-" }}
            </p>
          </div>
        </template>

        <template #category-cell="{ row }">
          <div class="space-y-1">
            <div class="flex items-center gap-1.5">
              <p>{{ clean(row.original.category.name) }}</p>

              <UTooltip v-if="row.original.newStudentsOnly" :delay-duration="0" arrow
                text="Only charged on a student's first-ever enrollment">
                <UBadge size="xs" variant="subtle" color="info" icon="i-lucide-user-plus" label="New Students" />
              </UTooltip>

              <UTooltip v-if="row.original.oldStudentsOnly" :delay-duration="0" arrow
                text="Only charged to students who are re-enrolling">
                <UBadge size="xs" variant="subtle" color="warning" icon="i-lucide-user-check" label="Old Students" />
              </UTooltip>

              <UBadge v-if="row.original.gender" size="xs" variant="subtle" color="secondary"
                :icon="row.original.gender === 'MALE' ? 'i-lucide-mars' : 'i-lucide-venus'"
                :label="row.original.gender === 'MALE' ? 'Boys Only' : 'Girls Only'" />
            </div>

            <p class="text-xs text-muted">
              {{ row.original.term.name || "-" }}
            </p>
          </div>
        </template>

        <template #hasSupply-cell="{ row }">
          <div class="space-y-1">
            <p v-if="row.original.hasSupply && row.original.supplyItems?.length">
              <span v-for="(item, i) in row.original.supplyItems" :key="item.material.id">
                {{ item.material.name }} ({{ item.quantity }}){{ i < row.original.supplyItems.length - 1 ? ', ' : '' }}
              </span>
            </p>

            <p v-else class="text-muted">-</p>
          </div>
        </template>

        <template #students-cell="{ row }">
          <FeeStructureCount :id="row.original.id">
            <template #default="{ value }">
              <div class="flex space-x-2">
                <UBadge size="lg" variant="subtle" color="secondary" :trailing-icon="STUDENT_ICON"
                  :label="`${value} -`" />
              </div>
            </template>
          </FeeStructureCount>
        </template>

        <template #actions-cell="{ row }">
          <div v-if="row.original.isSystem" class="flex justify-end">
            <UBadge color="neutral" variant="subtle" icon="i-lucide-lock" label="Platform Fee" />
          </div>

          <div v-else class="flex justify-end gap-1">
            <UButton :to="`/fees-payment/structure/edit/${row.original.id}`" :icon="EDIT_ICON" size="xs" color="neutral"
              variant="ghost" />

            <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost" @click="remove(row.original)" />
          </div>
        </template>
      </UTable>

      <!-- Mobile -->
      <div class="space-y-3 p-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <!-- Loading -->
        <template v-if="loading">
          <UCard v-for="i in 4" :key="i" class="overflow-hidden rounded-2xl border border-default shadow-sm"
            :ui="{ body: 'p-0' }">
            <div class="animate-pulse">
              <!-- Header -->
              <div class="border-b border-default p-4">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <USkeleton class="size-12 shrink-0 rounded-2xl" />
                    <div class="min-w-0 space-y-2">
                      <USkeleton class="h-4 w-32 rounded-md" />
                      <USkeleton class="h-3 w-24 rounded-md" />
                    </div>
                  </div>
                  <USkeleton class="h-6 w-24 shrink-0 rounded-full" />
                </div>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-2 gap-3 p-4">
                <div v-for="j in 4" :key="j" class="rounded-2xl border border-default bg-muted/40 p-3">
                  <div class="mb-3 flex items-center gap-2">
                    <USkeleton class="size-7 shrink-0 rounded-lg" />
                    <USkeleton class="h-3 w-16 rounded-md" />
                  </div>
                  <USkeleton class="h-4 w-24 rounded-md" />
                </div>
              </div>
            </div>
          </UCard>
        </template>

        <!-- Empty -->
        <UCard v-else-if="!data?.length" class="col-span-full">
          <div class="flex flex-col items-center justify-center py-14">
            <UIcon name="lucide:wallet-cards" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />

            <h3 class="text-sm font-semibold text-highlighted">
              No fee structures found
            </h3>

            <p class="mt-1 text-sm text-muted">
              Fee structures, installments, and payment configurations will appear here.
            </p>
          </div>
        </UCard>

        <!-- Cards -->
        <template v-else>
          <UCard v-for="item in data" :key="item.id"
            class="overflow-hidden rounded-xl transition-all active:scale-[0.99] hover:ring-1 hover:ring-primary-200 dark:hover:ring-primary-700"
            :ui="{ body: 'sm:p-0 p-0' }">
            <!-- Header -->
            <div class="border-b border-default p-3">
              <div class="flex items-center justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <div
                    class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
                    <UIcon name="lucide:wallet" class="size-5 text-primary-500" />
                  </div>

                  <div class="min-w-0">
                    <h3 class="truncate text-sm font-semibold text-highlighted">
                      {{ clean(item.category.name) }}
                    </h3>

                    <p class="truncate text-xs-base text-muted">
                      {{ clean(item.type) }} · {{ item.clazz?.name || 'All Classes' }}
                    </p>

                    <UBadge v-if="item.newStudentsOnly" size="xs" variant="subtle" color="info"
                      icon="i-lucide-user-plus" label="New Students Only" class="mt-1" />

                    <UBadge v-if="item.oldStudentsOnly" size="xs" variant="subtle" color="warning"
                      icon="i-lucide-user-check" label="Old Students Only" class="mt-1" />

                    <UBadge v-if="item.gender" size="xs" variant="subtle" color="secondary"
                      :icon="item.gender === 'MALE' ? 'i-lucide-mars' : 'i-lucide-venus'"
                      :label="item.gender === 'MALE' ? 'Boys Only' : 'Girls Only'" class="mt-1" />
                  </div>
                </div>

                <UBadge size="lg" :color="item.allowInstallment ? 'success' : 'neutral'" variant="soft">
                  {{ item.allowInstallment ? 'Installment' : 'Full Payment' }}
                </UBadge>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 p-4">
              <!-- Term -->
              <div
                class="min-w-0 rounded-2xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/20 dark:bg-blue-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                    <UIcon name="i-lucide-calendar-range" class="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p class="text-xs-base font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">Term</p>
                </div>
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ item.term.name || 'N/A' }}
                </p>
              </div>

              <!-- Amount -->
              <div
                class="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                    <UIcon name="i-lucide-wallet" class="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p class="text-xs-base font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    Amount
                  </p>
                </div>
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ format(item.amount || 0) }}
                </p>
              </div>

              <!-- Due Date -->
              <div
                class="min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                    <UIcon name="i-lucide-calendar-clock" class="size-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p class="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">Due Date
                  </p>
                </div>
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ item.dueDate ? formatDate(item.dueDate) : 'N/A' }}
                </p>
              </div>

              <!-- Students -->
              <div
                class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-6 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                    <UIcon :name="STUDENT_ICON" class="size-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <p class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                    Students
                  </p>
                </div>
                <FeeStructureCount :id="item.id">
                  <template #default="{ value }">
                    <p class="truncate text-sm font-medium text-highlighted">
                      {{ value }}
                    </p>
                  </template>
                </FeeStructureCount>
              </div>
            </div>

            <!-- Supply -->
            <div class="flex items-center justify-between gap-3 border-t border-default p-3 text-xs text-muted">
              <span>Material Supply</span>
              <span v-if="item.hasSupply && item.supplyItems?.length" class="truncate font-medium text-highlighted">
                <span v-for="(supplyItem, i) in item.supplyItems" :key="supplyItem.material.id">
                  {{ supplyItem.material.name }} ({{ supplyItem.quantity }}){{ i < item.supplyItems.length - 1 ? ', ' : '' }}
                </span>
              </span>
              <span v-else class="text-muted">No supply attached</span>
            </div>

            <!-- Actions -->
            <div v-if="item.isSystem" class="flex items-center justify-end border-t border-default p-2">
              <UBadge color="neutral" variant="subtle" icon="i-lucide-lock" label="Platform Fee" />
            </div>

            <div v-else class="flex items-center justify-end gap-1 border-t border-default p-2">
              <UButton :to="`/fees-payment/structure/edit/${item.id}`" label="Edit" :icon="EDIT_ICON" size="xs"
                color="neutral" variant="ghost" />

              <UButton label="Delete" :icon="DELETE_ICON" size="xs" color="error" variant="ghost"
                @click="remove(item)" />
            </div>
          </UCard>
        </template>
      </div>

      <FeeStructureDeletePrompt v-if="selected" v-model:open="deleteModal" :fee-id="selected.id"
        :fee-name="`${clean(selected.category.name)} - ${selected.term.name}`" />

      <template #footer>
        <div class="flex justify-between items-center">
          <Showing :meta="meta" />

          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
