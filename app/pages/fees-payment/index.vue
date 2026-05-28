<template>
    <div class="md:p-5 py-2 md:py-4 p-4 overflow-y-auto h-full space-y-5">
        <Heading class="hidden md:flex" title="Student Fees Management" subtitle="Manage student-specific fees and balances">
            <div v-if="can([Role.ACCOUNTANT, Role.OWNER])">
                <FeeStructureAdd />
            </div>
        </Heading>

        <div class="md:hidden space-y-3">
            <div class="flex items-center justify-between">
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

            <div class="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1 dark:bg-gray-800">
                <button class="rounded-xl py-2 text-sm font-medium transition"
                    :class="mobileView === 'students'
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                        : 'text-gray-600 dark:text-gray-300'" @click="mobileView = 'students'">
                    Students
                </button>
                <button class="rounded-xl py-2 text-sm font-medium transition"
                    :class="mobileView === 'details'
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                        : 'text-gray-600 dark:text-gray-300'" @click="mobileView = 'details'">
                    Details
                </button>
            </div>
        </div>

        <div class="grid gap-5 lg:grid-cols-12 grid-cols-1">
            <div class="lg:col-span-4" :class="mobileView === 'details' ? 'hidden md:block' : ''">
                <FeeStudentList @select="select" />
            </div>
            <div class="lg:col-span-8" :class="mobileView === 'students' ? 'hidden md:block' : ''">
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

    document.title = 'Student Fees | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
