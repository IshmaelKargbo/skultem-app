<template>
    <div class="px-4 md:px-6 space-y-3">
        <FeeSectionNav />
        <GuideBar topic="finance-payment" />
        <FeePaymentNew :initial-student-id="initialStudentId" @complete="refresh" />
        <div data-guide="pay-recent"><DashboardAccountantTable ref="paymentRef" /></div>
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
    // Only the accountant records fee payments - not the owner or super admin.
    role: Role.ACCOUNTANT
})
</script>
