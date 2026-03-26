<template>
    <StudentAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR])" />
    <StudentAccountant v-if="can([Role.ACCOUNTANT])" />
</template>

<script setup lang="ts">
const { can } = useAuth()
definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR]
})

onMounted(() => {
    useAppStore().setTitle('Students');
    document.title = 'Students | Skultem'
})
</script>
