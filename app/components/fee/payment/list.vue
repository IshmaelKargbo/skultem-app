<template>
    <UCard :ui="{
        body: 'sm:p-0'
    }">
        <UTable :columns="columns" :data="records" :loading="isLoading" class="w-full">
            <template #empty-state>
                <div class="flex flex-col items-center gap-2 py-10">
                    <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
                    <p class="text-gray-500">No students found.</p>
                </div>
            </template>
            <template #loading>
                <TableLoading :size="columns.length" />
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
</template>

<script setup lang="ts">
const store = useFeePaymentStore()
const router = useRouter()
const { meta, records, loading: isLoading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const search = ref('')

const columns = [
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }: any) => `${row.original.givenNames} ${row.original.familyName}`
    },
    {
        accessorKey: 'className',
        header: 'Class'
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
