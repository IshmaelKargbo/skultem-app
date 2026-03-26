<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
        <Heading title="Sections Management" subtitle="Manage all sections">
            <CurriculumsSectionAdd />
        </Heading>
        <UCard>
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
    useAppStore().setTitle('Curriculums')
    document.title = 'Sections | Curriculums | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>