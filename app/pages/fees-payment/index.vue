<template>
    <div class="md:p-5 py-2 md:py-4 p-4 overflow-y-auto h-full space-y-5">
        <Heading title="Student Fees Management" subtitle="Manage student-specific fees and balances">
            <div v-if="can([Role.ACCOUNTANT, Role.OWNER])">
                <FeeStructureAdd />
            </div>
        </Heading>

        <div class="grid gap-5 lg:grid-cols-12">
            <div class="lg:col-span-4">
                <FeeStudentList @select="select" />
            </div>
            <div class="lg:col-span-8">
                <FeeStudentRecord :student="selectedStudent" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const selectedStudent = ref<Student>()
const { can } = useAuth()
function select(row: Student) {
    if (row == null) return;
    selectedStudent.value = row
}

onMounted(() => {
    useAppStore().setTitle('Student Fees')

    document.title = 'Student Fees | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
