<template>
    <div class="space-y-5">
        <div v-if="run" class="space-y-5">
            <ReportTableStudent v-if="entity.toLowerCase() == 'students'" />
            <ReportTableTeacher v-if="entity.toLowerCase() == 'teachers'" />
            <ReportTableClazz v-if="entity.toLowerCase() == 'classes'" />
            <ReportTableSubject v-if="entity.toLowerCase() == 'subjects'" />
            <ReportTableAttendance v-if="entity.toLowerCase() == 'attendances'" />
            <ReportTableGrade v-if="entity.toLowerCase() == 'grades'" />
            <UCard>
                <div>
                    <p>Export Report</p>
                    <div class="mt-3 grid-cols-4 grid gap-3">
                        <UButton :icon="DOWNLOAD_ICON" label="Export CSV" size="xl" class="w-full flex justify-center"
                            color="neutral" variant="outline" />
                        <UButton :icon="DOWNLOAD_ICON" label="Export Excel" size="xl" class="w-full flex justify-center"
                            color="neutral" variant="outline" />
                        <UButton :icon="DOWNLOAD_ICON" label="Export PDF" size="xl" class="w-full flex justify-center"
                            color="neutral" variant="outline" />
                        <UButton :icon="DOWNLOAD_ICON" label="Export JSON" size="xl" class="w-full flex justify-center"
                            color="neutral" variant="outline" />
                    </div>
                </div>
            </UCard>
        </div>

    </div>
</template>

<script setup lang="ts">
const store = useReportStore()
const { entity, run } = storeToRefs(store)
</script>