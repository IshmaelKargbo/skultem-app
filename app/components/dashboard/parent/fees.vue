<template>
    <Metric :record="{
        label: 'Fee\'s Balance',
        color: 'error',
        value: `${balance}`,
        isReady: isReady,
        icon: STUDENT_FEES_ICON,
        subtle: 'Outstanding Balance'
    }" />
</template>

<script setup lang="ts">
const { id } = defineProps<{
    id: string
}>()

const emit = defineEmits<{ ready: [value: number] }>()

const { format } = useMoney()
const isReady = ref(false)
const balance = ref("0.0")

async function fetchRecord() {
    if (!id) return

    isReady.value = false
    let outstanding = 0
    try {
        // Every fee on the child's account that still has something owing, after discounts and payments - the same
        // list the Pay page uses. (The old sum read only the first 10 fee records and ignored discounts.)
        const res = await StudentApi().getAllStudentOutstandingFeesById(id) as { data?: any[] } | undefined
        outstanding = (res?.data ?? []).reduce((sum, r) => sum + (Number(r.outstanding) || 0), 0)
    } catch (err) {
        console.error("Failed to load fee balance", err)
    } finally {
        balance.value = format(outstanding)
        isReady.value = true
        emit('ready', outstanding)
    }
}

watch(() => id, async () => {
    await fetchRecord()
}, { immediate: true })
</script>