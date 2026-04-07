<template>
    <div class="p-7 h-full overflow-y-auto">
        <SettingsHeader title="Behaviour Categories" subtitle="Student conduct classifications">
            <div>
                <SettingsBehaviourCategoriesAdd />
            </div>
        </SettingsHeader>
        <SettingsBehaviourCategoriesTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Behavoiur Categories');
    document.title = 'Behavoiur Categories | Settings | Skultem';
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>
