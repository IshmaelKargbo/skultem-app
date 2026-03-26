<template>
    <div class="p-7 h-full overflow-y-auto">
        <SettingsHeader title="Assessment Template" subtitle="Configured grading structures">
            <SettingsAssessmentTemplateAdd />
        </SettingsHeader>
        <SettingsAssessmentTemplateTable />
    </div>
</template>

<script setup lang="ts">
const page = ref(1);
const { meta } = storeToRefs(useTermStore());

onMounted(() => {
    useAppStore().setTitle('Settings')
    document.title = 'Assessment Templates | Settings | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>
