<template>
    <div class="px-4 pt-4">
        <UCard :ui="{
            body: 'py-1'
        }">
            <div class="flex items-center space-x-2 pt-1.5">
                <MenuDrawer class="md:hidden block" />
                <p v-if="title" class="text-lg font-display font-semibold transition-colors pb-1"
                    :class="isDark ? 'text-gray-100' : 'text-gray-900'">
                    {{ title }}
                </p>

                <USkeleton v-else class="h-4 w-44" />
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

</script>
