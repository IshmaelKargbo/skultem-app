<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Start a Sick Bay Visit')
    document.title = 'Start Visit | Health Care | Skultem'
})

definePageMeta({
    role: [Role.NURSE, Role.SUPER_ADMIN]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-3">
        <HealthCareVisitForm />
    </div>
</template>
