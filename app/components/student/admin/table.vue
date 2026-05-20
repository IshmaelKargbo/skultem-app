<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useStudentStore()
const { records: data, meta, loading } = storeToRefs(store)

const parseStaus: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  DELETED: 'Deleted'
}

const parseStatusColor: Record<string, string> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  DELETED: 'danger'
}

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }: any) => {
      return `${row.original.givenNames} ${row.original.familyName}`
    }
  },
  {
    accessorKey: 'dateOfBirth',
    header: 'Date of Birth'
  },
  {
    accessorKey: 'gender',
    header: 'Gender'
  },
  {
    accessorKey: 'className',
    header: 'Class'
  },
  {
    accessorKey: 'parent',
    header: 'Guardian'
  },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'text-right'
      }
    }
  }
]

function view(row: Student) {
  router.push(`/students/${row.id}`)
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val })
})

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery }

  if (
    merged.page === route.query.page &&
    merged.size === route.query.size
  ) {
    return
  }

  router.replace({ query: merged })
}

function name(row: Student) {
  return `${row.givenNames} ${row.familyName}`
}

const skeletonRows = Array(runtimeConf().limit).fill({})

async function fetchRecord() {
  await store.fetchAll(page.value, size.value)
}

watch(() => page.value, () => {
  router.replace({
    query: {
      page: page.value,
      size: size.value
    }
  })

  fetchRecord()
}, { immediate: true })

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value
      }
    })
  }

  fetchRecord()
})
</script>

<template>
  <UCard class="hidden md:block" :ui="{ body: 'p-0 sm:p-0' }">
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
          <p class="text-gray-500 dark:text-gray-400">No students found.</p>
        </div>
      </template>
      <template #parent-cell="{ row }">
        <p>{{ row.original.guardian?.givenNames }} {{ row.original.guardian?.familyName }}</p>
      </template>
      <template #gender-cell="{ row }">
        <UBadge :label="parseGender[row.original.gender]" :color="parseGenderColor[row.original.gender]"
          variant="outline" />
      </template>
      <template #name-cell="{ row }">
        <StudentIdentityCell
          :given-names="row.original.givenNames"
          :family-name="row.original.familyName"
          :photo="row.original.photo"
          :subtitle="`${row.original.admissionNumber || 'No Admission No'} · ${row.original.className || 'No Class'}`"
        />
      </template>
      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
      <template #actions-cell="{ row }">
        <div>
          <UButton @click="view(row.original)" size="sm" variant="ghost" color="success" :icon="VIEW_ICON" />
        </div>
      </template>
    </UTable>
    <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </template>
  </UCard>
  <div v-if="loading" class="md:hidden space-y-3">
    <UCard v-for="i in 5" :key="i">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex space-x-2">
            <USkeleton class="h-10 w-10 rounded-full" />
            <div class="space-y-2">
              <USkeleton class="h-3 w-28" />
              <USkeleton class="h-2 w-20" />
            </div>
          </div>

          <USkeleton class="h-5 w-16 rounded-full" />
        </div>
      </template>

      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <USkeleton class="h-2 w-16" />
          <USkeleton class="h-3 w-24" />
        </div>

        <div class="space-y-2">
          <USkeleton class="h-2 w-16" />
          <USkeleton class="h-3 w-20" />
        </div>

        <div class="space-y-2">
          <USkeleton class="h-2 w-16" />
          <USkeleton class="h-3 w-28" />
        </div>

        <div class="space-y-2">
          <USkeleton class="h-2 w-16" />
          <USkeleton class="h-3 w-24" />
        </div>

        <div class="space-y-2">
          <USkeleton class="h-2 w-16" />
          <USkeleton class="h-3 w-28" />
        </div>
      </div>
    </UCard>
  </div>
  <UCard v-for="item in data" :key="item.id" class="md:hidden">
    <template #header>
      <div>
        <div class="flex justify-between items-center">
          <div class="flex space-x-2">
            <div>
              <UAvatar
                size="lg"
                :src="item.photo || '/avatar-placeholder.svg'"
                :alt="`${item.givenNames} ${item.familyName}`"
                class="ring-1 ring-gray-200 dark:ring-gray-700"
              />
            </div>
            <div>
              <p class="text-sm">{{ `${item.givenNames} ${item.familyName}` }}</p>
              <p class="text-[11px] text-mute">{{ item.className }}</p>
            </div>
          </div>
          <div>
            <UBadge :label="parseStaus[item.status]" :color="parseStatusColor[item.status]" variant="outline" />
          </div>
        </div>
      </div>
    </template>
    <div class="grid grid-cols-2 md:gap-5 gap-3">
      <div class="space-y-0.5">
        <p class="text-[10px] text-mute uppercase">Date of birth</p>
        <p>{{ formatDate(item.dateOfBirth) }}</p>
      </div>
      <div class="space-y-0.5">
        <p class="text-[10px] text-mute uppercase">Gender</p>
        <UBadge :label="parseGender[item.gender]" :color="parseGenderColor[item.gender]" size="sm" variant="outline" />
      </div>
      <div class="space-y-0.5">
        <p class="text-[10px] text-mute uppercase">Guardian</p>
        <p>{{ item.guardian?.givenNames }} {{ item.guardian?.familyName }}</p>
      </div>
      <div class="space-y-0.5">
        <p class="text-[10px] text-mute uppercase">Father</p>
        <p>{{ item.family?.fatherName }}</p>
      </div>
      <div class="space-y-0.5">
        <p class="text-[10px] text-mute uppercase">Mother</p>
        <p>{{ item.family?.motherName }}</p>
      </div>
    </div>
  </UCard>
  <div class="flex justify-between items-center mt-3 md:hidden">
    <Showing :meta="meta" />
    <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
      show-edges />
  </div>
</template>
