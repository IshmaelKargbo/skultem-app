<template>
    <TimetableRoleAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN])" />
    <TimetableRoleTeacher v-if="can([Role.TEACHER])" />
    <TimetableRoleParent v-if="can([Role.PARENT])" />
</template>

<script setup lang="ts">
const { can } = useAuth()

onMounted(() => {
    useAppStore().setTitle('Timetable');
    document.title = 'Timetable | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>