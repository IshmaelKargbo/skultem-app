<template>
  <div class="min-h-screen flex items-center justify-center px-6 py-10 bg-gray-50 dark:bg-[#060f20] relative overflow-hidden">

    <!-- Radial glow - same ambient treatment as the system admin login screen -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

    <div class="relative z-10 w-full max-w-lg">

      <!-- Logo -->
      <div class="flex items-center gap-3 mb-6">
        <div
          class="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 shadow-md border border-gray-200 dark:border-white/10 flex items-center justify-center">
          <img src="/icon.svg" alt="Skultem" class="w-9 h-10" />
        </div>

        <div>
          <h2 class="text-base font-bold text-gray-900 dark:text-white tracking-tight">Skultem</h2>
          <p class="text-[11px] text-gray-400 dark:text-white/30">System Admin Console</p>
        </div>
      </div>

      <!-- Card -->
      <div
        class="rounded-3xl border border-gray-200 dark:border-white/8 bg-white/95 dark:bg-white/3 backdrop-blur-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 p-7">

        <div class="mb-6">
          <h1 class="text-[1.75rem] font-bold tracking-tight text-gray-900 dark:text-white">
            Create the system admin
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-white/40">
            A one-time setup - this only works once, before any system admin account exists yet.
          </p>
        </div>

        <UAlert color="warning" variant="soft" icon="lucide:shield-alert" title="Requires the bootstrap token"
          description="Whoever deployed this instance set SYSTEM_ADMIN_BOOTSTRAP_TOKEN as an environment variable - ask them for it if you don't have it. Without it, or once a system admin already exists, this form is refused."
          class="mb-5" />

        <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">

          <UFormField name="token" label="Bootstrap Token" :ui="{
            label: 'text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 dark:text-white/30 mb-1.5'
          }">
            <UInput v-model="state.token" :type="showToken ? 'text' : 'password'" size="lg" placeholder="••••••••••••"
              icon="lucide:key-round" class="w-full" :ui="{ base: 'w-full rounded-xl' }">
              <template #trailing>
                <UButton variant="ghost" size="xs" tabindex="-1"
                  :icon="showToken ? 'iconamoon:eye-off-light' : 'iconamoon:eye-light'"
                  @click="showToken = !showToken" />
              </template>
            </UInput>
          </UFormField>

          <UFormField name="domain" label="School Domain" :ui="{
            label: 'text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 dark:text-white/30 mb-1.5'
          }">
            <UInput v-model="state.domain" size="lg" placeholder="e.g. moriba" icon="lucide:building"
              class="w-full" :ui="{ base: 'w-full rounded-xl' }" />
            <template #help>
              <p class="text-xs text-gray-400 dark:text-white/30">
                An existing school this account logs in through - system admin access itself isn't scoped to it.
              </p>
            </template>
          </UFormField>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField name="givenNames" label="Given Names" :ui="{
              label: 'text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 dark:text-white/30 mb-1.5'
            }">
              <UInput v-model="state.givenNames" size="lg" placeholder="Aminata" class="w-full"
                :ui="{ base: 'w-full rounded-xl' }" />
            </UFormField>

            <UFormField name="familyName" label="Family Name" :ui="{
              label: 'text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 dark:text-white/30 mb-1.5'
            }">
              <UInput v-model="state.familyName" size="lg" placeholder="Kamara" class="w-full"
                :ui="{ base: 'w-full rounded-xl' }" />
            </UFormField>
          </div>

          <UFormField name="email" label="Email Address" :ui="{
            label: 'text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 dark:text-white/30 mb-1.5'
          }">
            <UInput v-model="state.email" type="email" size="lg" placeholder="you@skultem.com" icon="lucide:mail"
              class="w-full" :ui="{ base: 'w-full rounded-xl' }" />
          </UFormField>

          <UFormField name="password" label="Password" :ui="{
            label: 'text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 dark:text-white/30 mb-1.5'
          }">
            <UInput v-model="state.password" :type="showPassword ? 'text' : 'password'" size="lg"
              placeholder="At least 8 characters" icon="lucide:lock" class="w-full"
              :ui="{ base: 'w-full rounded-xl' }">
              <template #trailing>
                <UButton variant="ghost" size="xs" tabindex="-1"
                  :icon="showPassword ? 'iconamoon:eye-off-light' : 'iconamoon:eye-light'"
                  @click="showPassword = !showPassword" />
              </template>
            </UInput>
          </UFormField>

          <UButton type="submit" size="lg" :loading="loading" block
            class="rounded-xl font-semibold shadow-lg shadow-primary/20 tracking-wide mt-1">
            Create System Admin
          </UButton>

        </UForm>

        <p class="mt-5 text-center text-xs text-gray-400 dark:text-white/25">
          Already set up? <NuxtLink to="/login" class="font-medium text-primary hover:underline">Sign in
            instead</NuxtLink>
        </p>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const state = reactive({
  token: '',
  domain: '',
  givenNames: '',
  familyName: '',
  email: '',
  password: ''
})

const showToken = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const formRef = ref()

const schema = yup.object({
  token: yup.string().required('Bootstrap token is required'),
  domain: yup.string().required('School domain is required'),
  givenNames: yup.string().required('Given names are required'),
  familyName: yup.string().required('Family name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required')
})

async function onSubmit() {
  loading.value = true
  try {
    await SystemApi().bootstrap({ ...state })
    useNotify().success('System admin created - sign in to continue.')
    await navigateTo('/login')
  } catch (err: any) {
    useNotify().error(err?.message || 'Unable to create the system admin.')
  } finally {
    loading.value = false
  }
}

definePageMeta({
  layout: 'blank'
})

onMounted(() => {
  document.title = 'System Admin Setup | Skultem'
})
</script>
