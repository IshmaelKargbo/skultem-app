<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 relative overflow-hidden">

        <!-- Grid bg -->
        <div class="absolute inset-0 pointer-events-none opacity-40"
            style="background-image: linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px); background-size: 40px 40px;" />

        <div class="relative z-10 flex flex-col items-center gap-5 text-center px-6 max-w-md w-full animate-fade-up">

            <!-- Icon -->
            <div class="relative w-20 h-20 flex items-center justify-center">
                <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin" />
                <div class="absolute inset-2 rounded-full border-2 border-dashed border-transparent border-b-primary/40 border-l-primary/40"
                    style="animation: spin 2.4s linear infinite reverse;" />
                <span class="text-3xl">👋</span>
            </div>

            <!-- Badge -->
            <UBadge color="neutral" variant="subtle" size="sm" class="tracking-wide">
                Sign Out
            </UBadge>

            <!-- Text -->
            <div class="space-y-3">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">See you later!</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    You're signed in as
                    <strong class="text-primary font-semibold">{{ user.email }}</strong>.
                    Are you sure you want to sign out of Skultem?
                </p>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 flex-wrap justify-center">
                <UButton color="neutral" icon="lucide:arrow-left" to="/">
                    Go Back
                </UButton>
                <UButton
                    color="error"
                    icon="lucide:log-out"
                    :loading="isLoading"
                    :disabled="isLoading"
                    @click="logout"
                >
                    {{ isLoading ? 'Signing out…' : 'Yes, sign out' }}
                </UButton>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
const store = useUserStore()
const { user } = storeToRefs(store)
const isLoading = ref(false)

definePageMeta({ layout: 'blank' })

async function logout() {
    isLoading.value = true
    await store.logout()
    isLoading.value = false
    navigateTo('/login')
}

onMounted(async () => {
    document.title = 'Sign Out | Skultem'
    await store.me()
})
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-up { animation: fade-up 0.4s ease both; }
</style>