<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Issue / Return Book')
    document.title = 'Issue / Return | Library | Skultem'
})

definePageMeta({
    // Teachers can look things up; the manage actions are hidden for them (useLibraryAccess).
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.LIBRARIAN, Role.TEACHER]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-3">
        <LibrarySectionNav />
        <LibraryIssueTable />
    </div>
</template>
