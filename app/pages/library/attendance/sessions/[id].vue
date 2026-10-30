<script lang="ts" setup>
const route = useRoute()

onMounted(() => {
    useAppStore().setTitle('Library Register')
    useAppStore().setBack('/library/attendance/sessions')
    document.title = 'Register | Library | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.LIBRARIAN]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-3">
        <LibraryAttendanceRegister :session-id="String(route.params.id)" />
    </div>
</template>
