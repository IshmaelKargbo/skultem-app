<template>
    <div class="p-7 h-full overflow-y-auto space-y-5">
        <div>
            <div class="flex py-2 justify-between items-center border-gray-200">
                <div class="space-y-1">
                    <p class="text-2xl font-semibold">Discounts & Scholarships</p>
                    <p class="text-mute">Manage student discounts and scholarships</p>
                </div>
                <div>
                    <FeeDiscountAdd :refresh-report="refreshReport" />
                </div>
            </div>
        </div>
        <FeeDiscountReport ref="reportRef" />
        <FeeDiscountTable />
    </div>
</template>

<script setup lang="ts">
const reportRef = ref()

function refreshReport() {
    reportRef.value?.fetchRecord()
}

onMounted(() => {
    useAppStore().setTitle('Discounts')
    document.title = 'Discounts | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.SCHOOL_ADMIN]
})
</script>