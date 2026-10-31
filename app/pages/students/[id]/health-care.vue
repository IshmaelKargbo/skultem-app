<template>
    <StudentView>
        <UCard>
            <template #header>
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 class="font-semibold md:text-lg">
                            Health Care
                        </h3>
                        <p class="text-xs-base text-muted">
                            Sick bay visits for this student. Medical details - shown to the nurse and school leadership only.
                        </p>
                    </div>
                    <div class="flex flex-col gap-2 sm:flex-row">
                    <HealthCareStartVisit v-if="canRecord" :student-id="studentId" />
                    <UDropdownMenu :items="exportItems">
                        <UButton :icon="DOWNLOAD_ICON" variant="outline" color="neutral" label="Export"
                            trailing-icon="i-lucide-chevron-down" :loading="exporting"
                            class="w-full justify-center sm:w-auto" />
                    </UDropdownMenu>
                    </div>
                </div>
            </template>

            <HealthCareStudentHistory :student-id="studentId" />
        </UCard>
    </StudentView>
</template>

<script setup lang="ts">
// Shown only when the school has the Health Care module (utils/modules.ts maps this path to it), and only to the roles
// the backend lets see health care records - the nurse and principal-level (docs/HEALTH_CARE.md §4).
definePageMeta({
    role: [Role.NURSE, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
})

const route = useRoute()
const studentId = computed(() => String(route.params.id))
const { canRecord } = useHealthCareAccess()
const { error: toastError } = useNotify()

const exporting = ref(false)
async function exportAs(format: 'csv' | 'pdf') {
    exporting.value = true
    try {
        await HealthCareApi().exportStudent(format, studentId.value)
    } catch (err: any) {
        toastError(err?.message || 'Failed to export')
    } finally {
        exporting.value = false
    }
}

const exportItems = [
    { label: 'CSV', icon: 'i-lucide-file-spreadsheet', onSelect: () => exportAs('csv') },
    { label: 'PDF', icon: 'i-lucide-file-text', onSelect: () => exportAs('pdf') }
]
</script>
