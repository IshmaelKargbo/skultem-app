<template>
    <div class="space-y-4 px-4 md:px-6">
        <div class="flex gap-4">
            <div class="w-96" :class="mobileView === 'details' ? 'hidden md:block' : ''">
                <FeeStudentList @select="select" />
            </div>

            <!-- Right Panel -->
            <div class="flex-1" :class="mobileView === 'students' ? 'hidden md:block' : ''">
                <div v-if="mobileView === 'details'" class="mb-3 flex items-center justify-between md:hidden">
                    <UButton icon="lucide:chevron-left" color="neutral" variant="ghost" size="sm"
                        @click="mobileView = 'students'">
                        Students
                    </UButton>

                    <p class="max-w-[65%] truncate text-xs text-gray-500 dark:text-gray-400">
                        {{ selectedStudent ? `${selectedStudent.givenNames} ${selectedStudent.familyName}` : NO_STUDENT
                        }}
                    </p>
                </div>

                <FeeStudentRecord :student="selectedStudent" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const selectedStudent = ref<Student>()
const mobileView = ref<'students' | 'details'>('students')
const NO_STUDENT = 'No student selected'
const { can } = useAuth()
function select(row: Student) {
    if (row == null) return;
    selectedStudent.value = row

    if (import.meta.client && window.innerWidth < 768) {
        mobileView.value = 'details'
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
