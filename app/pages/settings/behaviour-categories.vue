<template>
    <div class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
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
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>
