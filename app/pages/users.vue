<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const store = useSystemStore();
const { users, usersMeta, usersLoading } = storeToRefs(store);
const { success: toastSuccess, error: toastError } = useNotify();

const ROLE_COLOR: Record<string, "primary" | "warning" | "neutral" | "info"> = {
  SYSTEM_ADMIN: "warning",
  OWNER: "primary",
  PROPRIETOR: "primary",
  ADMIN: "info",
};

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val }),
});

const query = computed<string>({
  get: () => String(route.query.query ?? ""),
  set: (val) => updateQuery({ query: val || undefined, page: 1 }),
});

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } });
}

async function runSearch() {
  await store.searchUsers(query.value.trim(), page.value, 10);
}

watch([query, page], () => runSearch());

const searchInput = ref(query.value);
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchInput, (val) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    query.value = val;
  }, 350);
});

const initials = (u: { givenNames?: string, familyName?: string }) =>
  `${u.givenNames?.[0] ?? ''}${u.familyName?.[0] ?? ''}`.toUpperCase() || '?'

// Counted on the page being shown - the list is paged, so these describe what is in front of you.
const metrics = computed(() => {
  const list = users.value ?? []
  const ready = !usersLoading.value || list.length > 0
  return [
    { label: 'System admins', value: usersMeta.value?.total ?? list.length, icon: 'i-lucide-shield-user', color: 'primary' as const, subtle: query.value ? 'Matching your search' : 'With a sign-in to this portal' },
    { label: 'Platform-wide', value: list.filter(u => !u.schools.length).length, icon: 'i-lucide-globe', color: 'info' as const, subtle: 'No school attached · this page' },
    { label: 'Inactive access', value: list.reduce((n, u) => n + u.schools.filter(m => m.status !== 'ACTIVE').length, 0), icon: 'i-lucide-circle-pause', color: 'warning' as const, subtle: 'School memberships paused · this page' },
    { label: 'Schools covered', value: new Set(list.flatMap(u => u.schools.map(m => m.schoolId))).size, icon: 'i-lucide-school', color: 'success' as const, subtle: 'Distinct schools · this page' }
  ].map(m => ({ ...m, ready }))
})

const rolesOf = (u: SystemUser) => [...new Set(u.schools.map(m => m.role))]
const inactiveOf = (u: SystemUser) => u.schools.filter(m => m.status !== 'ACTIVE').length

const addModal = ref(false);
const view = ref<"table" | "card">("table");

const columns = [
  { accessorKey: "admin", header: "Admin" },
  { id: "roles", header: "Role" },
  { id: "schools", header: "Schools" },
  { id: "status", header: "Access" },
];

const updatingKey = ref<string | null>(null);
const membershipKey = (userId: string, schoolId: string) => `${userId}:${schoolId}`;

async function toggleMembershipStatus(user: SystemUser, membership: SystemUserSchoolMembership) {
  const nextStatus = membership.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  const key = membershipKey(user.id, membership.schoolId);

  updatingKey.value = key;
  try {
    await store.updateSchoolUserStatus(membership.schoolId, user.id, nextStatus);
    toastSuccess(`${user.givenNames} ${user.familyName} marked ${clean(nextStatus)} at ${membership.schoolName}`);
  } catch (err: any) {
    toastError(err?.message || "Failed to update user status");
  } finally {
    updatingKey.value = null;
  }
}

onMounted(() => {
  useAppStore().setTitle("System Admin · Admins");
  useAppStore().setBack(false);
  document.title = "System Admins | System Admin | Skultem";
  searchInput.value = query.value;
  runSearch();
});

definePageMeta({
  role: [Role.SYSTEM_ADMIN],
});
</script>

<template>
  <div class="px-4 md:px-6 space-y-3">
    <Heading title="System Admins" subtitle="People with full access across every school.">
      <UButton label="Add Admin" icon="i-lucide-user-plus" @click="addModal = true" />
    </Heading>
    <SystemAdminAddAdminModal v-model:open="addModal" @created="runSearch" />

    <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <Metric v-for="m in metrics" :key="m.label" :record="{ label: m.label, value: m.value, subtle: m.subtle, icon: m.icon, color: m.color, isReady: m.ready }" />
    </div>

    <div class="flex flex-wrap items-center gap-2 rounded-2xl bg-default p-2 shadow-sm ring-1 ring-default">
      <UInput v-model="searchInput" icon="i-lucide-search" variant="soft" size="lg" placeholder="Search by name or email..." class="min-w-0 flex-1" />
      <UButton v-if="query || searchInput" icon="i-lucide-x" variant="ghost" color="neutral" label="Clear" @click="() => { searchInput = ''; query = ''; }" />
      <TableViewToggle v-model="view" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="users" :loading="usersLoading"
        :ui="{ thead: 'bg-elevated/50', th: 'py-3 text-[11px] font-semibold uppercase tracking-wide text-muted', td: 'py-3.5', tr: 'hover:bg-primary/5 transition-colors' }">
        <template #empty>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon :name="USERS_ICON" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No system admins found.</p>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #admin-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :src="row.original.photo || undefined" :text="initials(row.original)"
              :alt="`${row.original.givenNames} ${row.original.familyName}`" size="lg" loading="lazy" class="ring-2 ring-primary/20" />
            <div class="min-w-0">
              <p class="truncate font-medium text-highlighted">{{ row.original.givenNames }} {{ row.original.familyName }}</p>
              <p class="flex items-center gap-1.5 truncate text-xs text-muted"><UIcon name="i-lucide-mail" class="size-3.5 shrink-0" />{{ row.original.email }}</p>
            </div>
          </div>
        </template>

        <template #roles-cell="{ row }">
          <div v-if="row.original.schools.length" class="flex flex-wrap gap-1">
            <UBadge v-for="r in rolesOf(row.original)" :key="r" size="sm" variant="subtle" :color="ROLE_COLOR[r] || 'neutral'" :label="clean(r)" />
          </div>
          <span v-else class="text-muted">—</span>
        </template>

        <template #schools-cell="{ row }">
          <UBadge v-if="!row.original.schools.length" size="sm" variant="subtle" color="info" icon="i-lucide-globe" label="Platform-wide" />
          <UPopover v-else :content="{ align: 'start' }">
            <UButton size="sm" variant="soft" color="neutral" icon="i-lucide-school" trailing-icon="i-lucide-chevron-down"
              :label="`${row.original.schools.length} school${row.original.schools.length === 1 ? '' : 's'}`" />
            <template #content>
              <ul class="max-h-80 w-80 space-y-1 overflow-y-auto p-2">
                <li v-for="m in row.original.schools" :key="m.schoolId" class="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 hover:bg-elevated/60">
                  <div class="flex min-w-0 items-center gap-2.5">
                    <span class="size-2 shrink-0 rounded-full" :class="m.status === 'ACTIVE' ? 'bg-success' : 'bg-error'" :title="clean(m.status)" />
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-highlighted">{{ m.schoolName }}</p>
                      <p class="truncate text-[11px] text-muted">{{ clean(m.role) }}<template v-if="m.domain"> · {{ m.domain }}.skultem.space</template></p>
                    </div>
                  </div>
                  <UButton size="xs" variant="ghost" :color="m.status === 'ACTIVE' ? 'error' : 'success'"
                    :icon="m.status === 'ACTIVE' ? 'i-lucide-circle-pause' : 'i-lucide-circle-check'"
                    :label="m.status === 'ACTIVE' ? 'Deactivate' : 'Activate'"
                    :loading="updatingKey === membershipKey(row.original.id, m.schoolId)"
                    :disabled="updatingKey !== null && updatingKey !== membershipKey(row.original.id, m.schoolId)"
                    @click="toggleMembershipStatus(row.original, m)" />
                </li>
              </ul>
            </template>
          </UPopover>
        </template>

        <template #status-cell="{ row }">
          <UBadge v-if="!row.original.schools.length" size="sm" variant="subtle" color="success" label="Active" />
          <UBadge v-else-if="inactiveOf(row.original) === 0" size="sm" variant="subtle" color="success" label="All active" />
          <UBadge v-else size="sm" variant="subtle" color="warning" :label="`${inactiveOf(row.original)} inactive`" />
        </template>
      </UTable>

      <!-- Mobile / card view -->
      <div class="space-y-3 p-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <template v-if="usersLoading">
          <div v-for="i in 4" :key="i" class="animate-pulse space-y-2 rounded-xl border border-default p-4">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-48" />
          </div>
        </template>

        <div v-else-if="!users?.length" class="col-span-full flex flex-col items-center justify-center py-14">
          <UIcon :name="USERS_ICON" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />
          <h3 class="text-sm font-semibold text-highlighted">No system admins found</h3>
        </div>

        <template v-else>
          <div v-for="user in users" :key="user.id" class="overflow-hidden rounded-xl border border-default bg-default shadow-sm">
            <div class="flex items-center gap-3 bg-primary/5 p-3">
              <UAvatar :src="user.photo || undefined" :text="initials(user)" :alt="`${user.givenNames} ${user.familyName}`" size="lg"
                loading="lazy" class="ring-2 ring-primary/20" />
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-highlighted">{{ user.givenNames }} {{ user.familyName }}</p>
                <p class="truncate text-xs text-muted">{{ user.email }}</p>
              </div>
            </div>

            <div v-for="m in user.schools" :key="m.schoolId"
              class="flex flex-wrap items-center justify-between gap-2 border-t border-default p-3 text-xs">
              <div class="min-w-0">
                <p class="flex items-center gap-2 truncate text-sm">
                  <span class="size-2 shrink-0 rounded-full" :class="m.status === 'ACTIVE' ? 'bg-success' : 'bg-error'" />{{ m.schoolName }}
                </p>
                <div class="mt-1 flex flex-wrap gap-1">
                  <UBadge size="sm" variant="subtle" :color="ROLE_COLOR[m.role] || 'neutral'" :label="clean(m.role)" />
                  <UBadge v-if="m.status !== 'ACTIVE'" size="sm" variant="subtle" color="error" :label="clean(m.status)" />
                </div>
              </div>
              <UButton size="xs" variant="soft" :color="m.status === 'ACTIVE' ? 'error' : 'success'"
                :icon="m.status === 'ACTIVE' ? 'i-lucide-circle-pause' : 'i-lucide-circle-check'"
                :label="m.status === 'ACTIVE' ? 'Deactivate' : 'Activate'"
                :loading="updatingKey === membershipKey(user.id, m.schoolId)"
                :disabled="updatingKey !== null && updatingKey !== membershipKey(user.id, m.schoolId)"
                @click="toggleMembershipStatus(user, m)" />
            </div>
            <div v-if="!user.schools.length" class="border-t border-default p-3">
              <UBadge size="sm" variant="subtle" color="info" icon="i-lucide-globe" label="Platform-wide · no school" />
            </div>
          </div>
        </template>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <Showing :meta="usersMeta" />
          <UPagination size="sm" v-model:page="page" :page-size="usersMeta.size" :items-per-page="usersMeta.size"
            :total="usersMeta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
