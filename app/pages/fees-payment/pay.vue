<template>
    <div class="px-4 md:px-6 space-y-4">
        <FeeSectionNav />

        <FeePaymentNew :initial-student-id="initialStudentId" @complete="refresh" />
        <DashboardAccountantTable ref="paymentRef" />
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const paymentRef = ref()

const initialStudentId = computed(() => (route.query.studentId as string) || '')

async function refresh() {
    await paymentRef.value?.fetchRecord()
}

onMounted(() => {
    useAppStore().setTitle('Payments')
    document.title = 'Payments | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.OWNER]
})
</script>
