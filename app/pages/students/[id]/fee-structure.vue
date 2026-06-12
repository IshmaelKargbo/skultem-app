<template>
    <StudentView>
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold text-lg">
                            Fee Structure
                        </h3>
                        <p class="text-sm text-muted">
                            Breakdown of student fees, payments, and outstanding balances.
                        </p>
                    </div>

                    <div class="flex items-center gap-2">
                        <UButton v-if="can('ACCOUNTANT')" to="/payments" icon="i-lucide-credit-card"
                            label="Record Payment" color="primary" size="sm" />
                    </div>
                </div>
            </template>
            <!-- Fee Summary -->
            <StudentViewFeeSummary />

            <!-- Fee Items -->
            <div v-if="loading" class="space-y-3">
                <div v-for="i in 5" :key="i"
                    class="rounded-xl border-2  dark:border-gray-700 dark:bg-gray-950 border-gray-100 bg-white p-4">
                    <div class="flex items-start justify-between">
                        <div class="space-y-2">
                            <USkeleton class="h-5 w-40" />
                            <USkeleton class="h-4 w-28" />
                        </div>

                        <USkeleton class="h-6 w-20 rounded-full" />
                    </div>

                    <div class="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div class="space-y-2">
                            <USkeleton class="h-3 w-16" />
                            <USkeleton class="h-5 w-24" />
                        </div>

                        <div class="space-y-2">
                            <USkeleton class="h-3 w-14" />
                            <USkeleton class="h-5 w-24" />
                        </div>

                        <div class="space-y-2">
                            <USkeleton class="h-3 w-16" />
                            <USkeleton class="h-5 w-24" />
                        </div>

                        <div class="space-y-2">
                            <USkeleton class="h-3 w-12" />
                            <USkeleton class="h-5 w-20" />
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="fees.length" class="space-y-3">
                <div v-for="fee in fees" :key="fee.id"
                    class="rounded-xl border-2 border-gray-100  dark:border-gray-800 dark:bg-gray-950 bg-white p-4">
                    <div class="flex items-start justify-between">
                        <div>
                            <h4 class="font-semibold">
                                {{ fee.fee }}
                            </h4>

                            <p class="mt-1 text-sm text-muted">
                                Due Date: {{ formatDateString(fee.dueDate) }}
                            </p>
                        </div>

                        <UBadge :color="fee.status === 'Paid'
                            ? 'success'
                            : fee.status === 'Partial'
                                ? 'warning'
                                : 'error'" variant="soft">
                            {{ fee.status }}
                        </UBadge>
                    </div>

                    <div class="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div class="space-y-2 bg-gray-50 dark:bg-neutral-800 rounded-lg p-3">
                            <p class="text-[10px] uppercase text-muted">
                                Amount
                            </p>

                            <p class="font-semibold">
                                Le {{ fee.amount }}
                            </p>
                        </div>

                        <div class="space-y-2 bg-gray-50 dark:bg-neutral-800 rounded-lg p-3">
                            <p class="text-[10px] uppercase text-muted">
                                Paid
                            </p>

                            <p class="font-semibold text-success-600">
                                Le {{ fee.amountPaid }}
                            </p>
                        </div>

                        <div class="space-y-2 bg-gray-50 dark:bg-neutral-800 rounded-lg p-3">
                            <p class="text-[10px] uppercase text-muted">
                                Balance
                            </p>

                            <p class="font-semibold text-warning-600">
                                Le {{ fee.outstanding }}
                            </p>
                        </div>

                        <div class="space-y-2 bg-gray-50 dark:bg-neutral-800 rounded-lg p-3">
                            <p class="text-[10px] uppercase text-muted">
                                Term
                            </p>

                            <p class="font-semibold">
                                {{ fee.term }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else
                class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200  dark:border-gray-700 py-10">
                <UIcon name="i-lucide-wallet" class="mb-2 text-4xl text-muted" />

                <p class="font-medium">
                    No fee records found
                </p>

                <p class="text-sm text-muted">
                    Fee records will appear here.
                </p>
            </div>

            <template #footer>
                <div class="flex justify-between items-center">
                    <Showing :meta="meta" />
                    <UPagination size="sm" v-model:page="page" :page-size="meta?.size" :items-per-page="meta?.size"
                        :total="meta?.total" show-edges />
                </div>
            </template>
        </UCard>
    </StudentView>
</template>

<script setup lang="ts">
const route = useRoute()
const { can } = useAuth()
const store = useStudentStore()
const reportStore = useReportStore()
const { fees, meta } = storeToRefs(reportStore)
const loading = ref(true)
const { record } = storeToRefs(store)
const router = useRouter()

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
    get: () => Number(route.query.size ?? 6),
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

async function fetchFeeStructure() {
    loading.value = true
    if (!record.value?.id) return

    await reportStore.runReport(
        {
            entity: 'fees',
            filters: [
                {
                    field: 'enrollment.student.id',
                    value: record.value.id,
                    operator: 'EQUALS',
                    type: 'select'
                }
            ]
        },
        page.value,
        size.value
    )
    loading.value = false
}

watch(() => page.value, async () => {
    router.replace({
        query: {
            page: page.value
        }
    })

    await fetchFeeStructure()
}, { immediate: true })

watch(
    () => record.value,
    async value => {
        if (!value) return

        await fetchFeeStructure()
    },
    { immediate: true }
)

onMounted(() => {
    useAppStore().setTitle('View Student')
    useAppStore().setBack(true)

    document.title = 'Fee Structure | View Student | Students | Skultem'
})
</script>