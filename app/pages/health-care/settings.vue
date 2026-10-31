<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Health Care Settings')
    document.title = 'Settings | Health Care | Skultem'
})

definePageMeta({
    // The nurse sees the rules read-only; principal-level users change them (docs/HEALTH_CARE.md P-3).
    role: [Role.NURSE, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-3">
        <HealthCareSectionNav />
        <HealthCareSettings />
    </div>
</template>
