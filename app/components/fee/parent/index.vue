<script lang="ts" setup>
const student = ref("")

function change(id:string) {
    student.value = id
}

onMounted(() => {
    useAppStore().setTitle('Fees')
    
    document.title = 'Fees | Skultem'
})

definePageMeta({
    role: [Role.PARENT]
})
</script>

<template>
    <div class="p-7 space-y-5 h-full overflow-y-auto">
        <FeeParentHistory @change="change" />
        <FeeParentPayment :student="student" />
    </div>
</template>
