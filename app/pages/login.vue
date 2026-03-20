<template>
    <div class="min-h-screen flex">

        <!-- Left Panel -->
        <div class="hidden md:flex w-1/2 bg-gray-50 flex-col justify-center items-center p-10 space-y-10">
            <img src="/teacher.svg" alt="School Illustration" class="w-3/4" />
            <div class="text-center">
                <h1 class="text-3xl font-bold mb-5">Welcome to Skultem</h1>
                <p class="text-lg text-gray-600">
                    Making school life simple, smart, and stress-free.
                </p>
            </div>
        </div>

        <!-- Right Panel -->
        <div class="flex flex-1 justify-center items-center p-6 bg-white">

            <div class="w-full max-w-md">

                <!-- Logo -->
                <div class="text-center mb-6 space-y-8">
                    <img src="/icon.svg" alt="Skultem Logo" class="mx-auto h-18" />
                    <h2 class="text-2xl font-bold text-gray-700">
                        Sign in to Skultem
                    </h2>
                </div>

                <!-- Login Form -->
                <UForm :schema="schema" :state="state" @submit.prevent="handleLogin" class="space-y-5">

                    <!-- Email -->
                    <UFormField label="Email" name="email">
                        <UInput size="xl" v-model="state.email" placeholder="Enter your email" />
                    </UFormField>

                    <!-- Password -->
                    <UFormField label="Password" name="password">
                        <UInput size="xl" type="password" v-model="state.password" placeholder="Enter your password" />
                    </UFormField>

                    <!-- Remember + Forgot -->
                    <div class="flex items-center justify-between">
                        <label class="flex items-center space-x-2 text-gray-600">
                            <input type="checkbox" v-model="state.rememberMe"
                                class="form-checkbox h-4 w-4 text-blue-600" />
                            <span>Remember me</span>
                        </label>

                        <a href="#" class="text-blue-600 hover:underline text-sm">
                            Forgot Password?
                        </a>
                    </div>

                    <!-- Login Button -->
                    <UButton type="submit" size="xl" :loading="loading" class="w-full flex justify-center">
                        Login
                    </UButton>
                </UForm>
            </div>

        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import * as yup from "yup"

const state = reactive({
    email: "",
    password: "",
    rememberMe: false
})

const loading = ref(false)
const toast = useToast()

const userStore = useUserStore()

const schema = yup.object({
    email: yup
        .string()
        .email("Enter a valid email")
        .required("Email is required"),

    password: yup
        .string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required")
})

const handleLogin = async () => {
    try {

        loading.value = true

        const res = await userStore.login({
            domain: "kings-way",
            email: state.email,
            password: state.password
        })

        navigateTo("/")
    } catch (err: any) {
        loading.value = false
        toast.add({
            description: err.message,
            color: "error"
        })
    }
}

definePageMeta({
    layout: "blank",
    middleware: "guest"
})

onMounted(() => {
    document.title = "Login | Skultem"
})
</script>