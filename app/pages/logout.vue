<template>
    <div class="min-h-screen bg-white flex items-center justify-center">
        <div class="space-y-3 text-center text-base">
            <div class="flex flex-col items-center space-y-5">
                <img src="/icon.svg" class="h-18" />
                <p class="text-2xl font-semibold">Logout</p>
            </div>
            <p>Hi <span class="font-semibold">{{ user.email }}</span></p>
            <p class="text-mute">Are you sure you want to logout from skultem</p>
            <div class="w-auto flex space-x-3 mt-5">
                <UButton to="/" size="xl" variant="outline" class="w-full flex justify-center" label="No" />
                <UButton @click="logout" :leading="isLoading" size="xl" variant="outline" color="error"
                    class="w-full flex justify-center" label="Yes" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const store = useUserStore()
const { user } = storeToRefs(store)
const isLoading = ref(false)

definePageMeta({
    layout: 'blank'
})

async function logout() {
    isLoading.value = true
    await store.logout()
    isLoading.value = false
    navigateTo("/login")
}

onMounted(async () => {
    document.title = "Logout | Skultem"
    await store.me()
})
</script>