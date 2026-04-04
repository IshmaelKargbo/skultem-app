<template>
    <ClientOnly>
        <div class="bg-white w-full border-b border-gray-200">
            <div class="container mx-auto md:p-1.5 py-2 md:px-5 px-4  flex items-center justify-between">
                <div class="flex space-x-1.5 items-center">
                    <MenuDrawer class="md:hidden block" />
                    <div>
                        <p v-if="title" class="text-lg font-display font-semibold">{{ title }}</p>
                        <USkeleton v-else class="h-4 w-44" />
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="flex space-x-2">
                        <UButton to="/notifications" variant="ghost" :icon="BELL_ICON" />
                    </div>
                    <Me class="hidden md:block" />
                </div>
            </div>
        </div>
    </ClientOnly>
</template>
<script setup lang="ts">
const { title } = storeToRefs(useAppStore())
</script>