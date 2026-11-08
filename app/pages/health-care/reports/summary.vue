<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Visits Summary')
    document.title = 'Summary | Health Care | Skultem'
})

definePageMeta({
    role: [Role.NURSE, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-3">
        <div data-guide="hc-tabs"><HealthCareSectionNav /></div>
        <GuideBar topic="nurse-report-summary" />
        <div data-guide="hc-main"><HealthCareReports kind="SUMMARY" /></div>
    </div>
</template>
