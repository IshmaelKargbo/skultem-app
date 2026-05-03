<script lang="ts" setup>
const { } = defineProps<{
    size: number
}>()
</script>

<template>
    <div class="p-3 border-gray-200 flex space-x-28" v-for="item, i in 10" :key="item" :class="{
        'border-b': i + 1 < 10
    }">
        <USkeleton class="w-full h-5" v-for="value in size" />
    </div>
</template>
