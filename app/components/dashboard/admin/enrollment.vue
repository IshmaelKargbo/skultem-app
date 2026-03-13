<template>
    <div class="chart-container">
        <div v-if="!isReady" class="skeleton-loader">
            Loading Enrollment Stats...
        </div>
        <client-only v-else>
            <ApexChart v-if="isReady" type="bar" height="350" :options="chartOptions" :series="chartSeries" />
        </client-only>
    </div>
</template>

<script setup lang="ts">
const store = useDashboardStore()
const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))

const enrollmentData = ref<{ count: number, month: string }[]>([])

const isReady = ref(false)

const chartSeries = computed(() => [
    {
        name: 'Students',
        data: enrollmentData.value.map(d => d.count)
    }
])

const chartOptions = computed(() => ({
    chart: {
        id: 'enrollment-trend',
        type: 'line',
        toolbar: { show: false },
    },
    title: {
        text: 'Student Enrollment Trend',
        align: 'left',
        style: { fontWeight: '600' }
    },
    plotOptions: {
        bar: {
            borderRadius: 6,
            columnWidth: '55%',
            distributed: true,
        }
    },
    xaxis: {
        categories: enrollmentData.value.map(d => d.month),
        axisBorder: { show: false },
    },
    yaxis: {
        min: 0,
        tickAmount: 4,
        title: { text: 'Students' }
    },
    colors: ['#4F46E5'],
    dataLabels: { enabled: false },
    grid: {
        borderColor: '#f1f1f1',
        strokeDashArray: 4,
    }
}))

onMounted(async () => {
    const res = await store.fetchStudentEnrollment()
    if (res == null) return
    enrollmentData.value = res
    isReady.value = true
})
</script>

<style scoped>
.skeleton-loader {
    height: 350px;
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