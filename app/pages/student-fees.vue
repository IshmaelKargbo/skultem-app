<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
        <Heading title="Student Fees Management" subtitle="Manage student-specific fees and balances">
            <div v-if="can([Role.ACCOUNTANT])">
                <FeeStructureAdd />
            </div>
        </Heading>
        <div class="space-x-5 flex">
            <div class="w-1/3">
                <FeeStudentList @select="select" />
            </div>
            <div class="w-2/3">
                <FeeStudentRecord :student="selectedStudent" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const selectedStudent = ref<Student | null>()
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
    role: [Role.ACCOUNTANT, Role.ADMIN, Role.PROPRIETOR]
})
</script>