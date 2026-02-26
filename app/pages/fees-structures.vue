<template>
    <div class="p-5 space-y-5">
        <div>
            <div class="flex py-2 justify-between items-center border-gray-200">
                <div class="space-y-1">
                    <p class="text-xl font-normal">Fee Structure Management</p>
                    <p class="font-light text-muted">Create and manage fee structures</p>
                </div>
                <div>
                    <FeeStructureAdd />
                </div>
            </div>
        </div>
        <UCard>
            <div class="flex space-x-3">
                <div class="flex-1">
                    <UFormField label="Search">
                        <UInput placeholder="Search by class or category" leading-icon="iconamoon:search-light" />
                    </UFormField>
                </div>
                <div class="w-1/3 flex space-x-3">
                    <UFormField label="Academic Year" class="w-full">
                        <USelect placeholder="Select Academic Year" />
                    </UFormField>
                    <UFormField label="Class" class="w-full">
                        <USelect placeholder="Select Class" />
                    </UFormField>
                </div>
            </div>
        </UCard>
        <UCard>
            <div class="flex py-2 border-b justify-between pb-3 items-center border-gray-200">
                <p class="text-lg font-normal">Fee Structures ({{ meta.total }})</p>
            </div>
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
    definePageMeta({
        title: 'Fees Structures'
    })
})
</script>