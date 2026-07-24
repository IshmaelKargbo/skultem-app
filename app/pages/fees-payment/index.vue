<template>
    <div class="p-4 space-y-4">
        <Heading class="hidden md:flex" title="Student Fees Management"
            subtitle="Manage student-specific fees and balances">
            <div>
                <FeeStructureAdd v-if="can([Role.ACCOUNTANT, Role.OWNER])" />
            </div>
        </Heading>

        <div class="md:hidden space-y-3">
            <div class="grid grid-cols-2  gap-2 rounded-2xl bg-gray-50 border-2 border-gray-200 p-1 dark:bg-gray-800">
                <button class="rounded-xl py-2 text-sm font-medium transition" :class="mobileView === 'students'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300'" @click="mobileView = 'students'">
                    Students
                </button>
                <button class="rounded-xl py-2 text-sm font-medium transition" :class="mobileView === 'details'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300'" @click="mobileView = 'details'">
                    Details
                </button>
            </div>
        </div>

        <div class="grid gap-5 lg:grid-cols-12">
            <div class="lg:col-span-4 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)]"
                :class="mobileView === 'details' ? 'hidden md:block' : ''">
                <FeeStudentList @select="select" />
            </div>

            <!-- Right Panel -->
            <div class="lg:col-span-8" :class="mobileView === 'students' ? 'hidden md:block' : ''">
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
