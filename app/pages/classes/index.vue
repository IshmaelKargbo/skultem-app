<template>
    <ClassAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])" />
    <ClassAccountant v-if="can([Role.ACCOUNTANT])" />
    <ClassTeacher v-if="can([Role.TEACHER])" />
</template>

<script setup lang="ts">
const { can } = useAuth()
onMounted(() => {
    useAppStore().setTitle('Classes')
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER, Role.TEACHER]
})
</script>
