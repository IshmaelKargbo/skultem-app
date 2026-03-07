<template>
    <div class="bg-white w-full p-2.5 px-5 border-b border-gray-200 flex items-center justify-between">
        <div>
            <p v-if="title" class="text-lg">{{ title }}</p>
            <USkeleton v-else class="h-4 w-44" />
        </div>
        <div>
            <Me />
        </div>
    </div>
</template>
<script setup lang="ts">
const { title } = storeToRefs(useAppStore())
</script>