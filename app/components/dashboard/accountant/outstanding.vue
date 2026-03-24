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

    colors: ["#048339", "#10b981", "#22c55e", "#4ade80", "#86efac"],

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

// Load data and compute outstanding per class
onMounted(loadData)

async function loadData() {
    try {
        // Fetch total, paid, and partial fees grouped by class
        const payload = {
            entity: "fees",
            title: "Outstanding Fees by Class",
            filters: [],
            metrics: [
                { name: "Total", aggregation: "sum", field: "amount", tags: { groupBy: "clazz" } },
                { name: "Paid", aggregation: "sum", field: "amountPaid", tags: { groupBy: "clazz", field: "status", value: "Paid" } },
                { name: "Partial", aggregation: "sum", field: "amountPaid", tags: { groupBy: "clazz", field: "status", value: "Partial" } }
            ],
            chartType: "pie"
        }

        const res = await store.runAnalytic(payload)
        const widget = res?.data ?? res

        if (!widget?.labels || !widget?.datasets) return

        labels.value = widget.labels

        const total = widget.datasets.find((d: any) => d.label === "Total")?.data || []
        const paid = widget.datasets.find((d: any) => d.label === "Paid")?.data || []
        const partial = widget.datasets.find((d: any) => d.label === "Partial")?.data || []

        // Outstanding = Total - (Paid + Partial)
        const outstanding = total.map((t: number, i: number) => Math.max(0, t - ((paid[i] || 0) + (partial[i] || 0))))

        chartSeries.value = outstanding
        isReady.value = true
    } catch (err) {
        console.error("Failed to load outstanding fees", err)
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