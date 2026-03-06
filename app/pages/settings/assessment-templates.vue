<template>
    <div class="p-5">
        <SettingsHeader />
        <div class="bg-white border border-gray-200 rounded-md p-3 mt-5">
            <div class="flex px-3 py-2 border-b justify-between pb-3 items-center border-gray-200">
                <p class="text-lg font-normal">Assessment Templates</p>
                <div>
                    <SettingsAssessmentTemplateAdd />
                </div>
            </div>
            <SettingsAssessmentTemplateTable />
        </div>
    </div>
</template>

<script setup lang="ts">
const page = ref(1);
const { meta } = storeToRefs(useTermStore());

onMounted(() => {
    useAppStore().setTitle('Assessment Templates')
    document.title = 'Assessment Templates | Settings | Skultem'
})
</script>
