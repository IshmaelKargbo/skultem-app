<template>
    <div class="space-y-4 p-4 sm:space-y-5 sm:p-6 lg:p-7">
        <Heading class="hidden md:flex" title="Student Fees Management" subtitle="Manage student-specific fees and balances">
            <div class="flex w-full justify-start md:w-auto md:justify-end">
                <FeeStructureAdd v-if="can([Role.ACCOUNTANT, Role.OWNER])" />
            </div>
        </Heading>

        <div class="space-y-3 md:hidden">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                        Student Fees
                    </h1>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Manage balances and payments
                    </p>
                </div>
                <FeeStructureAdd v-if="can([Role.ACCOUNTANT, Role.OWNER])" />
            </div>

            <div class="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1.5 dark:bg-gray-800">
                <button class="rounded-xl py-2 text-sm font-medium transition"
                    :class="mobileView === 'students'
                        ? 'bg-secondary text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                        : 'text-gray-600 dark:text-gray-300'" @click="mobileView = 'students'">
                    Students
                </button>
                <button class="rounded-xl py-2 text-sm font-medium transition"
                    :class="mobileView === 'details'
                        ? 'bg-secondary text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                        : 'text-gray-600 dark:text-gray-300'" @click="mobileView = 'details'">
                    Details
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <div class="min-h-0" :class="mobileView === 'details' ? 'hidden md:block' : ''">
                <FeeStudentList @select="select" />
            </div>
            <div class="min-h-0" :class="mobileView === 'students' ? 'hidden md:block' : ''">
                <div v-if="mobileView === 'details'" class="mb-3 flex items-center justify-between md:hidden">
                    <UButton icon="lucide:chevron-left" color="neutral" variant="ghost" size="sm"
                        @click="mobileView = 'students'">
                        Students
                    </UButton>
                    <p class="max-w-[65%] truncate text-xs text-gray-500 dark:text-gray-400">
                        {{ selectedStudent ? `${selectedStudent.givenNames} ${selectedStudent.familyName}` : 'No student selected' }}
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
