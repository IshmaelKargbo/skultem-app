<template>
    <div class="flex items-center space-x-3 relative">


        <!-- User Dropdown -->
        <UDropdownMenu v-if="user && user.email && !loading" :items="items" arrow :ui="{ content: 'w-48' }">
            <div class="flex space-x-3 items-center cursor-pointer">
                <div class="text-right" @click="dropdownOpen = !dropdownOpen">
                    <p class="text-xs">{{ name }}</p>
                    <p class="text-xs text-muted">{{ user.email }}</p>
                </div>
                <UAvatar :alt="name" />
                <UIcon name="lucide:chevron-down" class="cursor-pointer" @click="dropdownOpen = !dropdownOpen" />
            </div>
        </UDropdownMenu>
        <!-- Loading State -->
        <div v-else class="flex space-x-3 items-center">
            <div class="space-y-1 flex flex-col items-end">
                <div class="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-2.5 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div class="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
    </div>
</template>

<script setup>
const userStore = useUserStore()
const { user, meLoading: loading } = storeToRefs(userStore)
const dropdownOpen = ref(false)

const name = computed(() => user.value ? `${user.value.givenNames} ${user.value.familyName}` : '')

const items = ref([
    [
        {
            label: name,
            avatar: {
                alt: name,
                loading: 'lazy'
            },
            type: 'label'
        }
    ],
    [
        {
            label: 'Logout',
            icon: 'i-lucide-log-out',
            color: 'error',
            to: "/logout"
        }
    ]
])

onMounted(async () => {
    await userStore.me()
})
</script>