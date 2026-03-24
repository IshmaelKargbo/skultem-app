<template>
    <div class="p-7 space-y-5 h-full overflow-y-auto">
        <div>
            <div class="flex justify-between items-center border-gray-200">
                <div class="space-y-1">
                    <p class="text-2xl font-semibold">Student Fees Management</p>
                    <p class="text-mute">Manage student-specific fees and balances</p>
                </div>
                <div>
                    <FeeStructureAdd />
                </div>
            </div>
        </div>
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

function select(row: Student) {
    if (row == null) return;
    selectedStudent.value = row
}

onMounted(() => {
    useAppStore().setTitle('Student Fees')
    
    document.title = 'Student Fees | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT]
})
</script>