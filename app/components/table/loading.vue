<script lang="ts" setup>
defineProps<{
    size: number
}>()
</script>

<template>
    <div class="p-3 border-gray-200 dark:border-gray-800 w-full flex space-x-28" v-for="item, i in runtimeConf().limit" :key="item" :class="{
        'border-b': i + 1 < 10
    }">
        <USkeleton class="w-full h-5" v-for="value in size" />
    </div>
</template>
