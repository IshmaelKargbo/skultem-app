<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const view = ref<"table" | "card">("table")

function updateQuery(newQuery: Record<string, any>) {
    router.replace({ query: { ...route.query, ...newQuery } })
}

const search = computed<string>({
    get: () => String(route.query.search ?? ''),
    set: (value) => updateQuery({ search: value || undefined, page: 1 }),
})

const sortOptions = [
    { label: "Name (A-Z)", value: "user.givenName:asc" },
    { label: "Name (Z-A)", value: "user.givenName:desc" },
    { label: "Newest First", value: "createdAt:desc" },
    { label: "Oldest First", value: "createdAt:asc" },
]
const DEFAULT_SORT = "createdAt:desc"
const sort = ref(String(route.query.sort ?? DEFAULT_SORT))
const sortBy = computed(() => sort.value.split(":")[0])
const sortDirection = computed(() => sort.value.split(":")[1])

// What the filter drawer holds (search sits outside it).
const activeFilterCount = computed(() => (sort.value !== DEFAULT_SORT ? 1 : 0))

const searchInput = ref(search.value)
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (val) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        search.value = val
    }, 350)
})

watch(sort, () => {
    updateQuery({ sort: sort.value === DEFAULT_SORT ? undefined : sort.value, page: 1 })
})

const store = useParentStore();
const { records: data, meta, loading } = storeToRefs(store);

const STATUS_LABELS: Record<string, string> = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    DELETED: "Deleted",
}

const STATUS_COLORS: Record<string, any> = {
    ACTIVE: "success",
    INACTIVE: "warning",
    DELETED: "error",
}

const columns = [
    {
        accessorKey: "name",
        header: "Guardian",
    },
    {
        accessorKey: "students",
        header: "Students",
    },
    {
        accessorKey: "phone",
        header: "Contact",
    },
    {
        accessorKey: "city",
        header: "Address",
    },
    {
        id: "actions",
        meta: { class: { td: "text-right" } },
    },
]

const { can } = useAuth()
// Matches PATCH /parent/{id} (ADMIN/OWNER/PROPRIETOR); permanent delete is owner-level only, like the backend.
const canDelete = computed(() => can([Role.PROPRIETOR, Role.OWNER]))

const editTarget = ref<Parent | null>(null)
const deleteTarget = ref<Parent | null>(null)

const addEmailTarget = ref<Parent | null>(null)

function openAddEmail(parent: Parent) {
    addEmailTarget.value = parent
}

// Guardians can sign in with their phone number, so one without an email still gets portal
// access once an admin hands them a password (they're asked to set their own on first login).
const loginTarget = ref<Parent | null>(null)

const page = computed<number>({
    get: () => Number(route.query.page || 1),
    set: (value) => {
        updateQuery({
            page: value,
        });
    },
})

const size = ref(runtimeConf().limit);

async function fetchRecords() {
    try {
        loading.value = true;

        await store.fetchAll(page.value, size.value, search.value || undefined, sortBy.value, sortDirection.value);
    } catch (error) {
        console.error("Failed to fetch parents:", error);
    } finally {
        loading.value = false;
    }
}

watch(
    [page, size],
    async () => {
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

    useAppStore().setTitle('All Parents')
    document.title = 'Parents | Skultem'
});

watch(
    [() => search.value, () => sort.value],
    async () => {
        await fetchRecords()
    },
)
</script>
<template>
    <div class="px-4 sm:px-6">
        <UCard :ui="{ body: 'sm:p-0 p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex px-4 py-3 gap-2 items-center justify-between">
                    <div class="flex-1 border-default flex items-center gap-2">
                        <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name, email or phone"
                            class="flex-1" />
                        <ParentFilterDrawer v-model:sort="sort" :sort-options="sortOptions"
                            :active-count="activeFilterCount" :default-sort="DEFAULT_SORT" />
                    </div>
                    <TableViewToggle v-model="view" />
                </div>
            </template>
            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center justify-center py-14">
                        <UIcon name="i-lucide-users" class="mb-3 size-10 text-gray-400" />

                        <p class="text-sm text-gray-500">No parents found</p>
                    </div>
                </template>
                <template #name-cell="{ row }">
                    <div class="flex items-center gap-3">
                        <UAvatar icon="i-lucide-user" />

                        <div>
                            <p>{{ row.original.name }}</p>
                            <p v-if="row.original.email" class="text-xs text-muted">{{ row.original.email }}</p>
                            <UBadge v-else size="xs" variant="subtle" color="warning" label="No Email" />
                        </div>
                    </div>
                </template>
                <template #students-cell="{ row }">
                    <UBadge :label="`${row.original.students} Students`" variant="outline" />
                </template>
                <template #phone-cell="{ row }">
                    <p>{{ row.original.phone }}</p>
                </template>
                <template #city-cell="{ row }">
                    <div>
                        <p>{{ row.original.city }}</p>
                        <p class="text-xs text-muted">{{ row.original.street }}</p>
                    </div>
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
                <template #actions-cell="{ row }">
                    <div class="flex justify-end gap-1">
                        <UButton @click="editTarget = row.original" size="sm" variant="ghost" color="neutral"
                            label="Edit" :icon="EDIT_ICON" />
                        <UButton v-if="!row.original.email" @click="openAddEmail(row.original)" size="sm"
                            variant="ghost" color="warning" label="Add Email" :icon="EMAIL_ICON" />
                        <UButton @click="loginTarget = row.original" size="sm" variant="ghost" color="neutral"
                            label="Give login" icon="i-lucide-key-round" />
                        <UButton v-if="canDelete" @click="deleteTarget = row.original" size="sm" variant="ghost"
                            color="error" icon="lucide:trash-2" aria-label="Delete parent permanently" />
                    </div>
                </template>
            </UTable>
            <div class="md:p-4 md:space-y-4"
                :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
                <!-- Loading -->
                <template v-if="loading">
                    <div v-for="i in 6" :key="i" class="border-b md:border md:rounded-2xl border-default p-3">
                        <div class="flex items-center gap-3">
                            <USkeleton class="size-10 shrink-0 rounded-full" />

                            <div class="min-w-0 flex-1 space-y-2">
                                <USkeleton class="h-4 w-36 rounded-md" />
                                <USkeleton class="h-3 w-28 rounded-md" />
                            </div>
                        </div>
                    </div>
                </template>

                <template v-else-if="data?.length">
                    <div v-for="parent in data" :key="parent.id"
                        class="border-b md:border md:rounded-2xl border-default p-3">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex min-w-0 items-center gap-3">
                                <div class="min-w-0">
                                    <h3 class="truncate text-base font-bold text-highlighted">
                                        {{ parent.name }}
                                    </h3>

                                    <div class="flex min-w-0 items-center gap-1 text-xs-base text-muted">
                                        <span v-if="parent.email" class="truncate">{{ parent.email }}</span>
                                        <UBadge v-else size="xs" variant="subtle" color="warning" label="No Email"
                                            class="shrink-0" />

                                        <span class="shrink-0">•</span>

                                        <span class="shrink-0">{{ parent.students }} Student{{ parent.students === 1 ?
                                            "" : "s" }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex shrink-0 flex-col items-end gap-1.5">
                                <UBadge :label="STATUS_LABELS[parent.status]" :color="STATUS_COLORS[parent.status]"
                                    variant="subtle" size="sm" />
                                <UButton @click="editTarget = parent" size="xs" variant="ghost" color="neutral"
                                    label="Edit" :icon="EDIT_ICON" />
                                <UButton v-if="!parent.email" @click="openAddEmail(parent)" size="xs" variant="ghost"
                                    color="warning" label="Add Email" :icon="EMAIL_ICON" />
                                <UButton @click="loginTarget = parent" size="xs" variant="ghost" color="neutral"
                                    label="Give login" icon="i-lucide-key-round" />
                                <UButton v-if="canDelete" @click="deleteTarget = parent" size="xs" variant="ghost"
                                    color="error" label="Delete" icon="lucide:trash-2" />
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Empty -->
                <template v-else>
                    <div class="col-span-full flex flex-col items-center justify-center py-14">
                        <UIcon name="i-lucide-users" class="mb-3 size-10 text-gray-400" />

                        <h3 class="font-semibold">No Parents Found</h3>

                        <p class="text-sm text-gray-500">There are no parents to show yet.</p>
                    </div>
                </template>
            </div>
            <!-- Footer -->
            <template #footer>
                <div class="flex justify-between items-center flex-col md:flex-row space-y-2 md:space-y-0">
                    <Showing :meta="meta" />

                    <UPagination v-model:page="page" size="sm" :page-size="meta?.size || 10"
                        :items-per-page="meta?.size || 10" :total="meta?.total || 0" show-edges />
                </div>
            </template>
        </UCard>

        <ParentEdit v-if="editTarget" :open="!!editTarget" :parent="editTarget"
            @update:open="(v) => { if (!v) editTarget = null }" @saved="fetchRecords" />

        <ParentDeletePermanently v-if="deleteTarget" :open="!!deleteTarget" :parent="deleteTarget"
            @update:open="(v) => { if (!v) deleteTarget = null }" @deleted="fetchRecords" />

        <ParentAddEmail v-if="addEmailTarget" :open="!!addEmailTarget" :parent-id="addEmailTarget.id"
            :parent-name="addEmailTarget.name" @update:open="(v) => { if (!v) addEmailTarget = null }" />

        <AuthUsersResetPasswordPrompt v-if="loginTarget" :open="!!loginTarget" :user-id="loginTarget.userId"
            :user-name="loginTarget.name" :sign-in-with="loginTarget.phone"
            @update:open="(v) => { if (!v) loginTarget = null }" />
    </div>
</template>
