<template>
  <div class="min-h-screen flex font-sans">

    <!-- Left Panel -->
    <div class="hidden md:flex w-[44%] flex-col justify-end p-10 relative overflow-hidden"
      style="background: #0F1E3C;">
      <div class="absolute rounded-full  bg-cyan-600" style="width:320px;height:320px;top:-90px;right:-90px;opacity:0.06;" />
      <div class="absolute rounded-full  bg-cyan-400" style="width:180px;height:180px;bottom:60px;left:-50px;opacity:0.06;" />

      <div class="self-start flex items-center gap-2 mb-7 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide bg-primary-700/50 text-gray-300">
        <span class="w-1.5 h-1.5 rounded-full bg-primary-500" />
        School management platform
      </div>

      <h1 class="font-medium text-5xl leading-tight mb-4 text-white">
        Making school<br>life <em class="text-primary">simpler</em>
      </h1>
      <p class="text-sm leading-relaxed mb-8" style="color:rgba(245,240,232,0.5);">
        Attendance, grades, schedules, and communication — all in one place.
      </p>

      <div class="flex gap-2">
        <span class="w-2 h-2 rounded-full bg-primary"/>
        <span class="w-2 h-2 rounded-full bg-primary-800" />
        <span class="w-2 h-2 rounded-full bg-primary-800" />
      </div>
    </div>

    <!-- Right Panel -->
    <div class="flex flex-1 items-center justify-center px-8 py-12 bg-white dark:bg-gray-950">
      <div class="w-full max-w-sm">

        <!-- Brand mark -->
        <div class="flex items-center gap-1 mb-9">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center">
            <img src="/icon.svg" alt="Skultem" class="w-7 h-7" />
          </div>
          <span class="text-xl font-semibold font-display">SkulTem</span>
        </div>

        <h2 class="text-2xl font-display font-semibold mb-1">
          Welcome Back !
        </h2>
        <p class="text-sm text-gray-400 mb-7">Sign in to your school account</p>

        <!-- Form -->
        <UForm :schema="schema" :state="state" @submit="handleLogin" class="space-y-4">

          <UFormField
            name="email"
            label="Email"
            :ui="{ label: 'text-xs font-medium tracking-widest uppercase text-gray-400 mb-1' }"
          >
            <UInput
              v-model="state.email"
              size="lg"
              placeholder="you@school.edu"
              type="email"
              class="w-full"
              :ui="{
                base: 'w-full',
                rounded: 'rounded-lg',
              }"
            />
          </UFormField>

          <UFormField
            name="password"
            label="Password"
            :ui="{ label: 'text-xs font-medium tracking-widest uppercase text-gray-400 mb-1' }"
          >
            <UInput
              v-model="state.password"
              size="lg"
              type="password"
              placeholder="••••••••"
              class="w-full"
              :ui="{
                base: 'w-full',
                rounded: 'rounded-lg',
              }"
            />
          </UFormField>

          <!-- Remember + Forgot -->
          <div class="flex items-center justify-between pt-1">
            <UCheckbox
              v-model="state.rememberMe"
              label="Remember me"
              :ui="{
                label: 'text-sm text-gray-500 cursor-pointer',
                base: 'accent-[#0F1E3C]'
              }"
            />
            <UButton
              variant="link"
              to="#"
              class="text-sm font-medium p-0"
              :ui="{ base: 'text-[#1A3A72]' }"
            >
              Forgot password?
            </UButton>
          </div>

          <!-- Submit -->
          <UButton
            type="submit"
            size="lg"
            :loading="loading"
            block
            :ui="{
              base: 'w-full justify-center font-medium tracking-wide transition-all',
              rounded: 'rounded-lg',
              color: {
                primary: {
                  solid: 'bg-[#0F1E3C] hover:bg-[#1A3A72] text-[#F5F0E8] border-none'
                }
              }
            }"
          >
            Sign in
          </UButton>

        </UForm>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import * as yup from "yup"

const state = reactive({
  email: "",
  password: "",
  rememberMe: false
})

const loading = ref(false)
const toast = useToast()
const userStore = useUserStore()
const { initializeActiveRole, setAuthResolved } = useAuth()
const { show, hide } = useGlobalLoader()

const schema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required")
})

const handleLogin = async () => {
  try {
    loading.value = true
    setAuthResolved(false)
    await userStore.login({ domain: "kings-way", email: state.email, password: state.password })
    show({
      title: 'Signing you in...',
      subtitle: 'Preparing your dashboard',
      hint: 'Loading your workspace'
    })
    await userStore.me()
    initializeActiveRole()
    setAuthResolved(true)
    await navigateTo("/")
  } catch (err: any) {
    loading.value = false
    setAuthResolved(true)
    hide()
    toast.add({ description: err.message, color: "error" })
  }
}

definePageMeta({ layout: "blank", middleware: "guest" })
onMounted(() => { document.title = "Login | Skultem" })
</script>
