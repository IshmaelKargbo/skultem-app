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

const addModal = ref(false);
const view = ref<"table" | "card">("table");

const columns = [
  { accessorKey: "admin", header: "Admin" },
  { id: "schools", header: "School Access" },
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
  <div class="px-4 md:px-6 space-y-4">
    <Heading title="System Admins" subtitle="People with full access across every school.">
      <UButton label="Add Admin" icon="i-lucide-user-plus" @click="addModal = true" />
    </Heading>

    <SystemAdminAddAdminModal v-model:open="addModal" @created="runSearch" />

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-sm font-semibold text-highlighted">Admins</h2>
            <TableViewToggle v-model="view" />
          </div>

          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <UInput v-model="searchInput" icon="i-lucide-search" placeholder="Search by name or email..."
              class="sm:col-span-2" />
            <UButton icon="i-lucide-x" variant="outline" color="neutral" label="Clear" :disabled="!query"
              @click="() => { searchInput = ''; query = ''; }" />
          </div>
        </div>
      </template>

      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="users"
        :loading="usersLoading">
        <template #empty-state>
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
            <UAvatar :src="row.original.photo || undefined"
              :alt="`${row.original.givenNames} ${row.original.familyName}`" size="md" loading="lazy" />
            <div class="space-y-1">
              <p class="font-medium">{{ row.original.givenNames }} {{ row.original.familyName }}</p>
              <p class="text-xs text-muted">{{ row.original.email }}</p>
            </div>
          </div>
        </template>

        <template #schools-cell="{ row }">
          <div v-if="row.original.schools.length" class="space-y-1.5">
            <div v-for="m in row.original.schools" :key="m.schoolId" class="flex flex-wrap items-center gap-2">
              <span class="text-sm">{{ m.schoolName }}</span>
              <span v-if="m.domain" class="text-xs text-muted">({{ m.domain }}.skultem.space)</span>
              <UBadge size="xs" variant="subtle" :color="ROLE_COLOR[m.role] || 'neutral'" :label="clean(m.role)" />
              <UBadge v-if="m.status !== 'ACTIVE'" size="xs" variant="outline" color="error"
                :label="clean(m.status)" />
              <UButton size="xs" variant="ghost" :color="m.status === 'ACTIVE' ? 'error' : 'success'"
                :icon="m.status === 'ACTIVE' ? 'i-lucide-circle-pause' : 'i-lucide-circle-check'"
                :label="m.status === 'ACTIVE' ? 'Deactivate' : 'Activate'"
                :loading="updatingKey === membershipKey(row.original.id, m.schoolId)"
                :disabled="updatingKey !== null && updatingKey !== membershipKey(row.original.id, m.schoolId)"
                @click="toggleMembershipStatus(row.original, m)" />
            </div>
          </div>
          <p v-else class="text-xs text-muted">Platform-wide · no school</p>
        </template>
      </UTable>

      <!-- Mobile -->
      <div class="space-y-3 p-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <template v-if="usersLoading">
          <UCard v-for="i in 4" :key="i" class="overflow-hidden">
            <div class="animate-pulse space-y-2 p-4">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-48" />
            </div>
          </UCard>
        </template>

        <UCard v-else-if="!users?.length" class="col-span-full">
          <div class="flex flex-col items-center justify-center py-14">
            <UIcon :name="USERS_ICON" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />
            <h3 class="text-sm font-semibold text-highlighted">No system admins found</h3>
          </div>
        </UCard>

        <template v-else>
          <UCard v-for="user in users" :key="user.id" class="overflow-hidden rounded-xl" :ui="{ body: 'p-0' }">
            <div class="flex items-center gap-3 p-3">
              <UAvatar :src="user.photo || undefined" :alt="`${user.givenNames} ${user.familyName}`" size="md"
                loading="lazy" />
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-highlighted">{{ user.givenNames }} {{ user.familyName }}</p>
                <p class="truncate text-xs text-muted">{{ user.email }}</p>
              </div>
            </div>

            <div v-for="m in user.schools" :key="m.schoolId"
              class="flex flex-wrap items-center justify-between gap-2 border-t border-default p-3 text-xs">
              <div class="min-w-0">
                <p class="truncate text-sm">{{ m.schoolName }}</p>
                <div class="mt-1 flex flex-wrap gap-1">
                  <UBadge size="xs" variant="subtle" :color="ROLE_COLOR[m.role] || 'neutral'" :label="clean(m.role)" />
                  <UBadge v-if="m.status !== 'ACTIVE'" size="xs" variant="outline" color="error"
                    :label="clean(m.status)" />
                </div>
              </div>
              <UButton size="xs" variant="soft" :color="m.status === 'ACTIVE' ? 'error' : 'success'"
                :icon="m.status === 'ACTIVE' ? 'i-lucide-circle-pause' : 'i-lucide-circle-check'"
                :label="m.status === 'ACTIVE' ? 'Deactivate' : 'Activate'"
                :loading="updatingKey === membershipKey(user.id, m.schoolId)"
                :disabled="updatingKey !== null && updatingKey !== membershipKey(user.id, m.schoolId)"
                @click="toggleMembershipStatus(user, m)" />
            </div>
            <p v-if="!user.schools.length" class="border-t border-default p-3 text-xs text-muted">
              Platform-wide · no school
            </p>
          </UCard>
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
