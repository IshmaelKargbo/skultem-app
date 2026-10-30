<template>
    <StudentView>
        <UCard>
            <template #header>
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 class="font-semibold md:text-lg">
                            Library
                        </h3>
                        <p class="text-xs-base text-muted">
                            Visits to the library and class library sessions for this student, kept apart.
                        </p>
                    </div>
                    <UDropdownMenu v-if="canSuperviseAttendance" :items="exportItems">
                        <UButton :icon="DOWNLOAD_ICON" variant="outline" color="neutral" label="Export"
                            trailing-icon="i-lucide-chevron-down" :loading="exporting"
                            class="w-full justify-center sm:w-auto" />
                    </UDropdownMenu>
                </div>
            </template>

            <LibraryAttendanceStudentHistory :student-id="studentId" />
        </UCard>
    </StudentView>
</template>

<script setup lang="ts">
// Shown only when the school has the Library module (utils/modules.ts maps this path to it), and only to
// the roles the backend lets see library attendance - the same roles as useLibraryAccess().canViewAttendance.
definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.LIBRARIAN]
})

const route = useRoute()
const studentId = computed(() => String(route.params.id))
const { canSuperviseAttendance } = useLibraryAccess()
const { error: toastError } = useNotify()

const exporting = ref(false)
async function exportAs(format: 'csv' | 'pdf') {
    exporting.value = true
    try {
        await LibraryAttendanceApi().exportStudent(format, studentId.value)
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
