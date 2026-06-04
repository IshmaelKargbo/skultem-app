<template>
    <div class="px-4 pt-4">
        <UCard
            :ui="{
                body: 'sm:px-5 sm:py-2',
                base: isDark ? 'bg-gray-900 ring-gray-800' : 'bg-white ring-gray-200'
            }"
        >
            <div class="container mx-auto flex items-center justify-between">

                <!-- LEFT -->
                <div class="flex items-center space-x-2">
                    <MenuDrawer class="md:hidden block" />

                    <UButton
                        v-if="back"
                        @click="goBack"
                        variant="ghost"
                        color="neutral"
                        :icon="BACK_ICON"
                    />

                    <p
                        v-if="title"
                        class="text-lg font-display font-semibold transition-colors"
                        :class="isDark ? 'text-gray-100' : 'text-gray-900'"
                    >
                        {{ title }}
                    </p>

                    <USkeleton v-else class="h-4 w-44" />
                </div>

                <!-- RIGHT -->
                <div class="flex items-center space-x-3">

                    <!-- Theme Toggle -->
                    <UButton
                        variant="ghost"
                        color="neutral"
                        :icon="isDark ? SUN_ICON : MOON_ICON"
                        @click="toggleTheme"
                    />
                    <Notification v-if="can(['PARENT'])" />
                    <Me class="hidden md:block" />

                </div>

            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const store = useAppStore()
const { title, back } = storeToRefs(store)
const {can} = useAuth()

const router = useRouter()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function goBack() {
    router.back()
}

function toggleTheme() {
    colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>
