<template>
    <div class="space-y-4 px-4 md:px-6">
        <FeeSectionNav />

        <div class="flex gap-4">
            <div class="w-full md:w-96">
                <FeeStudentList @select="select" />
            </div>

            <!-- Right Panel - desktop only. On mobile, tapping a student below opens the
                 full-screen modal instead of swapping the list out for this panel in place. -->
            <div class="hidden flex-1 md:block">
                <FeeStudentRecord :student="selectedStudent" />
            </div>
        </div>

        <!-- Mobile: tapping a student above opens this full-screen modal with their fee
             details, instead of the list being replaced by the details panel in place. -->
        <UModal v-model:open="mobileDetailsOpen" fullscreen :ui="{ content: 'md:hidden' }">
            <template #content>
                <UCard :ui="{ root: 'flex h-full flex-col rounded-none', body: 'flex-1 overflow-y-auto p-0 sm:p-0' }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <p class="max-w-[80%] truncate font-semibold text-highlighted">
                                {{ selectedStudent ? `${selectedStudent.givenNames} ${selectedStudent.familyName}` : NO_STUDENT }}
                            </p>
                            <UButton icon="lucide:x" variant="ghost" color="neutral" size="sm" aria-label="Close"
                                @click="mobileDetailsOpen = false" />
                        </div>
                    </template>

                    <FeeStudentRecord :student="selectedStudent" embedded />
                </UCard>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
const selectedStudent = ref<Student>()
const mobileDetailsOpen = ref(false)
const NO_STUDENT = 'No student selected'
const { can } = useAuth()
function select(row: Student) {
    if (row == null) return;
    selectedStudent.value = row

    if (import.meta.client && window.innerWidth < 768) {
        mobileDetailsOpen.value = true
    }
}

onMounted(() => {
    useAppStore().setTitle('Student Fees')

    document.title = 'Student Fees | Fees Payment | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
