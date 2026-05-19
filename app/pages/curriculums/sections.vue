<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-2 md:py-4 pb-0 space-y-3">
        <Heading title="Sections Management" subtitle="Manage all sections">
            <CurriculumsSectionAdd />
        </Heading>
        <CurriculumsSectionTable />
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
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>