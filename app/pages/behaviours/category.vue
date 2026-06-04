<template>
    <div class="p-4 sm:p-6 lg:p-7 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Behaviour Categories" subtitle="Student conduct classifications">
            <SettingsBehaviourCategoriesAdd />
        </Heading>
        <SettingsBehaviourCategoriesTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Settings');
    document.title = 'Behavoiur Categories | Settings | Skultem';
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
