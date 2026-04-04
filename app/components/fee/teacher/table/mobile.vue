<script lang="ts" setup>
const { records, loading, seed } = defineProps<{
    records: Fee[]
    seed?: number
    loading?: boolean
}>()
const { format } = useMoney()
const seedCount = ref(seed || 0)
</script>
<template>
    <UCard :ui="{
        body: 'p-0 sm:p-0'
    }" class="md:hidden" v-if="!loading" v-for="(item, i) in records">
        <div :key="item.id" class="flex justify-between p-3">
            <div class="flex space-x-2">
                <UAvatar :alt="item.student" />
                <div>
                    <p class="text-sm">{{ item.student }}</p>
                    <div class="flex space-x-1 text-[11px] text-mute">
                        <p>{{ item.fee }}</p>
                        <p>-</p>
                        <p>{{ item.term }}</p>
                    </div>
                </div>
            </div>
            <div class="flex flex-col items-end space-y-0.5">
                <p class="text-info text-xs font-medium">{{ format(item.amount) }}</p>
                <div class="flex space-x-2">
                    <p class="text-error text-sm font-medium" v-if="item.outstanding">{{ format(item.outstanding) }}</p>
                    <UBadge size="xs" :label="item.status" variant="outline"
                        :color="parseFeeStatusColor[item.status]" />
                </div>
            </div>
        </div>
        <div v-if="records.length == 0" class="flex h-16 items-center justify-center">
            <p class="text-xs text-mute">No Fee Record</p>
        </div>
        <div v-if="loading" v-for="(value, i) in seedCount" class="flex items-center justify-between px-3 py-2" :class="{
            'border-b border-gray-100': (i + 1) < seedCount
        }">
            <div class="flex space-x-2 items-center">
                <div>
                    <USkeleton class="w-10 h-10 rounded-full" />
                </div>
                <div class="space-y-2">
                    <USkeleton class="w-24 h-3" />
                    <div class="flex space-x-2">
                        <USkeleton class="w-10 h-2" />
                        <USkeleton class="w-10 h-2" />
                    </div>
                </div>
            </div>
            <div class="flex flex-col items-end justify-center space-y-2">
                <USkeleton class="w-24 h-3" />
                <USkeleton class="w-10 h-2" />
            </div>
        </div>
    </UCard>
</template>
