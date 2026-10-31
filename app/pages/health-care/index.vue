<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Health Care')
    document.title = 'Health Care | Skultem'
})

definePageMeta({
    // Medical details: the nurse and principal-level only (docs/HEALTH_CARE.md §4).
    role: [Role.NURSE, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-3">
        <HealthCareSectionNav />
        <HealthCareDashboard />
    </div>
</template>
