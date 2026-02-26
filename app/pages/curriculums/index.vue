<template>
    <div class="p-5">
        <div class="bg-white border border-gray-200 rounded-md p-3">
            <div class="flex px-3 py-2 border-b justify-between pb-3 items-center border-gray-200">
                <p class="text-lg font-normal">Subjects</p>
                <div>
                    <CurriculumsSubjectAdd />
                </div>
            </div>
            <CurriculumsSubjectTable />
        </div>
    </div>
</template>

<script setup lang="ts">
const page = ref(1);
const { meta } = storeToRefs(useTermStore());

onMounted(() => {
    useAppStore().setTitle('Subjects')
    document.title = 'Subjects | Curriculums | Skultem'
})
</script>