<template>
    <div class="p-4 sm:p-6 lg:p-7 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Assessment Template" subtitle="Configured grading structures">
            <AcademicsAssessmentTemplateAdd />
        </Heading>
        <AcademicsAssessmentTemplateTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Settings')
    document.title = 'Assessment Templates | Academics | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
