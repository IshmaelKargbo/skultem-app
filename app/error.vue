<template>
    <div
        class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">

        <!-- Grid -->
        <div
            class="absolute inset-0 pointer-events-none opacity-40 dark:opacity-10 bg-grid-light dark:bg-grid-dark" />

        <!-- Glow -->
        <div
            class="absolute -top-30 left-1/2 -translate-x-1/2 w-125 h-125 rounded-full bg-red-500/10 blur-3xl dark:bg-red-500/20" />

        <div
            class="absolute -bottom-25 -right-25 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />

        <!-- Content -->
        <div
            class="relative z-10 w-full max-w-lg px-6 animate-fade-up">

            <!-- Logo -->
            <div class="flex justify-center mb-6">
                <div
                    class="w-14 h-14 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg flex items-center justify-center">
                    <img
                        src="/icon.svg"
                        alt="Skultem"
                        class="w-8 h-8" />
                </div>
            </div>

            <!-- Card -->
            <div
                class="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl dark:shadow-black/30 overflow-hidden">

                <!-- Top Accent -->
                <div
                    class="h-1.5"
                    :class="is404
                        ? 'bg-linear-to-r from-orange-500 via-red-500 to-orange-500'
                        : 'bg-linear-to-r from-red-500 via-pink-500 to-red-500'" />

                <div class="p-8 text-center">

                    <!-- Animated Icon -->
                    <div class="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">

                        <!-- Outer Ring -->
                        <div
                            class="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                            :class="is404
                                ? 'border-t-orange-500 border-r-orange-500'
                                : 'border-t-red-500 border-r-red-500'" />

                        <!-- Inner Ring -->
                        <div
                            class="absolute inset-2 rounded-full border-2 border-dashed border-transparent"
                            :class="is404
                                ? 'border-b-orange-300 border-l-orange-300'
                                : 'border-b-red-300 border-l-red-300'"
                            style="animation: spin 2.4s linear infinite reverse;" />

                        <!-- Center -->
                        <div
                            class="absolute inset-4 rounded-full flex items-center justify-center backdrop-blur bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800">

                            <span class="text-4xl">
                                {{ is404 ? '🏫' : '⚠️' }}
                            </span>
                        </div>

                    </div>

                    <!-- Badge -->
                    <UBadge
                        color="error"
                        variant="soft"
                        size="sm"
                        class="tracking-wide mb-5">

                        {{ error.statusCode }}
                        {{ is404 ? 'Not Found' : 'Application Error' }}
                    </UBadge>

                    <!-- Text -->
                    <div class="space-y-3">

                        <h1
                            class="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">

                            {{ is404
                                ? 'School Not Found'
                                : 'Something Went Wrong'
                            }}
                        </h1>

                        <p
                            class="text-sm md:text-base leading-relaxed text-gray-500 dark:text-gray-400 max-w-md mx-auto">

                            {{ is404
                                ? 'This school workspace may not exist, may have been moved, or the URL could be incorrect.'
                                : 'An unexpected error occurred while processing your request. Please try again or return to the homepage.'
                            }}
                        </p>

                    </div>

                    <!-- Error Details -->
                    <div
                        v-if="error.message"
                        class="mt-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 p-4 text-left">

                        <div
                            class="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-2">

                            <UIcon name="lucide:info" />
                            Error Details
                        </div>

                        <p
                            class="text-sm text-gray-600 dark:text-gray-300 wrap-break-word">
                            {{ error.message }}
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-wrap justify-center gap-3 mt-8">

                        <UButton
                            color="neutral"
                            variant="soft"
                            icon="lucide:house"
                            to="/">
                            Back Home
                        </UButton>

                        <UButton
                            color="error"
                            icon="lucide:refresh-cw"
                            @click="handleError">

                            Try Again
                        </UButton>

                    </div>

                    <!-- Footer -->
                    <div
                        class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">

                        <p
                            class="text-xs text-gray-500 dark:text-gray-400">
                            Skultem School Management Platform
                        </p>
                    </div>

                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    error: {
        statusCode: number
        message?: string
    }
}>()

const is404 = computed(() => props.error.statusCode === 404)

function handleError() {
    clearError({
        redirect: '/'
    })
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