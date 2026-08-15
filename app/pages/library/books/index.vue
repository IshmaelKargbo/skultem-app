<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Manage Books')
    document.title = 'Manage Books | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
    <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Manage Books" subtitle="Add, edit and track the library's book catalog">
            <LibraryBookAdd />
        </Heading>
        <LibraryBookTable />
    </div>
</template>
