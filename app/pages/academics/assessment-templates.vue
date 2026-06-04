<template>
    <div class="md:p-7 overflow-y-auto p-4 h-full md:space-y-5 space-y-3">
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
