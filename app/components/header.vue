<template>
    <div class="px-4 pt-4">
        <UCard :ui="{
            body: 'p-3 sm:p-3'
        }">
            <div class="flex items-center space-x-2">
                <MenuDrawer class="lg:hidden block" />
                <p v-if="title" class="text-lg font-display font-semibold transition-colors pb-1"
                    :class="isDark ? 'text-gray-100' : 'text-gray-900'">
                    {{ title }}
                </p>

                <USkeleton v-else class="h-4 w-44 max-w-full" />
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const store = useAppStore()
const { title } = storeToRefs(store)
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

</script>
