<template>
  <div class="space-y-4 px-4 md:px-6">
    <!-- Section nav and the Student/Staff toggle share a row on desktop (nav left, toggle right); on a
         phone they stack, with the toggle spanning the full width. -->
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <IdCardsSectionNav />
      <!-- Same pill-tab look as the app's Tab component (that one is link-based, this switches a local value). -->
      <div class="flex w-full gap-1 rounded-3xl md:inline-flex md:w-auto border border-gray-200 bg-white p-1.5 dark:border-gray-800 dark:bg-gray-900">
        <button v-for="tab in cardTypeTabs" :key="tab.value" type="button"
          class="flex flex-1 items-center justify-center gap-1.5 rounded-3xl px-4 py-2 md:flex-none text-[12px] sm:text-sm whitespace-nowrap transition-all duration-200"
          :class="cardType === tab.value
            ? 'bg-secondary-100 text-secondary-600 font-semibold dark:bg-secondary-800 dark:text-secondary-200'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'"
          @click="setCardType(tab.value)">
          <UIcon :name="tab.icon" class="size-4 shrink-0" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex items-center justify-between gap-2 px-4 py-3">
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <UInput v-model="searchInput" :icon="SEARCH_ICON"
              :placeholder="cardType === 'student' ? 'Search by name or admission no' : 'Search by name or staff ID'"
              class="min-w-0 flex-1" />
            <StudentFilterDrawer v-if="cardType === 'student'" v-model:class-id="classId" v-model:gender="gender"
              v-model:sort="sort" :class-options="classOptions" :sort-options="studentSortOptions"
              :active-count="activeFilterCount" :default-sort="studentDefaultSort" />
            <TeacherFilterDrawer v-else v-model:gender="gender" v-model:sort="sort" :sort-options="staffSortOptions"
              :active-count="activeFilterCount" :default-sort="staffDefaultSort" />
          </div>
          <UButton icon="i-lucide-settings-2" variant="soft" color="neutral" to="/id-cards/settings"
            class="hidden md:flex">
            Card Design
          </UButton>
          <UButton icon="i-lucide-settings-2" variant="soft" color="neutral" to="/id-cards/settings"
            aria-label="Card Design" class="md:hidden" />
          <TableViewToggle v-model="tableView" />
        </div>
      </template>

      <!-- Table (desktop) -->
      <UTable v-if="tableView === 'table'" class="hidden md:block" :columns="columns" :data="filteredRecords"
        :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-id-card" class="text-4xl text-gray-400 dark:text-gray-500" />
            <p class="text-gray-500 dark:text-gray-400">
              No {{ cardType === 'student' ? 'students' : 'staff' }} match these filters.
            </p>
          </div>
        </template>
        <template #name-cell="{ row }">
          <div class="flex min-w-0 items-center gap-3">
            <UAvatar size="lg" :src="row.original.photo || ALT_IMAGE" :alt="row.original.name" loading="lazy"
              class="shrink-0 ring-1 ring-gray-200 dark:ring-gray-700" />
            <div class="min-w-0 space-y-0.5">
              <p class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{{ row.original.name }}</p>
              <p v-if="row.original.subtitle" class="truncate text-xs text-gray-500 dark:text-gray-400">
                {{ row.original.subtitle }}
              </p>
            </div>
          </div>
        </template>
        <template #badge-cell="{ row }">
          <UBadge v-if="row.original.badge" color="secondary" variant="subtle">{{ row.original.badge }}</UBadge>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
        <template #actions-cell="{ row }">
          <UButton size="sm" variant="soft" icon="i-lucide-eye" :to="row.original.href">
            Preview & Print
          </UButton>
        </template>
      </UTable>

      <!-- List on a phone / grid in card view on desktop -->
      <div class="md:p-4 md:space-y-4"
        :class="tableView === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <template v-if="loading && !filteredRecords.length">
          <div v-for="i in 6" :key="i" class="animate-pulse">
            <div class="flex items-center justify-between gap-3 border-b border-default p-3 md:rounded-2xl md:border">
              <div class="flex min-w-0 items-center gap-3">
                <USkeleton class="size-10 shrink-0 rounded-full" />
                <div class="min-w-0 space-y-2">
                  <USkeleton class="h-4 w-28 rounded-md" />
                  <USkeleton class="h-3 w-24 rounded-md" />
                </div>
              </div>
              <USkeleton class="h-6 w-16 shrink-0 rounded-md" />
            </div>
          </div>
        </template>

        <template v-else-if="filteredRecords.length">
          <NuxtLink v-for="record in filteredRecords" :key="record.id" :to="record.href" class="block cursor-pointer">
            <div class="border-b border-default p-3 md:rounded-2xl md:border">
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <UAvatar class="size-10" :src="record.photo || ALT_IMAGE" :alt="record.name" loading="lazy" />
                  <div class="min-w-0">
                    <h3 class="truncate text-base font-bold text-highlighted">{{ record.name }}</h3>
                    <div class="flex items-center gap-1 text-xs-base text-muted">
                      <span v-if="record.badge">{{ record.badge }}</span>
                      <span v-if="record.badge && record.subtitle">•</span>
                      <span v-if="record.subtitle">{{ record.subtitle }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-2 self-center">
                  <UIcon name="i-lucide-eye" class="size-4 text-muted" />
                </div>
              </div>
            </div>
          </NuxtLink>
        </template>

        <template v-else>
          <UCard class="col-span-full">
            <div class="flex flex-col items-center justify-center py-14">
              <UIcon name="i-lucide-id-card" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />
              <p class="text-sm text-gray-500 dark:text-gray-400">
                No {{ cardType === 'student' ? 'students' : 'staff' }} match these filters.
              </p>
            </div>
          </UCard>
        </template>
      </div>

      <template #footer>
        <div v-if="meta.total" class="flex flex-col items-center justify-between space-y-2 md:flex-row md:space-y-0">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const studentStore = useStudentStore()
const teacherStore = useTeacherStore()
const classStore = useClassStore()
const { records: students, meta: studentMeta, loading: studentLoading } = storeToRefs(studentStore)
const { records: teachers, meta: teacherMeta, loading: teacherLoading } = storeToRefs(teacherStore)
const { records: classes, loading: classLoading } = storeToRefs(classStore)

const tableView = ref<'table' | 'card'>('table')
const cardType = ref<'student' | 'staff'>('student')
const searchInput = ref('')
const search = ref('')
const classId = ref('')
const gender = ref('')

// Students and staff sort on different fields, so each has its own list and default.
const studentSortOptions = [
  { label: 'Name (A-Z)', value: 'givenNames:asc' },
  { label: 'Name (Z-A)', value: 'givenNames:desc' },
  { label: 'Newest First', value: 'createdAt:desc' },
  { label: 'Oldest First', value: 'createdAt:asc' }
]
const studentDefaultSort = 'createdAt:desc'
const staffSortOptions = [
  { label: 'Name (A-Z)', value: 'user.givenName:asc' },
  { label: 'Name (Z-A)', value: 'user.givenName:desc' },
  { label: 'Newest First', value: 'createdAt:desc' },
  { label: 'Oldest First', value: 'createdAt:asc' }
]
const staffDefaultSort = 'createdAt:desc'
const sort = ref(studentDefaultSort)
const sortBy = computed(() => sort.value.split(':')[0])
const sortDirection = computed(() => sort.value.split(':')[1])

const activeFilterCount = computed(() => [
  cardType.value === 'student' ? classId.value : '',
  gender.value,
  sort.value !== (cardType.value === 'student' ? studentDefaultSort : staffDefaultSort)
].filter(Boolean).length)

// Debounced so every keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (val) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { search.value = val }, 350)
})

const meta = computed(() => (cardType.value === 'staff' ? teacherMeta.value : studentMeta.value))
const loading = computed(() => (cardType.value === 'staff' ? teacherLoading.value : studentLoading.value))

const classOptions = computed(() => classes.value.map(c => ({ label: c.name, value: c.id })))

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

const size = ref(runtimeConf().limit)

async function fetchRecords() {
  if (cardType.value === 'staff') {
    await teacherStore.fetchAll(page.value, size.value, search.value, sortBy.value, sortDirection.value, gender.value || undefined)
  } else {
    await studentStore.fetchAll(page.value, size.value, search.value, classId.value || undefined, sortBy.value, sortDirection.value, gender.value || undefined)
  }
}

watch([page, size], fetchRecords, { immediate: true })

// A new search / filter starts again from page 1; if already there the page watch won't fire, so fetch directly.
watch([search, classId, gender, sort, cardType], () => {
  if (page.value === 1) fetchRecords()
  else page.value = 1
})

const columns = computed(() => [
  { accessorKey: 'name', header: cardType.value === 'student' ? 'Student' : 'Staff' },
  { accessorKey: 'badge', header: cardType.value === 'student' ? 'Admission No' : 'Staff ID' },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
])

const cardTypeTabs = [
  { value: 'student', label: 'Students', icon: 'i-lucide-graduation-cap' },
  { value: 'staff', label: 'Staff', icon: 'i-lucide-briefcase' }
] as const

function setCardType(type: 'student' | 'staff') {
  if (cardType.value === type) return
  cardType.value = type
  resetFilters()
}

const filteredRecords = computed(() => {
  if (cardType.value === 'staff') {
    return teachers.value.map(t => ({
      id: t.id,
      name: `${t.user.givenNames} ${t.user.familyName}`,
      subtitle: t.designation || 'Staff',
      badge: t.staffId,
      photo: t.user.photo,
      href: `/id-cards/${t.id}?type=staff`
    }))
  }

  return students.value.map(s => ({
    id: s.id,
    name: `${s.givenNames} ${s.familyName}`,
    subtitle: s.className,
    badge: s.admissionNumber,
    photo: s.photo,
    href: `/id-cards/${s.id}`
  }))
})

// Switching between students and staff drops every filter (the two lists don't share sort fields).
function resetFilters() {
  searchInput.value = ''
  search.value = ''
  classId.value = ''
  gender.value = ''
  sort.value = cardType.value === 'student' ? studentDefaultSort : staffDefaultSort
}

onMounted(() => {
  useAppStore().setTitle('ID Cards')
  document.title = 'ID Cards | Skultem'
  if (!classes.value.length) classStore.fetchAll(1, 100)
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
