<template>

    <div class="flex space-x-5">
        <UCard class="flex-1">
            <div class="flex items-center justify-between p-2">
                <div class="space-y-2">
                    <p class="text-mute text-xs">Active Discounts</p>
                    <p class="text-2xl font-semibold" v-if="report">{{ report.activeDiscounts }}</p>
                    <USkeleton class="w-8 h-8" v-else />
                </div>
                <UAvatar icon="lucide:user-check" size="2xl" class="bg-app-50/50" />
            </div>
        </UCard>
        <UCard class="flex-1">
            <div class="flex items-center justify-between p-2">
                <div class="space-y-2">
                    <p class="text-mute text-xs">Total Savings</p>
                    <p class="text-2xl text-success font-semibold" v-if="report">{{ report.totalSavings }}</p>
                    <USkeleton class="w-8 h-8" v-else />
                </div>
                <UAvatar icon="mdi:discount-outline" size="2xl" class="bg-success-50 text-success" />
            </div>
        </UCard>
        <UCard class="flex-1">
            <div class="flex items-center justify-between p-2">
                <div class="space-y-2">
                    <p class="text-mute text-xs">Expired</p>
                    <p class="text-2xl text-error font-semibold" v-if="report">{{ report.expired }}</p>
                    <USkeleton class="w-8 h-8" v-else />
                </div>
                <UAvatar icon="mdi:book-cancel-outline" size="2xl" class="bg-error-50" />
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
type DiscountReport = {
    activeDiscounts: number
    totalSavings: string
    expired: number
}

const isLoading = ref(true)
const store = useFeeDiscountStore()
const report = ref<DiscountReport>()

async function fetchRecord() {
    isLoading.value = true
    const res = await store.caculateDiscountReport()
    report.value = res
    isLoading.value = false
}

defineExpose({
    fetchRecord
})

onMounted(() => fetchRecord())
</script>