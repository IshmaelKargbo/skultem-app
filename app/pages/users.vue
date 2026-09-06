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

// A blank query browses every user on the platform - see SystemApi().searchUsers - so this runs
// on every load, not just once something's been typed.
async function runSearch() {
  await store.searchUsers(query.value.trim(), page.value, 10);
}

// A single watcher over both - rather than one watch on `page` plus an inline call from the
// input handler below - so a new search term (which resets page to 1 as part of the same
// router.replace) only ever fires one request. Two watchers here used to race: the input
// handler read `page.value` before the route had actually updated, so it searched on the
// *previous* page first and only got the right page once the route watcher fired seconds later.
watch([query, page], () => runSearch());

const searchInput = ref(query.value);
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchInput, (val) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    query.value = val;
  }, 350);
});

// Tracks which single membership row is mid-update, so only that row's button shows a spinner
// instead of the whole list.
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
    <Heading title="System Admins" subtitle="Everyone with system-admin access to the platform." />

    <UAlert
      color="warning"
      variant="soft"
      icon="i-lucide-shield-check"
      title="System-admin only"
      description="Only accounts holding the System Admin role - not the general school directory. Search by name or email, and activate or deactivate a person's access to one school right from their card, without touching their access to any other."
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

    <UCard v-else-if="!users?.length">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-user-x" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />
        <p class="text-sm font-semibold text-highlighted">No system admins found</p>
        <p class="mt-1 text-xs text-muted">Try a different name or email.</p>
      </div>
    </UCard>

    <template v-else>
      <UCard v-for="user in users" :key="user.id" :ui="{ body: 'p-4' }">
        <div class="flex items-start gap-3">
          <UAvatar :src="user.photo || undefined" :alt="`${user.givenNames} ${user.familyName}`" size="md" loading="lazy" />

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

                <UButton
                  class="ml-auto"
                  size="xs"
                  variant="soft"
                  :color="membership.status === 'ACTIVE' ? 'error' : 'success'"
                  :icon="membership.status === 'ACTIVE' ? 'i-lucide-circle-pause' : 'i-lucide-circle-check'"
                  :label="membership.status === 'ACTIVE' ? 'Deactivate' : 'Activate'"
                  :loading="updatingKey === membershipKey(user.id, membership.schoolId)"
                  :disabled="updatingKey !== null && updatingKey !== membershipKey(user.id, membership.schoolId)"
                  @click="toggleMembershipStatus(user, membership)"
                />
              </div>
            </div>

            <p v-else class="mt-2 text-xs text-muted">No school memberships.</p>
          </div>
        </div>
      </UCard>

      <div class="flex justify-between items-center">
        <Showing :meta="usersMeta" />
        <UPagination size="sm" v-model:page="page" :page-size="usersMeta.size" :items-per-page="usersMeta.size"
          :total="usersMeta.total" show-edges />
      </div>
    </template>
  </div>
</template>
