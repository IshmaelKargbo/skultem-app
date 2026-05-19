<template>
    <StudentAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])" />
    <StudentAccountant v-if="can([Role.ACCOUNTANT])" />
</template>

<script setup lang="ts">
const { can } = useAuth()
definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})

onMounted(() => {
    useAppStore().setTitle('All Students');
    document.title = 'Students | Skultem'
})
</script>
``