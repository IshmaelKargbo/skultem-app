<script lang="ts" setup>
const { record } = defineProps<{
    record: any
}>()
</script>

<template>
    <UCard v-if="record" :key="record.id">
        <div class="space-y-4">
            <div class="flex items-start gap-3">
                <UBadge icon="lucide:bar-chart-3" class="p-2" size="xl" variant="subtle" color="info" />
                <div class="">
                    <p class="text-base line-clamp-1 font-semibold text-slate-900">{{ record.name }}</p>
                    <p class="text-xs text-mute">{{ record.description }}</p>
                </div>
            </div>
            <div class="rounded-xl bg-slate-50 h-28 flex items-center justify-center">
                <div class="flex items-end gap-2">
                    <span v-for="(bar, index) in record.preview" :key="index" class="w-2 rounded-full bg-blue-400"
                        :style="{ height: `${bar}px` }" />
                </div>
            </div>
            <div class="flex items-center justify-between text-xs text-mute">
                <span>Updated {{ record.updated }}</span>
                <UButton variant="outline" color="neutral" size="xs" label="Open"
                    :to="`/analytics/builder?id=${record.id}`" />
            </div>
        </div>
    </UCard>
</template>
