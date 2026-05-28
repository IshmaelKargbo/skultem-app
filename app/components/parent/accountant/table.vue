<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useParentStore()
const { format } = useMoney()
const { records: data, meta, loading } = storeToRefs(store)

const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns = [
  { accessorKey: 'name', header: 'Guardian', pin: 'left' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'students', header: 'Children' },
  { accessorKey: 'total', header: 'Total' },
  { accessorKey: 'paid', header: 'Paid' },
  { accessorKey: 'balance', header: 'Outstanding' },
  { accessorKey: 'status', header: 'Status' }
]

// PAGE (URL synced)
const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => {
    router.replace({
      query: {
        ...route.query,
        page: val,
        size: size.value
      }
    })
  }
})

// SIZE (URL synced)
const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => {
    router.replace({
      query: {
        ...route.query,
        page: page.value,
        size: val
      }
    })
  }
})

// FETCH whenever query changes
watch(
  () => [page.value, size.value],
  async () => {
    await fetchRecord()

    nextTick(() => {
      scrollContainer?.value?.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    })
  },
  { immediate: true }
)

async function fetchRecord() {
  loading.value = true
  try {
    await store.fetchAll(page.value, size.value)
  } finally {
    loading.value = false
  }
}

// Ensure initial query exists
onMounted(() => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value
      }
    })
  }
})
</script>

<template>
  <UCard :ui="{ body: 'sm:p-0' }">
    <div class="flex flex-col gap-3">

      <UTable :columns="columns" :data="data" :loading="loading" class="w-full">
        <!-- Empty state -->
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No parents found.</p>
          </div>
        </template>

        <!-- Status -->
        <template #status-cell="{ row }">
          <UBadge v-if="row.original.feeDetail" :label="row.original.feeDetail.status"
            :color="parseFeeStatusColor[row.original.feeDetail.status]"
            :icon="parseFeeStatusIcon[row.original.feeDetail.status]" variant="outline" />
        </template>

        <!-- Students -->
        <template #students-cell="{ row }">
          <UBadge variant="outline" :trailing-icon="STUDENT_ICON" :label="`${row.original.students} - `"  />
        </template>

        <!-- Total -->
        <template #total-cell="{ row }">
          <p v-if="row.original.feeDetail" class="text-error">
            {{ format(row.original.feeDetail.total) }}
          </p>
        </template>

        <!-- Paid -->
        <template #paid-cell="{ row }">
          <p v-if="row.original.feeDetail" class="text-success">
            {{ format(row.original.feeDetail.paid) }}
          </p>
        </template>

        <!-- Balance -->
        <template #balance-cell="{ row }">
          <p v-if="row.original.feeDetail" class="text-info">
            {{ format(row.original.feeDetail.balance) }}
          </p>
        </template>
      </UTable>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />

        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </template>

  </UCard>
    <UCard :ui="{ body: 'p-3 sm:p-4' }">
    <div class="space-y-3">
      <!-- Mobile List -->
      <template v-if="loading">
        <div
          v-for="i in 5"
          :key="i"
          class="rounded-2xl border border-default p-4"
        >
          <USkeleton class="h-4 w-32 mb-3" />
          <USkeleton class="h-3 w-48 mb-2" />
          <USkeleton class="h-3 w-24 mb-4" />

          <div class="grid grid-cols-2 gap-2">
            <USkeleton class="h-16 rounded-xl" />
            <USkeleton class="h-16 rounded-xl" />
            <USkeleton class="h-16 rounded-xl" />
            <USkeleton class="h-16 rounded-xl" />
          </div>
        </div>
      </template>

      <template v-else-if="data?.length">
        <div
          v-for="parent in data"
          :key="parent.id"
          class="rounded-2xl border border-default bg-default/30 overflow-hidden"
        >
          <!-- Top -->
          <div class="p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <UAvatar
                    :alt="parent.name"
                    size="sm"
                  />

                  <div class="min-w-0">
                    <h3 class="truncate font-semibold text-sm">
                      {{ parent.name }}
                    </h3>

                    <p class="truncate text-xs text-muted">
                      {{ parent.email }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-1 mt-3 text-xs text-muted">
                  <UIcon name="i-lucide-phone" class="size-3.5" />
                  <span>{{ parent.phone }}</span>
                </div>
              </div>

              <UBadge
                v-if="parent.feeDetail"
                :label="parent.feeDetail.status"
                :color="parseFeeStatusColor[parent.feeDetail.status]"
                variant="soft"
                size="sm"
                class="shrink-0"
              />
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-2 mt-4">
              <div class="rounded-xl bg-default/60 p-3">
                <div class="flex items-center justify-between">
                  <p class="text-[11px] text-muted">
                    Children
                  </p>

                  <UIcon
                    :name="STUDENT_ICON"
                    class="size-3.5 text-primary"
                  />
                </div>

                <p class="mt-2 text-sm font-semibold">
                  {{ parent.students }}
                </p>
              </div>

              <div class="rounded-xl bg-default/60 p-3">
                <p class="text-[11px] text-muted">
                  Outstanding
                </p>

                <p class="mt-2 text-sm font-semibold text-info truncate">
                  {{
                    parent.feeDetail
                      ? format(parent.feeDetail.balance)
                      : '-'
                  }}
                </p>
              </div>

              <div class="rounded-xl bg-default/60 p-3">
                <p class="text-[11px] text-muted">
                  Total
                </p>

                <p class="mt-2 text-sm font-semibold text-error truncate">
                  {{
                    parent.feeDetail
                      ? format(parent.feeDetail.total)
                      : '-'
                  }}
                </p>
              </div>

              <div class="rounded-xl bg-default/60 p-3">
                <p class="text-[11px] text-muted">
                  Paid
                </p>

                <p class="mt-2 text-sm font-semibold text-success truncate">
                  {{
                    parent.feeDetail
                      ? format(parent.feeDetail.paid)
                      : '-'
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- Bottom Action -->
          <div
            class="border-t border-default bg-default/40 px-4 py-3 flex items-center justify-between"
          >
            <div class="text-xs text-muted">
              Guardian Account
            </div>

            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-lucide-chevron-right"
            />
          </div>
        </div>
      </template>

      <!-- Empty -->
      <template v-else>
        <div class="flex flex-col items-center justify-center py-14">
          <div
            class="flex size-14 items-center justify-center rounded-full bg-default"
          >
            <UIcon
              name="ph:books-light"
              class="text-2xl text-muted"
            />
          </div>

          <h3 class="mt-4 text-sm font-semibold">
            No parents found
          </h3>

          <p class="mt-1 text-xs text-muted">
            Parent records will appear here.
          </p>
        </div>
      </template>

      <!-- Pagination -->
      <div
        class="flex flex-col gap-3 border-t border-default pt-4"
      >
        <Showing :meta="meta" />

        <div class="overflow-x-auto pb-1">
          <UPagination
            v-model:page="page"
            :page-size="meta.size"
            :items-per-page="meta.size"
            :total="meta.total"
            size="xs"
            show-edges
          />
        </div>
      </div>
    </div>
  </UCard>
</template>