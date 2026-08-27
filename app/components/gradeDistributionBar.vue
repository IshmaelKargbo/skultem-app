<template>
    <div class="space-y-2">

        <!-- BAR -->
        <div :class="`flex h-${height} rounded-full overflow-hidden bg-elevated`">

            <div v-if="passPercent" class="bg-success" :style="{ width: passPercent + '%' }" />

            <div v-if="averagePercent" class="bg-warning" :style="{ width: averagePercent + '%' }" />

            <div v-if="failPercent" class="bg-error" :style="{ width: failPercent + '%' }" />

        </div>

        <!-- LEGEND -->
        <div v-if="showLabel" class="flex justify-between text-xs">
            <span class="text-success">
                Pass ({{ pass }})
            </span>

            <span class="text-warning">
                Average ({{ average }})
            </span>

            <span class="text-error">
                Fail ({{ fail }})
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    pass: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    fail: { type: Number, default: 0 },
    showLabel: { type: Boolean, default: true },
    height: { type: Number, default: 2 }
})

const total = computed(() => props.pass + props.average + props.fail)

const passPercent = computed(() =>
    total.value ? (props.pass / total.value) * 100 : 0
)

const averagePercent = computed(() =>
    total.value ? (props.average / total.value) * 100 : 0
)

const failPercent = computed(() =>
    total.value ? (props.fail / total.value) * 100 : 0
)

</script>