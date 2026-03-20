<template>
    <div class="grid grid-cols-3 gap-5">
        <Metric :record="{
            label: 'Positive Notes',
            value: kindRecord('Positive')?.count || 0,
            color: 'success',
            isReady: !isLoading,
            icon: 'mdi:trophy',
            subtle: 'Positive behaviour recorded in class.'
        }" />
        <Metric :record="{
            label: 'Negative Notes',
            value: kindRecord('Negative')?.count || 0,
            color: 'error',
            isReady: !isLoading,
            icon: 'mdi:close-circle',
            subtle: 'Negative behaviour recorded in class.'
        }" />
        <Metric :record="{
            label: 'Neutral Notes',
            value: kindRecord('Negative')?.count || 0,
            color: 'error',
            isReady: !isLoading,
            icon: 'codicon:screen-normal',
            subtle: 'Neutral behaviour recorded in class.'
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