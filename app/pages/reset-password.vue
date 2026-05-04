<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 relative overflow-hidden">

        <!-- Grid bg -->
        <div class="absolute inset-0 pointer-events-none opacity-40"
            style="background-image: linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px); background-size: 40px 40px;" />

        <div class="relative z-10 w-full max-w-lg px-6 animate-fade-up">

            <UCard>
                <div class="space-y-5 p-5">
                    <!-- Header -->
                    <div class="text-center space-y-2 mb-5">
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                            Reset Password
                        </h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Enter a new password for your account.
                        </p>
                    </div>

                    <UForm :schema="schema" :state="state" @submit.prevent="handleReset" class="space-y-4">
                        <UFormField name="password" label="New Password" help="Must be at least 6 characters.">
                            <UInput v-model="state.password" :type="showPassword ? 'text' : 'password'"
                                placeholder="New password" icon="lucide:lock">
                                <template #trailing>
                                    <UButton variant="ghost" size="xs" tabindex="-1"
                                        :icon="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
                                        @click="showPassword = !showPassword" />
                                </template>
                            </UInput>
                        </UFormField>

                        <UFormField name="confirmPassword" label="Confirm Password"
                            help="Re-enter your password to confirm.">
                            <UInput v-model="state.confirmPassword" :type="showConfirm ? 'text' : 'password'"
                                placeholder="Confirm password" icon="lucide:lock">
                                <template #trailing>
                                    <UButton variant="ghost" size="xs" tabindex="-1"
                                        :icon="showConfirm ? 'lucide:eye-off' : 'lucide:eye'"
                                        @click="showConfirm = !showConfirm" />
                                </template>
                            </UInput>
                        </UFormField>
                        <UButton type="submit" block :loading="loading">
                            Reset Password
                        </UButton>
                    </UForm>
                </div>
            </UCard>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'
definePageMeta({ layout: false })

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

async function handleReset() {
    try {
        loading.value = true

        await store.resetPassword({
            password: state.password
        })

        useRouter().push("/")
        useNotify().success("Password reset successfully")
    } catch (err: any) {
        error.value = err?.data?.message || 'Something went wrong'
    } finally {
        loading.value = false
    }
}
</script>