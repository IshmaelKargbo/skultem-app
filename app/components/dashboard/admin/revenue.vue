<template>
    <div class="revenue-card">
        <div v-if="!isReady" class="skeleton-loader">Calculating Revenue...</div>
        <client-only v-else>
            <ApexChart type="donut" height="380" :options="chartOptions" :series="chartSeries" />
        </client-only>
    </div>
</template>

<script setup lang="ts">
const store = useDashboardStore()
const { format } = useMoney()
const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))

const isReady = ref(false)

const revenueItems = ref<{
    label: string
    value: number
    percent: number
}[]>([])

const chartSeries = computed(() => revenueItems.value.map(item => item.value))
const chartOptions = computed(() => ({
    chart: {
        id: 'revenue-breakdown',
        type: 'donut',
    },
    labels: revenueItems.value.map(item => clean(item.label)),
    title: { text: 'Revenue Brake Down', align: 'left', style: { fontWeight: '600' } },

    legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        fontWeight: 400,
        title: {
            text: 'Revenue Sources',
            style: {
                fontWeight: 600,
                color: '#374151'
            }
        },
        markers: { radius: 12 },
        itemMargin: {
            horizontal: 10,
            vertical: 5
        }
    },
    plotOptions: {
        pie: {
            donut: {
                size: '70%',
                labels: {
                    show: true,
                    name: {
                        show: true,
                        formatter: (val: string) => val
                    },
                    value: {
                        show: true,
                        fontSize: '17px',
                        fontWeight: '600',
                        formatter: (val: string) => format(Number(val))
                    },
                    total: {
                        show: true,
                        fontSize: '14px',
                        label: 'Total Revenue',
                        formatter: (w: any) => {
                            const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                            return format(total)
                        }
                    }
                }
            }
        }
    },
}))

onMounted(async () => {
    const res = await store.fetchAdminRevnue()
    if (res == null) return
    revenueItems.value = res
    isReady.value = true
})
</script>

<style scoped>
.skeleton-loader {
    height: 380px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    font-weight: 500;
    background: #f3f4f6;
    border-radius: 0.5rem;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.4;
    }
}
</style>