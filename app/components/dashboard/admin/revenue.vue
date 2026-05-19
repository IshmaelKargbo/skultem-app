<template>
    <div class="revenue-card">
        <div v-if="!isReady" class="skeleton-loader">
            Calculating Revenue...
        </div>

        <client-only v-else>
            <ApexChart
                :key="isDark"
                type="donut"
                height="380"
                :options="chartOptions"
                :series="chartSeries"
            />
        </client-only>
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed, ref, onMounted } from 'vue'

const store = useDashboardStore()
const { format } = useMoney()

const ApexChart = defineAsyncComponent(() =>
    import('vue3-apexcharts')
)

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const isReady = ref(false)

type RevenueItem = {
    label: string
    value: number
    percent: number
}

const revenueItems = ref<RevenueItem[]>([])

const chartSeries = computed(() =>
    revenueItems.value.map(i => i.value)
)

const chartLabels = computed(() =>
    revenueItems.value.map(i => clean(i.label))
)

const totalRevenue = computed(() =>
    revenueItems.value.reduce((sum, i) => sum + i.value, 0)
)

/* -------------------------
   Chart Config
-------------------------- */
const chartOptions = computed(() => ({
    theme: {
        mode: isDark.value ? 'dark' : 'light'
    },

    chart: {
        id: 'revenue-breakdown',
        type: 'donut',
        background: 'transparent',
        foreColor: isDark.value ? '#E5E7EB' : '#374151'
    },

    labels: chartLabels.value,

    title: {
        text: 'Revenue Breakdown',
        align: 'left',
        style: {
            fontWeight: 600,
            color: isDark.value ? '#F9FAFB' : '#111827'
        }
    },

    legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        labels: {
            colors: isDark.value ? '#E5E7EB' : '#374151'
        },
        markers: { radius: 12 },
        itemMargin: {
            horizontal: 10,
            vertical: 5
        }
    },

    tooltip: {
        theme: isDark.value ? 'dark' : 'light'
    },

    plotOptions: {
        pie: {
            donut: {
                size: '70%',
                labels: {
                    show: true,

                    name: {
                        show: true
                    },

                    value: {
                        show: true,
                        fontSize: '17px',
                        fontWeight: 600,
                        formatter: (val: string) =>
                            format(Number(val))
                    },

                    total: {
                        show: true,
                        label: 'Total Revenue',
                        formatter: () => format(totalRevenue.value)
                    }
                }
            }
        }
    }
}))

onMounted(async () => {
    const res = await store.fetchAdminRevnue()
    if (!res) return

    revenueItems.value = res
    isReady.value = true
})
</script>