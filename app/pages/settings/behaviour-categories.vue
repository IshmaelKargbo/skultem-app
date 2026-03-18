<template>
    <div class="p-5">
        <SettingsHeader />
        <div class="bg-white border border-gray-200 rounded-md p-3 mt-5">
            <div class="flex px-3 py-2 border-b justify-between pb-3 items-center border-gray-200">
                <p class="text-lg font-normal">Behaviour Categories</p>
                <div>
                    <SettingsBehaviourCategoriesAdd />
                </div>
            </div>
            <SettingsBehaviourCategoriesTable />
        </div>
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Behavoiur Categories');
    document.title = 'Behavoiur Categories | Settings | Skultem';
})

definePageMeta({
    role: [Role.SCHOOL_ADMIN]
})
</script>
