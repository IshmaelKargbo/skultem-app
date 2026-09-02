<template>
    <TimetableRoleAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])" />
    <TimetableRoleTeacher v-if="can([Role.TEACHER])" />
    <TimetableRoleParent v-if="can([Role.PARENT])" />
</template>

<script setup lang="ts">
const { can } = useAuth()

onMounted(() => {
    useAppStore().setTitle('Timetable');
    document.title = 'Timetable | Skultem'
})

// No role here rendered nothing for ACCOUNTANT (none of the three role branches above match),
// so they'd land on a blank page instead of /unauthorized. Backend agrees ACCOUNTANT has no
// timetable access (see TimetableController), so gate it the same way every other page does.
definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT]
})
</script>