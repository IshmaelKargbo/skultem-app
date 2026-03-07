<template>
    <div class="flex items-center space-x-3">
        <!-- Loading State -->
        <div v-if="loading" class="flex space-x-3 items-center">
            <div class="space-y-1 flex flex-col items-end">
                <div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-2.5 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div class="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        <!-- User Info -->
        <div v-else-if="user" class="flex space-x-3 items-center">
            <div class="text-right">
                <p class="text-xs">{{ user.givenNames }} {{ user.familyName }}</p>
                <p class="text-xs text-muted">{{ user.email }}</p>
            </div>
            <UAvatar size="lg" :alt="`${user.givenNames} ${user.familyName}`" />
        </div>

        <!-- No User -->
        <div v-else>
            <p class="text-sm text-gray-500">No user logged in</p>
        </div>
    </div>
</template>

<script setup>
const userStore = useUserStore()
const loading = ref(true)
const { user } = storeToRefs(userStore)

onMounted(async () => {
    loading.value = true
    try {
        await userStore.me()
    } finally {
        loading.value = false
    }
})
</script>