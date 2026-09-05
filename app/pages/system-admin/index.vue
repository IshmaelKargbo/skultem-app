<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const store = useSystemStore();
const { stats, statsLoading, schools, schoolsMeta } = storeToRefs(store);
const platformStore = usePlatformStore();
const { success: toastSuccess, error: toastError } = useNotify();
const { format } = useMoney();

const loading = ref(true);
const view = ref<"table" | "card">("table");

const platformFeeModal = ref(false);
const platformFeeTarget = ref<SystemSchool>();

function openPlatformFeeModal(school: SystemSchool) {
  platformFeeTarget.value = school;
  platformFeeModal.value = true;
}

const STATUS_COLOR: Record<string, "success" | "neutral" | "error"> = {
  ACTIVE: "success",
  INACTIVE: "neutral",
  DELETED: "error",
};

const columns = [
  { accessorKey: "name", header: "School" },
  { accessorKey: "owner", header: "Owner" },
  { accessorKey: "status", header: "Status" },
  { id: "platformFee", header: "Platform Fee" },
  { accessorKey: "createdAt", header: "Onboarded" },
  { id: "actions", meta: { class: { td: "text-right" } } },
];

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val }),
});

const query = computed<string>({
  get: () => String(route.query.query ?? ""),
  set: (val) => updateQuery({ query: val || undefined, page: 1 }),
});

const size = ref(10);
const hasActiveFilters = computed(() => !!query.value);

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } });
}

function resetFilters() {
  updateQuery({ query: undefined, page: 1 });
}

async function fetchSchools() {
  loading.value = true;
  await store.fetchSchools(page.value, size.value, query.value || undefined);
  loading.value = false;
}

watch(() => page.value, () => fetchSchools());
watch(() => query.value, () => {
  if (page.value === 1) fetchSchools();
});

// Debounced so every keystroke in the search box doesn't fire a request - same intent as every
// other list filter in the app, just applied at the input instead of the computed setter since
// this one is free text.
const searchInput = ref(query.value);
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchInput, (val) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    query.value = val;
  }, 350);
});

async function setStatus(school: SystemSchool, status: string) {
  try {
    await store.updateSchoolStatus(school.id, status);
    toastSuccess(`${clean(school.name)} marked ${clean(status)}`);
  } catch (err: any) {
    toastError(err?.message || "Failed to update school status");
  }
}

function rowActions(school: SystemSchool) {
  const statusItems = (["ACTIVE", "INACTIVE", "DELETED"] as const)
    .filter((s) => s !== school.status)
    .map((s) => ({
      label: `Mark ${clean(s)}`,
      icon: s === "ACTIVE" ? "i-lucide-circle-check" : s === "INACTIVE" ? "i-lucide-circle-pause" : "i-lucide-trash-2",
      color: s === "DELETED" ? ("error" as const) : undefined,
      onClick: () => setStatus(school, s),
    }));

  return [
    [{ label: "Set Platform Fee", icon: "i-lucide-shield", onClick: () => openPlatformFeeModal(school) }],
    statusItems,
  ];
}

onMounted(async () => {
  useAppStore().setTitle("System Admin");
  document.title = "System Admin | Skultem";
  searchInput.value = query.value;

  await Promise.all([store.fetchStats(), fetchSchools(), platformStore.fetchFeeSettings()]);
});

definePageMeta({
  role: [Role.SYSTEM_ADMIN],
});
</script>

<template>
  <div class="px-4 md:px-6 space-y-4">
    <UAlert
      color="warning"
      variant="soft"
      icon="i-lucide-shield-check"
      title="System-admin only"
      description="Cross-tenant view of every school on the platform. Nothing here is scoped to your own school."
    />

    <!-- Stats -->
    <div class="grid gap-4 sm:grid-cols-3">
      <Metric :record="{
        color: 'primary',
        icon: SCHOOL_ICON,
        label: 'Schools',
        value: stats.totalSchools,
        isReady: !statsLoading,
      }" />
      <Metric :record="{
        color: 'info',
        icon: USERS_ICON,
        label: 'Users',
        value: stats.totalUsers,
        isReady: !statsLoading,
      }" />
      <Metric :record="{
        color: 'success',
        icon: STUDENT_ICON,
        label: 'Students',
        value: stats.totalStudents,
        isReady: !statsLoading,
      }" />
    </div>

    <!-- Schools -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-sm font-semibold text-highlighted">Schools</h2>
            <TableViewToggle v-model="view" />
          </div>

          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <UInput v-model="searchInput" icon="i-lucide-search" placeholder="Search by name or domain..."
              class="sm:col-span-2" />
            <UButton icon="i-lucide-x" variant="outline" color="neutral" label="Clear"
              :disabled="!hasActiveFilters" @click="() => { searchInput = ''; resetFilters(); }" />
          </div>
        </div>
      </template>

      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="schools" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon :name="SCHOOL_ICON" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No schools found.</p>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #name-cell="{ row }">
          <div class="space-y-1">
            <p class="font-medium">{{ row.original.name }}</p>
            <p class="text-xs text-muted">{{ row.original.domain }}.skultem.space</p>
          </div>
        </template>

        <template #owner-cell="{ row }">
          <div class="space-y-1">
            <p>{{ row.original.owner?.givenNames }} {{ row.original.owner?.familyName }}</p>
            <p class="text-xs text-muted">{{ row.original.owner?.email }}</p>
          </div>
        </template>

        <template #status-cell="{ row }">
          <UBadge variant="subtle" :color="STATUS_COLOR[row.original.status]" :label="clean(row.original.status)" />
        </template>

        <template #platformFee-cell="{ row }">
          <p class="text-sm">
            {{
              platformStore.feeSettingFor(row.original.id).amount != null
                ? format(platformStore.feeSettingFor(row.original.id).amount!)
                : "Not set"
            }}
          </p>
        </template>

        <template #createdAt-cell="{ row }">
          <p class="text-xs text-muted">{{ formatDate(row.original.createdAt) }}</p>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end">
            <UDropdownMenu :items="rowActions(row.original)" :content="{ align: 'end' }">
              <UButton icon="i-lucide-ellipsis-vertical" color="neutral" size="xs" variant="ghost" />
            </UDropdownMenu>
          </div>
        </template>
      </UTable>

      <!-- Mobile -->
      <div class="space-y-3 p-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <template v-if="loading">
          <UCard v-for="i in 4" :key="i" class="overflow-hidden">
            <div class="animate-pulse space-y-2 p-4">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-48" />
            </div>
          </UCard>
        </template>

        <UCard v-else-if="!schools?.length" class="col-span-full">
          <div class="flex flex-col items-center justify-center py-14">
            <UIcon :name="SCHOOL_ICON" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />
            <h3 class="text-sm font-semibold text-highlighted">No schools found</h3>
          </div>
        </UCard>

        <template v-else>
          <UCard v-for="school in schools" :key="school.id" class="overflow-hidden rounded-xl" :ui="{ body: 'p-0' }">
            <div class="flex items-start justify-between gap-3 p-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-highlighted">{{ school.name }}</p>
                <p class="truncate text-xs text-muted">{{ school.domain }}.skultem.space</p>
                <p class="truncate text-xs text-muted mt-1">
                  {{ school.owner?.givenNames }} {{ school.owner?.familyName }} · {{ school.owner?.email }}
                </p>
              </div>

              <UDropdownMenu :items="rowActions(school)" :content="{ align: 'end' }">
                <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" />
              </UDropdownMenu>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 border-t border-default p-3 text-xs text-muted">
              <UBadge variant="subtle" :color="STATUS_COLOR[school.status]" :label="clean(school.status)" />
              <span>
                Platform fee:
                {{
                  platformStore.feeSettingFor(school.id).amount != null
                    ? format(platformStore.feeSettingFor(school.id).amount!)
                    : "Not set"
                }}
              </span>
              <span>{{ formatDate(school.createdAt) }}</span>
            </div>
          </UCard>
        </template>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <Showing :meta="schoolsMeta" />
          <UPagination size="sm" v-model:page="page" :page-size="schoolsMeta.size" :items-per-page="schoolsMeta.size"
            :total="schoolsMeta.total" show-edges />
        </div>
      </template>
    </UCard>

    <SystemAdminPlatformFeeModal
      v-if="platformFeeTarget"
      v-model:open="platformFeeModal"
      :school-id="platformFeeTarget.id"
      :school-name="platformFeeTarget.name"
    />
  </div>
</template>
