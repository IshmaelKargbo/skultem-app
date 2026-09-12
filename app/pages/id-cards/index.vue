<template>
  <div class="space-y-4 px-4 md:px-6">
    <IdCardsSectionNav />

    <!-- Student / Staff toggle - same design, different record source (see [[id-cards-staff]]).
         Switching tabs resets the filters below since class/search only make sense for students. -->
    <div class="inline-flex overflow-hidden rounded-lg border border-default">
      <UButton :variant="cardType === 'student' ? 'solid' : 'outline'" color="neutral" size="sm" class="rounded-none"
        icon="i-lucide-graduation-cap" @click="setCardType('student')">
        Students
      </UButton>
      <UButton :variant="cardType === 'staff' ? 'solid' : 'outline'" color="neutral" size="sm" class="rounded-none"
        icon="i-lucide-briefcase" @click="setCardType('staff')">
        Staff
      </UButton>
    </div>

    <!-- Filters -->
    <UCard>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div class="grid flex-1 gap-3" :class="cardType === 'student' ? 'lg:grid-cols-2' : ''">
            <UInput v-model="search" :icon="SEARCH_ICON"
              :placeholder="cardType === 'student' ? 'Search by name or admission no...' : 'Search by name or staff ID...'"
              class="w-full" />
            <USelectMenu v-if="cardType === 'student'" v-model="selectedClass" value-key="value" :items="classOptions"
              placeholder="Class" :loading="classLoading" clear class="w-full" />
          </div>
          <div class="flex gap-3 sm:shrink-0">
            <UButton icon="i-lucide-x" variant="outline" label="Clear" class="flex-1 justify-center sm:flex-none"
              @click="resetFilters" />

            <UButton icon="i-lucide-settings-2" variant="outline" class="flex-1 justify-center sm:flex-none"
              to="/id-cards/settings">
              Card Design
            </UButton>
          </div>
        </div>
      </template>

      <!-- Loading -->
      <div v-if="loading && !filteredRecords.length" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <UCard v-for="i in 6" :key="i">
          <div class="flex gap-3">
            <USkeleton class="size-16 rounded-full" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-2/3" />
              <USkeleton class="h-3 w-1/2" />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Cards -->
      <div v-else-if="filteredRecords.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <UCard v-for="record in filteredRecords" :key="record.id" variant="outline">
          <div class="flex gap-2.5 justify-between items-center">
            <div class="flex gap-2.5 items-center">
              <UAvatar size="2xl" :src="record.photo || ALT_IMAGE" :alt="record.name" loading="lazy" />

              <div class="min-w-0">
                <h3 class="truncate font-semibold">{{ record.name }}</h3>
                <p class="text-xs text-muted">{{ record.subtitle }}</p>
              </div>
            </div>
            <div>
              <UBadge color="secondary" variant="subtle">{{ record.badge }}</UBadge>
            </div>
          </div>

          <template #footer>
            <div>
              <UButton block icon="i-lucide-eye" variant="soft" :to="record.href">
                Preview & Print
              </UButton>
            </div>
          </template>
        </UCard>
      </div>

      <UCard v-else>
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon name="i-lucide-id-card" class="text-3xl text-primary-500" />
          </div>
          <h3 class="mt-3 text-base font-semibold text-highlighted">
            No {{ cardType === 'student' ? 'students' : 'staff' }} match these filters
          </h3>
          <p class="mt-1 text-sm text-muted">Try adjusting your search or clearing the filters.</p>
        </div>
      </UCard>

      <template #footer>
        <div v-if="meta.total" class="flex items-center justify-between">
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

const cardType = ref<'student' | 'staff'>('student')
const search = ref('')
const selectedClass = ref('')

const meta = computed(() => (cardType.value === 'staff' ? teacherMeta.value : studentMeta.value))
const loading = computed(() => (cardType.value === 'staff' ? teacherLoading.value : studentLoading.value))

// No "All Classes" entry - a Reka UI Combobox item's value can't be an empty string (it throws
// "A <ComboboxItem /> must have a value prop that is not an empty string" the moment the list
// renders, breaking every item in it). The placeholder below already covers "nothing selected",
// and the select's own :clear button gets back to it.
const classOptions = computed(() => classes.value.map(c => ({ label: c.name, value: c.id })))

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

const size = ref(runtimeConf().limit)

async function fetchRecords() {
  if (cardType.value === 'staff') await teacherStore.fetchAll(page.value, size.value, search.value)
  else await studentStore.fetchAll(page.value, size.value, search.value)
}

watch([page, size, search, cardType], fetchRecords, { immediate: true })

function setCardType(type: 'student' | 'staff') {
  if (cardType.value === type) return
  cardType.value = type
  resetFilters()
  page.value = 1
}

// Same "Preview & Print" grid either way - normalised here so the template only deals with one
// shape instead of branching on cardType in the markup.
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

  const filtered = selectedClass.value ? students.value.filter(s => s.classId === selectedClass.value) : students.value
  return filtered.map(s => ({
    id: s.id,
    name: `${s.givenNames} ${s.familyName}`,
    subtitle: s.className,
    badge: s.admissionNumber,
    photo: s.photo,
    href: `/id-cards/${s.id}`
  }))
})

function resetFilters() {
  search.value = ''
  selectedClass.value = ''
}

onMounted(() => {
  useAppStore().setTitle('ID Cards')
  document.title = 'ID Cards | Skultem'
  if (!classes.value.length) classStore.fetchAll(1, 100)
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
