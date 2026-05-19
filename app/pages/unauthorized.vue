<template>
    <div
        class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">

        <!-- Grid -->
        <div
            class="absolute inset-0 pointer-events-none opacity-40 dark:opacity-10 bg-grid-light dark:bg-grid-dark" />

        <!-- Glow -->
        <div
            class="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-red-500/10 blur-3xl dark:bg-red-500/20" />

        <div
            class="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] rounded-full bg-primary/10 blur-3xl" />

        <!-- Content -->
        <div
            class="relative z-10 w-full max-w-md px-6 animate-fade-up text-center">

            <!-- Icon -->
            <div class="relative w-24 h-24 mx-auto flex items-center justify-center mb-6">

                <div
                    class="absolute inset-0 rounded-full border-2 border-transparent animate-spin border-t-red-500 border-r-red-500" />

                <div
                    class="absolute inset-2 rounded-full border-2 border-dashed border-transparent border-b-red-300 border-l-red-300"
                    style="animation: spin 2.4s linear infinite reverse;" />

                <div
                    class="absolute inset-4 rounded-full bg-white/70 dark:bg-gray-900/70 backdrop-blur border border-gray-200 dark:border-gray-800 flex items-center justify-center">

                    <span class="text-4xl">🔒</span>
                </div>
            </div>

            <!-- Badge -->
            <UBadge
                color="error"
                variant="soft"
                size="sm"
                class="tracking-wide mb-5">

                403 Unauthorized
            </UBadge>

            <!-- Title -->
            <h1
                class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">

                Access Restricted
            </h1>

            <!-- Message -->
            <p
                class="mt-3 text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">

                Your current role
                <span class="font-semibold text-primary capitalize">
                    {{ parseRole[activeRole] }}
                </span>
                doesn’t have permission to view this page.
            </p>

            <!-- Actions -->
            <div class="flex gap-3 flex-wrap justify-center mt-8">

                <UButton
                    color="neutral"
                    variant="soft"
                    icon="lucide:arrow-left"
                    @click="goBack">

                    Go Back
                </UButton>

                <UButton
                    color="primary"
                    variant="solid"
                    icon="lucide:home"
                    to="/">

                    Home
                </UButton>
            </div>

            <!-- Role Switcher -->
            <UCard
                v-if="user?.roles?.length > 1"
                class="mt-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur border border-gray-200 dark:border-gray-800">

                <p
                    class="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                    Switch Role
                </p>

                <div class="flex flex-wrap gap-2 justify-center">

                    <UButton
                        v-for="role in user.roles"
                        :key="role"
                        size="sm"
                        class="capitalize transition-all"
                        :variant="activeRole === role ? 'solid' : 'soft'"
                        :color="activeRole === role ? 'primary' : 'neutral'"
                        :icon="roleIcon(role)"
                        @click="switchTo(role)">

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
        PARENT: 'lucide:users'
    }
    return map[role] ?? 'lucide:user'
}
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