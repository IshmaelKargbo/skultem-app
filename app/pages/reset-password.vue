<template>
    <div
        class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">

        <!-- Background Grid -->
        <div
            class="absolute inset-0 pointer-events-none opacity-40 dark:opacity-10 bg-grid-light dark:bg-grid-dark" />

        <!-- Glow Effects -->
        <div
            class="absolute -top-30 left-1/2 -translate-x-1/2 w-125 h-125 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />

        <div
            class="absolute -bottom-30 -right-30 w-87.5 h-87.5 rounded-full bg-cyan-500/10 blur-3xl" />

        <!-- Content -->
        <div
            class="relative z-10 w-full max-w-xl px-6 animate-fade-up">

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
                class="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg dark:shadow-black/30 overflow-hidden">

                <!-- Top Accent -->
                <div
                    class="h-1.5 bg-linear-to-r from-primary via-cyan-500 to-primary" />

                <div class="py-5 px-8">
                    <!-- Header -->
                    <div class="text-center mb-8">
                        <div
                            class="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-5">

                            <UIcon
                                name="lucide:key-round"
                                class="w-8 h-8 text-primary" />
                        </div>

                        <h1
                            class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Reset Password
                        </h1>

                        <p
                            class="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                            Create a new secure password for your account.
                        </p>
                    </div>

                    <!-- Error -->
                    <UAlert
                        v-if="error"
                        color="error"
                        variant="soft"
                        icon="lucide:alert-circle"
                        :title="error"
                        class="mb-5" />

                    <!-- Form -->
                    <UForm
                        :schema="schema"
                        :state="state"
                        @submit.prevent="handleReset"
                        class="space-y-5">

                        <!-- Password -->
                        <UFormField
                            name="password"
                            label="New Password"
                            help="Must be at least 6 characters."
                            :ui="{
                                label: 'text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-2',
                                help: 'text-xs text-gray-400 dark:text-gray-500 mt-1'
                            }">

                            <UInput
                                v-model="state.password"
                                :type="showPassword ? 'text' : 'password'"
                                size="xl"
                                placeholder="Enter new password"
                                icon="lucide:lock"
                                class="w-full"
                                :ui="{
                                    base: 'rounded-xl'
                                }">

                                <template #trailing>
                                    <UButton
                                        variant="ghost"
                                        size="xs"
                                        tabindex="-1"
                                        :icon="showPassword
                                            ? 'lucide:eye-off'
                                            : 'lucide:eye'"
                                        @click="showPassword = !showPassword" />
                                </template>

                            </UInput>
                        </UFormField>

                        <!-- Confirm Password -->
                        <UFormField
                            name="confirmPassword"
                            label="Confirm Password"
                            help="Re-enter your password to confirm."
                            :ui="{
                                label: 'text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-2',
                                help: 'text-xs text-gray-400 dark:text-gray-500 mt-1'
                            }">

                            <UInput
                                v-model="state.confirmPassword"
                                :type="showConfirm ? 'text' : 'password'"
                                size="xl"
                                placeholder="Confirm your password"
                                icon="lucide:shield-check"
                                class="w-full"
                                :ui="{
                                    base: 'rounded-xl'
                                }">

                                <template #trailing>
                                    <UButton
                                        variant="ghost"
                                        size="xs"
                                        tabindex="-1"
                                        :icon="showConfirm
                                            ? 'lucide:eye-off'
                                            : 'lucide:eye'"
                                        @click="showConfirm = !showConfirm" />
                                </template>

                            </UInput>
                        </UFormField>

                        <!-- Password Strength -->
                        <div class="space-y-2">

                            <div class="flex gap-2">
                                <div
                                    class="h-1.5 flex-1 rounded-full transition-all duration-300"
                                    :class="passwordStrength >= 1
                                        ? 'bg-error'
                                        : 'bg-gray-200 dark:bg-gray-800'" />

                                <div
                                    class="h-1.5 flex-1 rounded-full transition-all duration-300"
                                    :class="passwordStrength >= 2
                                        ? 'bg-yellow-500'
                                        : 'bg-gray-200 dark:bg-gray-800'" />

                                <div
                                    class="h-1.5 flex-1 rounded-full transition-all duration-300"
                                    :class="passwordStrength >= 3
                                        ? 'bg-green-500'
                                        : 'bg-gray-200 dark:bg-gray-800'" />
                            </div>

                            <p
                                class="text-xs text-gray-500 dark:text-gray-400">
                                {{ passwordLabel }}
                            </p>

                        </div>

                        <!-- Submit -->
                        <UButton
                            type="submit"
                            size="xl"
                            block
                            :loading="loading"
                            class="rounded-xl h-12 font-medium shadow-lg shadow-primary/20">

                            Reset Password
                        </UButton>

                    </UForm>

                    <!-- Footer -->
                    <div
                        class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">

                        <p
                            class="text-xs text-gray-500 dark:text-gray-400">
                            Remember your password?

                            <NuxtLink
                                to="/login"
                                class="text-primary font-medium hover:underline">
                                Back to login
                            </NuxtLink>
                        </p>
                    </div>

                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'

definePageMeta({
    layout: false
})

const store = useUserStore()

const loading = ref(false)
const error = ref('')

const showPassword = ref(false)
const showConfirm = ref(false)

const state = reactive({
    password: '',
    confirmPassword: ''
})

const schema = yup.object({
    password: yup
        .string()
        .required('Password is required')
        .min(6, 'Must be at least 6 characters'),

    confirmPassword: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('password')], 'Passwords do not match')
})

const passwordStrength = computed(() => {
    const password = state.password

    let strength = 0

    if (password.length >= 6) strength++
    if (/[A-Z]/.test(password) || /[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password) || password.length >= 10) strength++

    return strength
})

const passwordLabel = computed(() => {
    switch (passwordStrength.value) {
        case 1:
            return 'Weak password'
        case 2:
            return 'Medium strength password'
        case 3:
            return 'Strong password'
        default:
            return 'Use a strong and secure password'
    }
})

async function handleReset() {
    try {
        loading.value = true
        error.value = ''

        await store.resetPassword({
            password: state.password
        })

        useNotify().success('Password reset successfully')

        window.location.href = '/'
    } catch (err: any) {
        error.value =
            err?.data?.message ||
            err?.message ||
            'Something went wrong'

        loading.value = false
    } 
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