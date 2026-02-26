<template>
    <div class="p-5">
        <UCard>
            <div class="flex px-3 py-2 border-b justify-between pb-3 items-center border-gray-200">
                <p class="text-lg font-normal">Sections Management</p>
                <div>
                    <CurriculumsSectionAdd />
                </div>
            </div>
            <CurriculumsSectionTable />
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
const { meta } = storeToRefs(useFeeStore())

onMounted(() => {
    useAppStore().setTitle('Sections')
    document.title = 'Sections | Curriculums | Skultem'
})
</script>