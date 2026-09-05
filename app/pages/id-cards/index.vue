<template>
  <div class="space-y-4 px-4 md:px-6">
    <!-- Filters -->
    <UCard>
      <template #header>
        <div class="flex space-x-3">
          <div class="grid flex-1 gap-3 lg:grid-cols-2">
            <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search by name or admission no..." />
            <USelectMenu v-model="selectedClass" value-key="value" :items="classOptions" placeholder="Class"
              :loading="classLoading" clear />
          </div>
          <div class="space-x-3">
            <UButton icon="i-lucide-x" variant="outline" label="Clear" @click="resetFilters" />

            <UButton icon="i-lucide-settings-2" variant="outline" class="justify-center" to="/id-cards/settings">
              Card Design
            </UButton>
          </div>
        </div>
      </template>

      <!-- Loading -->
      <div v-if="loading && !filteredStudents.length" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
      <div v-else-if="filteredStudents.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <UCard v-for="student in filteredStudents" :key="student.id" variant="outline">
          <div class="flex gap-2.5 justify-between items-center">
            <div class="flex gap-2.5 items-center">
              <UAvatar size="2xl" :src="student.photo || ALT_IMAGE"
                :alt="`${student.givenNames} ${student.familyName}`" />

              <div class="min-w-0">
                <h3 class="truncate font-semibold">{{ student.givenNames }} {{ student.familyName }}</h3>
                <p class="text-xs text-muted">{{ student.className }}</p>
              </div>
            </div>
            <div>
              <UBadge color="secondary" variant="subtle">{{ student.admissionNumber }}</UBadge>
            </div>
          </div>

          <template #footer>
            <div>
              <UButton block icon="i-lucide-eye" variant="soft" :to="`/id-cards/${student.id}`">
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
          <h3 class="mt-3 text-base font-semibold text-highlighted">No students match these filters</h3>
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
const classStore = useClassStore()
const { records: students, meta, loading } = storeToRefs(studentStore)
const { records: classes, loading: classLoading } = storeToRefs(classStore)

const search = ref('')
const selectedClass = ref('')

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

async function fetchStudents() {
  await studentStore.fetchAll(page.value, size.value, search.value)
}

watch([page, size, search], fetchStudents, { immediate: true })

const filteredStudents = computed(() =>
  selectedClass.value ? students.value.filter(s => s.classId === selectedClass.value) : students.value
)

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
