<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const store = useSystemStore();
const { users, usersMeta, usersLoading } = storeToRefs(store);

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

const searched = ref(false);

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } });
}

async function runSearch() {
  if (!query.value.trim()) return;
  searched.value = true;
  await store.searchUsers(query.value.trim(), page.value, 10);
}

watch(() => page.value, () => {
  if (query.value.trim()) runSearch();
});

const searchInput = ref(query.value);
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchInput, (val) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    query.value = val;
    if (val.trim()) {
      runSearch();
    } else {
      // Cleared back to empty - drop back to the "search for someone" prompt instead of
      // leaving the last result set (or a stale "no users found") on screen.
      searched.value = false;
      store.users = [];
    }
  }, 350);
});

onMounted(() => {
  useAppStore().setTitle("System Admin · Users");
  document.title = "Users | System Admin | Skultem";
  searchInput.value = query.value;
  if (query.value.trim()) runSearch();
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
      description="Looks up an account by name or email across every school on the platform - e.g. to help a locked-out school owner, or check which schools an email already belongs to."
    />

    <UCard>
      <UInput v-model="searchInput" icon="i-lucide-search" size="lg" autofocus
        placeholder="Search by name or email..." />
    </UCard>

    <div v-if="usersLoading" class="grid gap-3 sm:grid-cols-2">
      <UCard v-for="i in 4" :key="i" class="overflow-hidden">
        <div class="animate-pulse space-y-2 p-2">
          <USkeleton class="h-4 w-40" />
          <USkeleton class="h-3 w-56" />
        </div>
      </UCard>
    </div>

    <UCard v-else-if="!searched">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-search" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />
        <p class="text-sm text-muted">Search for a user by name or email to see every school they belong to.</p>
      </div>
    </UCard>

    <UCard v-else-if="!users?.length">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-user-x" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />
        <p class="text-sm font-semibold text-highlighted">No users found</p>
        <p class="mt-1 text-xs text-muted">Try a different name or email.</p>
      </div>
    </UCard>

    <template v-else>
      <UCard v-for="user in users" :key="user.id" :ui="{ body: 'p-4' }">
        <div class="flex items-start gap-3">
          <UAvatar :src="user.photo || undefined" :alt="`${user.givenNames} ${user.familyName}`" size="md" />

          <div class="min-w-0 flex-1">
            <p class="font-semibold text-highlighted">{{ user.givenNames }} {{ user.familyName }}</p>
            <p class="text-xs text-muted">{{ user.email }}</p>

            <div v-if="user.schools.length" class="mt-3 space-y-2">
              <div v-for="membership in user.schools" :key="membership.schoolId"
                class="flex flex-wrap items-center gap-2 rounded-xl border border-default p-2.5">
                <UIcon :name="SCHOOL_ICON" class="size-4 text-muted shrink-0" />
                <span class="text-sm font-medium">{{ membership.schoolName }}</span>
                <span v-if="membership.domain" class="text-xs text-muted">
                  ({{ membership.domain }}.skultem.space)
                </span>
                <UBadge size="xs" variant="subtle" :color="ROLE_COLOR[membership.role] || 'neutral'"
                  :label="clean(membership.role)" />
                <UBadge v-if="membership.status !== 'ACTIVE'" size="xs" variant="outline" color="error"
                  :label="clean(membership.status)" />
              </div>
            </div>

            <p v-else class="mt-2 text-xs text-muted">No school memberships.</p>
          </div>
        </div>
      </UCard>

      <div class="flex justify-center">
        <UPagination size="sm" v-model:page="page" :page-size="usersMeta.size" :items-per-page="usersMeta.size"
          :total="usersMeta.total" show-edges />
      </div>
    </template>
  </div>
</template>
