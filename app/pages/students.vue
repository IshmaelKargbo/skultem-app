<template>
    <div class="p-5">
        <div class="bg-white border border-gray-200 rounded-md p-3">
            <div class="flex px-3 py-2 border-b justify-between pb-3 items-center border-gray-200">
                <p class="text-lg font-normal">Students Management</p>
                <div class="space-x-2">
                    <StudentAssignClass />
                    <StudentAdd />
                </div>
            </div>
            <StudentTable />
            <div class="flex justify-between border-t border-gray-200 pt-3 items-center">
                <Showing :meta="meta" />
                <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                    :total="meta.total" show-edges />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const page = ref(1);
const { meta } = storeToRefs(useStudentStore());

onMounted(() => {
    useAppStore().setTitle('Students');
    document.title = 'Students | Skultem'
})
</script>