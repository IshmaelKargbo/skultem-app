<template>
    <StudentAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.OWNER])" />
    <StudentAccountant v-if="can([Role.ACCOUNTANT])" />
</template>

<script setup lang="ts">
const { can } = useAuth()
definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.OWNER]
})

onMounted(() => {
    useAppStore().setTitle('All Students');
    useAppStore().setBack(false)
    document.title = 'Students | Skultem'
})
</script>