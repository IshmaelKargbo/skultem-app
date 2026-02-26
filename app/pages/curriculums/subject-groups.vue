<template>
    <div class="p-5">
        <div class="bg-white border border-gray-200 rounded-md p-3">
            <div class="flex px-3 py-2 border-b justify-between pb-3 items-center border-gray-200">
                <p class="text-lg font-normal">Subject Groups Management</p>
                <div>
                    <CurriculumsSubjectGroupAdd/>
                </div>
            </div>
            <CurriculumsSubjectGroupTable />
        </div>
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Subject Groups');
   
    document.title = 'Subject Groups | Skultem'
})
</script>