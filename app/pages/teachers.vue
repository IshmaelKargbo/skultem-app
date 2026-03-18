<template>
    <div class="p-5">
        <div class="bg-white border border-gray-200 rounded-md p-3">
            <div class="flex px-3 py-2 border-b justify-between pb-3 items-center border-gray-200">
                <p class="text-xl font-semibold">Teachers Management</p>
                <div>
                    <TeacherAdd />
                </div>
            </div>
            <TeacherTable />
        </div>
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Teachers');
  
    document.title = 'Teachers | Skultem'
})

definePageMeta({
    role: [Role.SCHOOL_ADMIN]
})
</script>