<template>
    <div class="px-4 pt-4">
        <UCard :ui="{
            body: 'py-1'
        }">
            <div class="flex items-center gap-3 pt-1.5">
                <MenuDrawer class="md:hidden block" />
                <p v-if="title" class="min-w-0 truncate text-lg font-display font-semibold transition-colors pb-1 sm:text-xl"
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
const { title, back } = storeToRefs(store)

const router = useRouter()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

</script>
