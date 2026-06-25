<template>
    <div class="px-4 pt-4">
        <UCard>
            <div class="container mx-auto flex items-center justify-between">

                <!-- LEFT -->
                <div class="flex items-center space-x-2">
                    <MenuDrawer class="md:hidden block" />
                    <p v-if="title" class="text-lg font-display font-semibold transition-colors pb-1"
                        :class="isDark ? 'text-gray-100' : 'text-gray-900'">
                        {{ title }}
                    </p>

                    <USkeleton v-else class="h-4 w-44" />
                </div>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const store = useAppStore()
const { title, back } = storeToRefs(store)

const router = useRouter()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function goBack() {
    router.back()
}
</script>
