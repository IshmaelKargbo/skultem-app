<script lang="ts" setup>
const route = useRoute()

onMounted(() => {
    useAppStore().setTitle('Health Care Visit')
    useAppStore().setBack('/health-care/visits')
    document.title = 'Visit | Health Care | Skultem'
})

definePageMeta({
    role: [Role.NURSE, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-3">
        <HealthCareVisit :id="String(route.params.id)" />
    </div>
</template>