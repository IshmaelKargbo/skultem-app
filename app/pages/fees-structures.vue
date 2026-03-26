<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
        <Heading title="Fee Structure Management" subtitle="Create and manage fee structures">
            <div class="space-x-3 w-1/3 flex">
                <USelectMenu class="w-full" placeholder="Select Term" :leading-icon="SEARCH_ICON" />
                <FeeStructureAdd />
            </div>
        </Heading>
        <UCard>
            <FeeStructureTable />
            <div class="flex justify-between border-t border-gray-200 pt-3 items-center">
                <Showing :meta="meta" />
                <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                    :total="meta.total" show-edges />
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const page = ref(1);
const { meta } = storeToRefs(useFeeStructureStore());

onMounted(() => {
    useAppStore().setTitle('Fees Structures');
    document.title = 'Fees Structures | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.ADMIN]
})
</script>
