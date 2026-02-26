<template>
    <UCard>
        <div class="space-y-5">
            <!-- Header + Search -->
            <div class="space-y-3">
                <p class="text-base font-medium">Recent Payments</p>
                <UInput v-model="search" placeholder="Search payments" />
            </div>

            <!-- Payments List -->
            <div class="space-y-4">
                <!-- Loading -->
                <div v-if="isLoading">
                    <UCard v-for="n in 3" :key="n" class="mb-3">
                        <div class="space-y-3">
                            <!-- Top Row: Student + Status -->
                            <div class="flex justify-between items-center">
                                <div class="space-y-1">
                                    <USkeleton class="w-56 h-3" />
                                    <USkeleton class="w-24 h-3" />
                                </div>
                                <USkeleton class="w-20 h-5" />
                            </div>

                            <!-- Middle Row: Category & Amount -->
                            <div class="grid grid-cols-2 gap-2">
                                <div class="space-y-1">
                                    <USkeleton class="w-16 h-3" />
                                    <USkeleton class="w-20 h-4" />
                                </div>
                                <div class="space-y-1">
                                    <USkeleton class="w-16 h-3" />
                                    <USkeleton class="w-20 h-4" />
                                </div>
                            </div>

                            <!-- Bottom Row: Method & Date -->
                            <div class="grid grid-cols-2 gap-2">
                                <div class="space-y-1">
                                    <USkeleton class="w-16 h-3" />
                                    <USkeleton class="w-20 h-4" />
                                </div>
                                <div class="space-y-1">
                                    <USkeleton class="w-16 h-3" />
                                    <USkeleton class="w-20 h-4" />
                                </div>
                            </div>
                        </div>
                    </UCard>
                </div>
                <!-- Empty -->
                <p v-else-if="records.length === 0"
                    class="text-mute border border-dashed border-gray-100 flex h-56 w-full justify-center items-center">
                    No payments found</p>

                <!-- Payment Cards -->
                <UCard v-else v-for="item in records" :key="item.id"
                    class="hover:bg-app-50/50 hover:ring-app-200/50 cursor-pointer">
                    <div class="space-y-3">
                        <!-- Top Row: Student + Status -->
                        <div class="flex justify-between">
                            <div>
                                <p class="text-base font-medium">{{ item.student.givenNames }} {{
                                    item.student.familyName }}</p>
                                <StudentEnrollment :id="item.student.id">
                                    <template #default="{ value }">
                                        <p class="text-xs text-mute">
                                            {{ parseClass(value) }}
                                        </p>
                                    </template>
                                </StudentEnrollment>
                            </div>
                            <div>
                                <UBadge label="Completed" />
                            </div>
                        </div>

                        <!-- Middle Row: Category & Amount -->
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <p class="text-xs text-mute">Category</p>
                                <p>{{ item.fee.category.name }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-mute">Amount</p>
                                <p class="text-success font-semibold">{{ format(item.amount) }}</p>
                            </div>
                        </div>

                        <!-- Bottom Row: Method & Date -->
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <p class="text-xs text-mute">Method</p>
                                <p>{{ parsePaymentMethod[item.paymentMethod] }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-mute">Date</p>
                                <p>{{ formatDate(item.paidAt) }}</p>
                            </div>
                        </div>
                    </div>
                </UCard>
                <UPagination v-if="meta && !isLoading" size="sm" v-model:page="page" :page-size="meta.size"
                    :items-per-page="meta.size" :total="meta.total" show-edges />
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
const store = useFeePaymentStore()
const { format } = useMoney()
const router = useRouter()
const { meta, records, loading: isLoading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const search = ref('')

const page = ref(1)
const size = ref(3)

watch(() => page.value, () => {
    nextTick(() => {
        scrollContainer?.value?.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    })
    router.replace({
        query: {
            page: page.value,
            size: size.value
        }
    })

    fetchPayments()
}, { immediate: true })

async function fetchPayments() {
    await store.fetchAll(page.value, size.value)
}

onMounted(fetchPayments)
</script>