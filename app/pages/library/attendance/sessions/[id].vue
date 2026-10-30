<script lang="ts" setup>
const route = useRoute()

onMounted(() => {
    useAppStore().setTitle('Library Register')
    document.title = 'Register | Library | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.LIBRARIAN]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-3">
        <LibrarySectionNav />
        <UButton to="/library/attendance/sessions" icon="i-lucide-arrow-left" variant="ghost" color="neutral"
            label="Class Sessions" class="px-0" />
        <LibraryAttendanceRegister :session-id="String(route.params.id)" />
    </div>
</template>
