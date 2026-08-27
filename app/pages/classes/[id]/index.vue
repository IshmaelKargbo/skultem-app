<template>
    <ClassView />
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('View Class')
    useAppStore().setBack(true)

    document.title = 'View Class | Classes | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
