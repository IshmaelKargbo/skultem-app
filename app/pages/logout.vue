<template>
    <div
        class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">

        <!-- Grid bg -->
        <div
            class="absolute inset-0 pointer-events-none opacity-40 dark:opacity-10 bg-grid-light dark:bg-grid-dark" />

        <!-- Glow -->
        <div
            class="absolute -top-30 left-1/2 -translate-x-1/2 w-125 h-125 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />

        <div
            class="relative z-10 flex flex-col items-center gap-5 text-center px-6 max-w-md w-full animate-fade-up">

            <!-- Card -->
            <div
                class="w-full rounded-3xl border border-gray-200/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl dark:shadow-black/30 px-8 py-10">

                <!-- Icon -->
                <div class="relative w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <div
                        class="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin" />

                    <div
                        class="absolute inset-2 rounded-full border-2 border-dashed border-transparent border-b-primary/40 border-l-primary/40"
                        style="animation: spin 2.4s linear infinite reverse;" />

                    <div
                        class="absolute inset-4 rounded-full bg-primary/10 dark:bg-primary/20 backdrop-blur-sm" />

                    <span class="text-3xl relative z-10">👋</span>
                </div>

                <!-- Badge -->
                <UBadge color="neutral" variant="subtle" size="sm" class="tracking-wide mb-5">
                    Sign Out
                </UBadge>

                <!-- Text -->
                <div class="space-y-3">
                    <h1
                        class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        See you later!
                    </h1>

                    <p
                        class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        You're signed in as
                        <strong class="text-primary font-semibold">
                            {{ user.email }}
                        </strong>.
                        Are you sure you want to sign out of Skultem?
                    </p>
                </div>

                <!-- Actions -->
                <div class="flex gap-3 flex-wrap justify-center mt-8">
                    <UButton
                        color="neutral"
                        variant="soft"
                        icon="lucide:arrow-left"
                        to="/">
                        Go Back
                    </UButton>

                    <UButton
                        color="error"
                        icon="lucide:log-out"
                        :loading="isLoading"
                        :disabled="isLoading"
                        @click="logout">
                        {{ isLoading ? 'Signing out…' : 'Yes, sign out' }}
                    </UButton>
                </div>
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

    navigateTo('/login')
}

onMounted(async () => {
    document.title = 'Sign Out | Skultem'
    await store.me()
})
</script>

<style scoped>
.bg-grid-light {
    background-image:
        linear-gradient(#e5e7eb 1px, transparent 1px),
        linear-gradient(90deg, #e5e7eb 1px, transparent 1px);
    background-size: 40px 40px;
}

.bg-grid-dark {
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 40px 40px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes fade-up {
    from {
        opacity: 0;
        transform: translateY(16px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-up {
    animation: fade-up 0.45s ease both;
}
</style>