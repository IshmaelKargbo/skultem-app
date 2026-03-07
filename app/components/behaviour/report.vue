<template>
    <div class="grid grid-cols-3 gap-5">
        <UCard>
            <div class="space-y-1">
                <USkeleton v-if="isLoading" class="w-10 h-10" />
                <p v-else class="text-3xl font-semibold text-success">{{ kindRecord("Positive")?.count || 0 }}</p>
                <p class="text-mute">Positive Notes</p>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-1">
                <USkeleton v-if="isLoading" class="w-10 h-10" />
                <p v-else class="text-3xl font-semibold text-error">{{ kindRecord("Negative")?.count || 0 }}</p>
                <p class="text-mute">Negative Notes</p>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-1">
                <USkeleton v-if="isLoading" class="w-10 h-10" />
                <p v-else class="text-3xl font-semibold text-neutral">{{ kindRecord("Neutral")?.count || 0 }}</p>
                <p class="text-mute">Neutral Notes</p>
            </div>
        </UCard>
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