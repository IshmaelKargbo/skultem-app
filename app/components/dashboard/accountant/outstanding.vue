<template>
    <UCard>
        <div>
            <div v-if="!isReady" class="skeleton-loader">
                Loading Outstanding Fees by Class...
            </div>

            <client-only v-else>
                <ApexChart type="pie" height="350" :options="chartOptions" :series="chartSeries" />
            </client-only>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from "vue"
const { format } = useMoney()
const store = useWidgetStore()
const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))

const isReady = ref(false)
const labels = ref<string[]>([])
const colors = ref<string[]>([])
const chartSeries = ref<number[]>([])

// Chart configuration
const chartOptions = computed(() => ({
    chart: {
        id: "outstanding-fees-class",
        type: "pie",
        toolbar: { show: false }
    },

    title: {
        text: "Outstanding Fees by Class",
        align: "left",
        style: { fontWeight: 600 }
    },

    labels: labels.value,

    colors: colors.value,

    legend: { position: "bottom" },

    dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(1)}%`
    },

    tooltip: {
        y: {
            formatter: (val: number) => format(val)
        }
    }
}))

// What each class still owes this year - the same report as Fees > Reports > Outstanding (no platform fee, net of
// discounts, added up fee by fee).
onMounted(loadData)

async function loadData() {
    try {
        const res = await FeeReportApi().getOutstanding()
        const rows = (res?.byClass ?? []).filter((r: any) => Number(r.outstanding) > 0)
        labels.value = rows.map((r: any) => r.className)
        colors.value = generateColors(labels.value.length)
        chartSeries.value = rows.map((r: any) => Number(r.outstanding))
    } catch (err) {
        console.error("Failed to load outstanding fees", err)
    } finally {
        isReady.value = true
    }
}
</script>

<style scoped>
.skeleton-loader {
    height: 350px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6366f1;
    font-weight: 500;
    background: #f3f4f6;
    border-radius: 0.5rem;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1
    }

    50% {
        opacity: 0.4
    }
}
</style>