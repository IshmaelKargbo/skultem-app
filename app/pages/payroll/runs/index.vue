<template>
  <div class="space-y-4 px-4 md:px-6">

    <Heading title="Payroll Runs" subtitle="Every payroll cycle, past and present.">
      <UButton icon="i-lucide-play" to="/payroll/runs/new" label="Start Payroll Run" />
    </Heading>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 4" :key="i" class="h-20 w-full rounded-xl" />
    </div>

    <!-- Runs -->
    <UCard v-else-if="runs.length" :ui="{ body: 'divide-y divide-default sm:p-0 p-0' }">
      <NuxtLink v-for="run in runs" :key="run.id" :to="`/payroll/runs/${run.id}`"
        class="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/40">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UIcon name="i-lucide-wallet" class="size-5" />
          </div>
          <div>
            <h3 class="font-medium">{{ run.period }}</h3>
            <p class="text-xs text-muted">Pay date {{ formatDate(run.payDate) }}</p>
          </div>
        </div>

        <UBadge :color="payrollRunStatusColor(run.status)" variant="soft">
          {{ clean(run.status) }}
        </UBadge>
      </NuxtLink>

      <template v-if="meta.total > meta.size" #footer>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>

    <!-- Empty -->
    <UCard v-else class="py-16">
      <div class="flex flex-col items-center gap-3 text-center">
        <UIcon name="i-lucide-history" class="text-4xl text-muted" />
        <h3 class="font-semibold">No payroll runs yet</h3>
        <p class="text-sm text-muted">Start your first payroll run once salaries are set up.</p>
        <UButton size="sm" icon="i-lucide-play" to="/payroll/runs/new">Start Payroll Run</UButton>
      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
const store = usePayrollStore()
const { runs, runsMeta: meta, loadingRuns: loading } = storeToRefs(store)

const route = useRoute()
const router = useRouter()

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

watch(() => page.value, () => store.fetchRuns(page.value, 10), { immediate: true })

onMounted(() => {
  useAppStore().setTitle('Payroll Runs')
  useAppStore().setBack('/payroll')
  document.title = 'Payroll Runs | Payroll | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
