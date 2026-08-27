<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useStudentStore()
const { format } = useMoney()
const { records: data, meta, loading } = storeToRefs(store)

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }: any) => `${row.original.givenNames} ${row.original.familyName}`
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
    accessorKey: 'guardian.givenNames',
    header: 'Guardian',
    cell: ({ row }: any) => `${row.original.guardian.givenNames} ${row.original.guardian.familyName}`
  },
  {
    accessorKey: 'family.fatherName',
    header: 'Father'
  },
  {
    accessorKey: 'family.motherName',
    header: 'Mother'
  },
  {
    accessorKey: 'total',
    header: 'Total'
  },
  {
    accessorKey: 'paid',
    header: 'Paid'
  },
  {
    accessorKey: 'balance',
    header: 'Outstanding'
  },
  {
    accessorKey: 'status',
    header: 'Status'
  }
]

const columnPinning = ref({
  left: ['name'],
  right: ['status']
})

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = ref(runtimeConf().limit)

async function fetchRecord() {
  loading.value = true
  await store.fetchAll(page.value, size.value)
  loading.value = false
}

function viewStudent(row: Student) {
  router.push(`/students/${row.id}/fee-structure`)
}

watch(() => page.value, () => {
  updateQuery({
    page: page.value
  })
  fetchRecord()
}, { immediate: true })

onMounted(() => {
  updateQuery({
    page: page.value
  })
})
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex justify-end">
        <TableViewToggle v-model="view" />
      </div>
    </template>

    <UTable v-if="view === 'table'" class="hidden md:block w-full" :column-pinning="columnPinning" :columns="columns"
      :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
          <p class="text-gray-500 dark:text-gray-400">No students found.</p>
        </div>
      </template>
      <template #status-cell="{ row }">
        <UBadge v-if="row.original.feeDetail" :label="row.original.feeDetail.status"
          :color="parseFeeStatusColor[row.original.feeDetail.status]"
          :icon="parseFeeStatusIcon[row.original.feeDetail.status]" variant="outline" />
      </template>
      <template #gender-cell="{ row }">
        <UBadge :label="parseGender[row.original.gender]" :color="parseGenderColor[row.original.gender]"
          variant="outline" />
      </template>
      <template #name-cell="{ row }">
        <StudentIdentityCell :given-names="row.original.givenNames" :family-name="row.original.familyName"
          :photo="row.original.photo" :subtitle="row.original.className || 'No Class'" />
      </template>
      <template #total-cell="{ row }">
        <p class="text-error">{{ format(row.original.feeDetail?.total) }}</p>
      </template>
      <template #paid-cell="{ row }">
        <p class="text-success">{{ format(row.original.feeDetail?.paid) }}</p>
      </template>
      <template #balance-cell="{ row }">
        <p class="text-info">{{ format(row.original.feeDetail?.balance) }}</p>
      </template>
    </UTable>

    <!-- Mobile -->
    <div class="p-4 space-y-4"
      :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
      <template v-if="loading">
        <UCard v-for="i in 6" :key="i" class="overflow-hidden rounded-2xl border border-default shadow-sm"
          :ui="{ body: 'p-0' }">
          <div class="animate-pulse">
            <!-- Header -->
            <div class="border-b border-default  p-3 md:p-0 md:pb-3 ">
              <div class="flex items-center justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <!-- Avatar -->
                  <USkeleton class="size-12 shrink-0 rounded-xl" />

                  <!-- Name -->
                  <div class="min-w-0 space-y-2">
                    <USkeleton class="h-4 w-36 rounded-md" />
                    <USkeleton class="h-3 w-28 rounded-md" />
                  </div>
                </div>

                <!-- Status -->
                <USkeleton class="h-6 w-16 shrink-0 rounded-full" />
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 p-4">
              <div v-for="j in 4" :key="j" class="rounded-2xl border border-default bg-muted/40 p-3">
                <div class="mb-3 flex items-center gap-2">
                  <USkeleton class="size-7 shrink-0 rounded-lg" />
                  <USkeleton class="h-3 w-16 rounded-md" />
                </div>

                <USkeleton class="h-4 w-24 rounded-md" />
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between gap-3 border-t border-default  p-3 md:p-0 md:pt-3 ">
              <div class="flex min-w-0 items-center gap-3">
                <USkeleton class="size-10 shrink-0 rounded-full" />

                <div class="min-w-0 space-y-2">
                  <USkeleton class="h-4 w-28 rounded-md" />
                  <USkeleton class="h-3 w-24 rounded-md" />
                </div>
              </div>

              <USkeleton class="h-9 w-20 shrink-0 rounded-xl" />
            </div>
          </div>
        </UCard>
      </template>

      <!-- Data -->
      <template v-else-if="data?.length">
        <UCard v-for="item in data" :key="item.id" class="group cursor-pointer hover:ring-secondary-300" :ui="{ body: 'sm:p-0 p-0' }" @click="viewStudent(item)">
          <!-- Header -->
          <template #header>
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar size="2xl" :src="item.photo || '/avatar-placeholder.svg'"
                  :alt="`${item.givenNames} ${item.familyName}`" />

                <div class="min-w-0">
                  <h3 class="truncate text-base font-bold text-highlighted">
                    {{ item.givenNames }} {{ item.familyName }}
                  </h3>

                  <div class="flex items-center gap-1 text-xs-base text-muted">
                    <span>
                      {{ item.admissionNumber || 'No Admission No' }}
                    </span>

                    <span>•</span>

                    <span>
                      {{ item.className || 'No Class' }}
                    </span>
                  </div>
                </div>
              </div>

              <UBadge v-if="item.feeDetail" :label="item.feeDetail.status"
                :color="parseFeeStatusColor[item.feeDetail.status]" :icon="parseFeeStatusIcon[item.feeDetail.status]"
                variant="soft" />
            </div>
          </template>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3 p-4">
            <!-- Total -->
            <div
              class="min-w-0 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-500/20 dark:bg-red-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/20">
                  <UIcon name="i-lucide-receipt" class="size-4 text-red-600 dark:text-red-400" />
                </div>

                <p class="text-[10px] font-medium uppercase tracking-wide text-red-700 dark:text-red-300">
                  Total
                </p>
              </div>

              <p class="truncate text-sm font-medium text-highlighted">
                {{ format(item.feeDetail?.total || 0) }}
              </p>
            </div>

            <!-- Paid -->
            <div
              class="min-w-0 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                  <UIcon name="i-lucide-circle-check-big" class="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>

                <p class="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Paid
                </p>
              </div>

              <p class="truncate text-sm font-medium text-highlighted">
                {{ format(item.feeDetail?.paid || 0) }}
              </p>
            </div>

            <!-- Balance -->
            <div
              class="min-w-0 rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/20 dark:bg-blue-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                  <UIcon name="i-lucide-wallet" class="size-4 text-blue-600 dark:text-blue-400" />
                </div>

                <p class="text-[10px] font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Balance
                </p>
              </div>

              <p class="truncate text-sm font-medium text-highlighted">
                {{ format(item.feeDetail?.balance || 0) }}
              </p>
            </div>

            <!-- Guardian -->
            <div
              class="min-w-0 rounded-xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                  <UIcon name="i-lucide-user-round" class="size-4 text-violet-600 dark:text-violet-400" />
                </div>

                <p class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                  Guardian
                </p>
              </div>

              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.guardian?.givenNames }}
                {{ item.guardian?.familyName }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <template #footer>
            <div class="flex items-center justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar size="xl" icon="i-lucide-users" />

                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-highlighted">
                    {{ item.family?.fatherName || 'No Father Name' }}
                  </p>

                  <p class="truncate text-xs text-muted">
                    {{ item.family?.motherName || 'No Mother Name' }}
                  </p>
                </div>
              </div>

              <UButton icon="i-lucide-arrow-right" color="neutral" variant="soft" square
                class="rounded-xl transition-all group-hover:bg-secondary hover:bg-secondary cursor-pointer group-hover:text-white group-hover:translate-x-1" />
            </div>
          </template>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else>
        <UCard class="col-span-full">
          <div class="flex flex-col items-center justify-center py-14">
            <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />

            <p class="text-sm text-gray-500 dark:text-gray-400">No students found.</p>
          </div>
        </UCard>
      </template>

    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </template>
  </UCard>
</template>