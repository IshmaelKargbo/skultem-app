<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
        <div class="absolute inset-0 pointer-events-none opacity-40"
            style="background-image: linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px); background-size: 40px 40px;" />

        <div class="relative z-10 flex flex-col items-center gap-5 text-center px-6 max-w-md w-full animate-fade-up">
            <div class="relative w-20 h-20 flex items-center justify-center">
                <div
                    class="absolute inset-0 rounded-full border-2 border-transparent border-t-red-500 border-r-red-500 animate-spin" />
                <div class="absolute inset-2 rounded-full border-2 border-dashed border-transparent border-b-red-300 border-l-red-300"
                    style="animation: spin 2.4s linear infinite reverse;" />
                <span class="text-3xl">{{ is404 ? '🏫' : '⚠️' }}</span>
            </div>
            <UBadge color="error" variant="subtle" size="sm" class="tracking-wide">
                {{ error.statusCode }} {{ is404 ? 'Not Found' : 'Error' }}
            </UBadge>
            <div class="space-y-2">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {{ is404 ? 'School Not Found' : 'Something Went Wrong' }}
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {{ is404
                        ? 'This school doesn\'t exist or may have moved. Double-check the URL and try again.'
                        : 'An unexpected error occurred. Please try again or contact support.'
                    }}
                </p>
            </div>
            <div class="flex gap-3 flex-wrap justify-center">
                <UButton color="neutral" icon="lucide:refresh-cw" @click="handleError">
                    Try Again
                </UButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message?: string } }>()

const is404 = computed(() => props.error.statusCode === 404)

function handleError() {
    clearError({ redirect: '/' })
}
</script>

<style scoped>
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
    animation: fade-up 0.4s ease both;
}
</style>