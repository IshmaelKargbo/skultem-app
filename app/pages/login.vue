<template>
  <div class="h-screen flex font-sans bg-white dark:bg-gray-950 overflow-hidden">
    <!-- LEFT PANEL -->
    <div class="hidden lg:flex h-full w-[48%] relative overflow-hidden border-r border-white/5">

      <!-- Background -->
      <div class="absolute inset-0 bg-[#060f20]" />

      <!-- Ambient glows -->
      <div class="absolute -top-20 -right-20 w-105 h-105 rounded-full bg-cyan-400/10 blur-[80px]" />
      <div class="absolute -bottom-20 -left-20 w-85 h-85 rounded-full bg-primary/10 blur-[80px]" />
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-75 rounded-full bg-indigo-500/5 blur-[60px]" />

      <div class="absolute inset-0 opacity-[0.035] bg-grid" />
      <div class="absolute inset-0 opacity-[0.15] bg-noise" />
      <div class="relative z-10 flex-1 flex flex-col px-10 py-8 gap-6 overflow-hidden">

        <div class="flex-1 min-h-0 flex flex-col justify-center">
          <UCarousel v-slot="{ item }" :items="slides" :ui="{
            item: 'basis-full',
            indicators: {
              wrapper: 'absolute bottom-0 left-0 right-0 flex justify-start gap-2',
              inactive: 'w-2 h-2 bg-white/20 hover:bg-white/40 rounded-full transition-all duration-300',
              active: 'w-8 h-2 bg-primary rounded-full'
            }
          }" indicators :autoplay="{ interval: 5000 }" class="w-full">
            <div class="flex flex-col justify-center h-full max-w-lg pb-10 space-y-5">

              <!-- Badge -->
              <div
                class="inline-flex w-fit items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur text-[10px] font-semibold tracking-widest text-white/70 uppercase">
                <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {{ item.badge }}
              </div>

              <!-- Title -->
              <div>
                <h1 class="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight text-white">
                  {{ item.title }}
                </h1>
                <span
                  class="block text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight bg-linear-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent mt-1">
                  {{ item.highlight }}
                </span>
              </div>

              <!-- Description -->
              <p class="text-sm leading-relaxed text-white/50 max-w-sm">
                {{ item.description }}
              </p>

              <!-- Features -->
              <div class="space-y-2.5">
                <div v-for="feature in item.features" :key="feature.title"
                  class="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 backdrop-blur hover:bg-white/[0.07] transition-colors duration-200">

                  <div
                    class="w-8 h-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                    <UIcon :name="feature.icon" class="w-3.5 h-3.5 text-primary" />
                  </div>

                  <div>
                    <p class="text-sm font-semibold text-white/90">{{ feature.title }}</p>
                    <p class="text-xs text-white/40">{{ feature.description }}</p>
                  </div>
                </div>
              </div>

            </div>
          </UCarousel>
        </div>

        <!-- Bottom tagline -->
        <div class="text-xs text-white/20 font-medium tracking-wide shrink-0">
          Trusted by 500+ schools worldwide
        </div>

      </div>
    </div>

    <!-- RIGHT PANEL -->
    <div
      class="flex h-full flex-1 items-center justify-center px-6 py-6 bg-gray-50 dark:bg-[#060f20] relative overflow-hidden">

      <!-- Radial glow -->
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

      <div class="relative z-10 w-full max-w-md">

        <!-- Logo -->
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 shadow-md border border-gray-200 dark:border-white/10 flex items-center justify-center">
            <img src="/icon.svg" alt="Skultem" class="w-9 h-10" />
          </div>

          <div>
            <h2 class="text-base font-bold text-gray-900 dark:text-white tracking-tight">Skultem</h2>
            <p class="text-[11px] text-gray-400 dark:text-white/30">School Management Platform</p>
          </div>
        </div>

        <!-- Card -->
        <div
          class="rounded-3xl border border-gray-200 dark:border-white/8 bg-white/95 dark:bg-white/3 backdrop-blur-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 p-7">

          <div class="mb-6">
            <h1 class="text-[1.75rem] font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome back
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-white/40">
              Sign in to continue to your dashboard
            </p>
          </div>

          <!-- FORM -->
          <UForm :schema="schema" :state="state" @submit="handleLogin" class="space-y-4">

            <!-- Email -->
            <UFormField name="email" label="Email Address" :ui="{
              label: 'text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 dark:text-white/30 mb-1.5'
            }">
              <UInput v-model="state.email" type="email" size="lg" placeholder="you@school.edu" icon="lucide:mail"
                class="w-full" :ui="{ base: 'w-full rounded-xl' }" />
            </UFormField>

            <!-- Password -->
            <UFormField name="password" label="Password" :ui="{
              label: 'text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 dark:text-white/30 mb-1.5'
            }">
              <UInput v-model="state.password" :type="showPassword ? 'text' : 'password'" size="lg"
                placeholder="••••••••" icon="lucide:lock" class="w-full" :ui="{ base: 'w-full rounded-xl' }">
                <template #trailing>
                  <UButton variant="ghost" size="xs" tabindex="-1"
                    :icon="showPassword ? 'iconamoon:eye-off-light' : 'iconamoon:eye-light'"
                    @click="showPassword = !showPassword" />
                </template>
              </UInput>
            </UFormField>

            <!-- Remember & Forgot -->
            <div class="flex items-center justify-between">
              <UCheckbox v-model="state.rememberMe" label="Remember me" :ui="{
                label: 'text-sm text-gray-600 dark:text-white/50 cursor-pointer'
              }" />
              <UButton variant="link" to="#" class="p-0 text-sm font-semibold">
                Forgot password?
              </UButton>
            </div>

            <!-- Submit -->
            <UButton type="submit" size="lg" :loading="loading" block
              class="rounded-xl font-semibold shadow-lg shadow-primary/20 tracking-wide mt-1">
              Sign in to Skultem
            </UButton>

          </UForm>

          <!-- Footer note -->
          <p class="mt-5 text-center text-xs text-gray-400 dark:text-white/25">
            Having trouble? Contact your
            <UButton variant="link" to="#" class="p-0 text-xs font-semibold inline">school admin</UButton>
          </p>

        </div>

        <!-- Bottom text -->
        <p class="mt-4 text-center text-xs text-gray-400 dark:text-white/20">
          © {{ new Date().getFullYear() }} Skultem · All rights reserved
        </p>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const state = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const loading = ref(false)

const userStore = useUserStore()
const { initializeActiveRole, setAuthResolved } = useAuth()
const { show, hide } = useGlobalLoader()

const slides = [
  {
    badge: 'Smart School Platform',
    icon: 'lucide:graduation-cap',
    title: 'Manage your',
    highlight: 'entire school',
    description:
      'Handle attendance, grading, classes, communication, and operations from one powerful dashboard.',
    features: [
      {
        icon: 'lucide:check-circle-2',
        title: 'Attendance Tracking',
        description: 'Monitor student attendance in real time'
      },
      {
        icon: 'lucide:users',
        title: 'Student Management',
        description: 'Keep student records organized and secure'
      }
    ]
  },
  {
    badge: 'Academic Excellence',
    icon: 'lucide:book-open-check',
    title: 'Smarter',
    highlight: 'learning tools',
    description:
      'Empower teachers with grading systems, report cards, assessments, and academic analytics.',
    features: [
      {
        icon: 'lucide:file-bar-chart',
        title: 'Performance Reports',
        description: 'Generate detailed student reports instantly'
      },
      {
        icon: 'lucide:clipboard-check',
        title: 'Assessment Tools',
        description: 'Create exams, assignments, and grading templates'
      }
    ]
  },
  {
    badge: 'Connected Communication',
    icon: 'lucide:messages-square',
    title: 'Keep parents',
    highlight: 'and schools connected',
    description:
      'Send announcements, updates, schedules, and important notices seamlessly to everyone.',
    features: [
      {
        icon: 'lucide:bell-ring',
        title: 'Instant Notifications',
        description: 'Keep everyone updated in real time'
      },
      {
        icon: 'lucide:calendar-days',
        title: 'Schedules & Events',
        description: 'Organize school calendars and activities'
      }
    ]
  }
]

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
})

const handleLogin = async () => {
  try {
    loading.value = true
    setAuthResolved(false)

    const hostname = useRequestURL().hostname
    const domain = hostname.includes('localhost') ? runtimeConf().domain : hostname.split('.')[0]

    await userStore.login({
      domain: domain || '',
      email: state.email,
      password: state.password
    })

    show({
      title: 'Signing you in...',
      subtitle: 'Preparing your dashboard',
      hint: 'Loading your workspace'
    })

    useNotify().success('Welcome to Skultem')

    await userStore.me()
    initializeActiveRole()
    setAuthResolved(true)

    await navigateTo('/')
  } catch (err: any) {
    loading.value = false
    setAuthResolved(true)
    hide()
    useNotify().error(err.message)
  }
}

definePageMeta({
  layout: 'blank',
  middleware: 'guest'
})

onMounted(() => {
  document.title = 'Login | Skultem'
})
</script>

<style scoped>
.bg-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 44px 44px;
}

.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-size: 150px 150px;
}
</style>
