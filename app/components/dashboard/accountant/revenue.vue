<template>
    <UCard>
        <div>
            <div v-if="!isReady" class="skeleton-loader">
                Loading Monthly Revenue...
            </div>

            <client-only v-else>
                <ApexChart type="bar" height="350" :options="chartOptions" :series="chartSeries" />
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
const chartSeries = ref<any[]>([])
const colors = ref<string[]>([])

const chartOptions = computed(() => ({
    chart: {
        id: "revenue-by-month",
        type: "bar",
        toolbar: { show: false }
    },

    title: {
        text: "Revenue by Month",
        align: "left",
        style: { fontWeight: 600 }
    },

    xaxis: {
        categories: labels.value,
        labels: { style: { fontSize: "12px" } }
    },

    yaxis: {
        title: { text: "Revenue" },
        labels: {
            formatter: (val: number) => val
        }
    },

    grid: {
        borderColor: "#f1f5f9",
        strokeDashArray: 4
    },

    tooltip: {
        y: {
            formatter: (val: number) => format(val)
        }
    },
    plotOptions: {
        bar: {
            borderRadius: 6,
            columnWidth: "45%",
            distributed: true
        }
    },

    dataLabels: {
        enabled: true,
        formatter: (val: number) => format(val)
    },

    colors: colors.value
}))

onMounted(loadData)

async function loadData() {
    try {
        const payload = {
            entity: "payments",
            title: "Revenue by Month",
            filters: [],
            metrics: [
                {
                    name: "Revenue",
                    aggregation: "sum",
                    field: "amount",
                    tags: {
                        groupBy: "paidAt",
                        interval: "month"
                    }
                }
            ],
            chartType: "bar"
        }

        const res = await store.runAnalytic(payload)
        const widget = res?.data ?? res

        if (!widget?.labels || !widget?.datasets) return

        labels.value = widget.labels
        colors.value = generateColors(labels.value.length)
        chartSeries.value = widget.datasets.map((d: any) => ({
            name: d.label,
            data: d.data
        }))

        isReady.value = true
    } catch (err) {
        console.error("Failed to load revenue data", err)
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