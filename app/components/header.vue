<template>
    <div class="bg-white w-full border-b border-gray-200">
        <div class="container mx-auto p-1.5 px-5  flex items-center justify-between">
            <div>
                <p v-if="title" class="text-lg font-semibold">{{ title }}</p>
                <USkeleton v-else class="h-4 w-44" />
            </div>
            <div>
                <Me />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
const { title } = storeToRefs(useAppStore())
</script>