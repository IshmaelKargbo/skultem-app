<template>
    <div class="grid md:grid-cols-3 grid-cols-2 md:gap-5 gap-3">
        <Metric class="col-span-2 md:col-span-1" :record="{
            label: 'Positive Notes',
            value: kindRecord('Positive')?.count || 0,
            color: 'success',
            isReady: !isLoading,
            icon: 'mdi:trophy',
            subtle: 'Positive behaviour recorded.'
        }" />
        <Metric :record="{
            label: 'Negative Notes',
            value: kindRecord('Negative')?.count || 0,
            color: 'error',
            isReady: !isLoading,
            icon: 'mdi:close-circle',
            subtle: 'Negative behaviour recorded.'
        }" />
        <Metric :record="{
            label: 'Neutral Notes',
            value: kindRecord('Negative')?.count || 0,
            color: 'error',
            isReady: !isLoading,
            icon: 'codicon:screen-normal',
            subtle: 'Neutral behaviour recorded.'
        }" />
    </div>
</template>

<script setup lang="ts">
const { clazz } = defineProps<{
    clazz: string
}>()

const store = useBehaviourStore()
const report = ref<{ count: number, kind: string }[]>([])
const isLoading = ref(true)

const kindRecord = (kind: string) => report.value.find(e => (e.kind.toLowerCase() == kind.toLowerCase()))

async function fetchRecord() {
    isLoading.value = true
    const res = await store.fetchAllReport(clazz)
    report.value = res
    isLoading.value = false
}

watch(() => clazz, () => fetchRecord(), { immediate: true })

defineExpose({
    fetchRecord
})

onMounted(() => fetchRecord())
</script>