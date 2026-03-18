<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 relative overflow-hidden">

        <!-- Grid bg -->
        <div class="absolute inset-0 pointer-events-none opacity-40"
            style="background-image: linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px); background-size: 40px 40px;" />

        <div class="relative z-10 flex flex-col items-center gap-5 text-center px-6 max-w-md w-full animate-fade-up">

            <!-- Lock icon -->
            <div class="relative w-20 h-20 flex items-center justify-center">
                <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-red-500 border-r-red-500 animate-spin" />
                <div class="absolute inset-2 rounded-full border-2 border-dashed border-transparent border-b-red-300 border-l-red-300"
                    style="animation: spin 2.4s linear infinite reverse;" />
                <span class="text-3xl">🔒</span>
            </div>

            <!-- Badge -->
            <UBadge color="error" variant="subtle" size="sm" class="tracking-wide">
                403 Unauthorized
            </UBadge>

            <!-- Text -->
            <div class="space-y-2">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Access Restricted</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Your current role
                    <strong class="text-primary font-semibold capitalize">{{ parseRole[activeRole] }}</strong>
                    doesn't have permission to view this page.
                </p>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 flex-wrap justify-center">
                <UButton color="neutral" icon="lucide:arrow-left" @click="goBack">
                    Go Back
                </UButton>
                <UButton to="/" variant="outline" color="neutral" icon="lucide:home">
                    Home
                </UButton>
            </div>

            <!-- Role switcher -->
            <UCard v-if="user?.roles?.length > 1" class="w-full">
                <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Switch Role</p>
                <div class="flex gap-2 flex-wrap justify-center">
                    <UButton
                        v-for="role in user.roles"
                        :key="role"
                        :variant="activeRole === role ? 'solid' : 'outline'"
                        :color="activeRole === role ? 'primary' : 'neutral'"
                        :icon="roleIcon(role)"
                        size="sm"
                        class="capitalize"
                        @click="switchTo(role)"
                    >
                        {{ parseRole[role] }}
                    </UButton>
                </div>
            </UCard>

        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { activeRole, setActiveRole } = useAuth()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

function goBack() {
    if (window.history.length > 1) window.history.back()
    else navigateTo('/')
}

async function switchTo(role: string) {
    setActiveRole(role)
    await navigateTo('/')
}

function roleIcon(role: string) {
    const map: Record<string, string> = {
        SCHOOL_ADMIN: 'lucide:shield',
        TEACHER: 'lucide:book-open',
        student: 'lucide:graduation-cap',
        PARENT: 'lucide:users',
    }
    return map[role] ?? 'lucide:user'
}
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-up { animation: fade-up 0.4s ease both; }
</style>