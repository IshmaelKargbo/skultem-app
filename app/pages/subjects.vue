<template>
    <div class="p-7 h-full overflow-y-auto">
        <div class="bg-white border border-gray-200 rounded-md p-3">
            <div class="flex px-3 py-2 border-b justify-between pb-3 items-center border-gray-200">
                <p class="text-lg font-normal">Subjects Management</p>
                <div>
                    <SettingsSubjectAdd/>
                </div>
            </div>
            <SubjectTable />
        </div>
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Subjects');
   
    document.title = 'Subjects | Skultem'
})

definePageMeta({
    role: [Role.SCHOOL_ADMIN]
})
</script>