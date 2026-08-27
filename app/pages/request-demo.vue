<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 font-sans overflow-x-hidden">
    <!-- Ambient glows -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-20 -right-20 w-105 h-105 rounded-full bg-primary/10 blur-[80px]" />
      <div class="absolute -bottom-20 -left-20 w-85 h-85 rounded-full bg-cyan-400/10 blur-[80px]" />
    </div>

    <div class="relative z-10 flex min-h-screen flex-col items-center px-4 py-10 sm:py-16">
      <!-- Logo -->
      <div class="flex items-center gap-3 mb-8">
        <div
          class="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 shadow-md border border-gray-200 dark:border-white/10 flex items-center justify-center">
          <img src="/icon.svg" alt="Skultem" class="w-8 h-9" />
        </div>
        <div>
          <h2 class="text-base font-bold text-gray-900 dark:text-white tracking-tight">Skultem</h2>
          <p class="text-[11px] text-gray-400 dark:text-white/30">School Management Platform</p>
        </div>
      </div>

      <div class="w-full max-w-xl">
        <!-- SUCCESS STATE -->
        <div v-if="submitted"
          class="rounded-3xl border border-gray-200 dark:border-white/8 bg-white/95 dark:bg-white/3 backdrop-blur-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 p-8 text-center">
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <UIcon name="lucide:check-circle-2" class="size-8 text-success" />
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Request received
          </h1>
          <p class="mt-2 text-sm text-gray-500 dark:text-white/40">
            Thanks{{ state.name ? `, ${state.name.split(' ')[0]}` : '' }} - our team will reach out to
            {{ state.email }} shortly to schedule your walkthrough.
          </p>
          <UButton variant="soft" color="neutral" class="mt-6 rounded-xl" @click="reset">
            Submit another request
          </UButton>
        </div>

        <!-- FORM -->
        <div v-else class="space-y-6">
          <div class="text-center">
            <h1 class="text-[1.75rem] font-bold tracking-tight text-gray-900 dark:text-white">
              See Skultem in action
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-white/40">
              Tell us about your school and we'll set up a personal walkthrough.
            </p>
          </div>

          <div
            class="rounded-3xl border border-gray-200 dark:border-white/8 bg-white/95 dark:bg-white/3 backdrop-blur-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 p-7">
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="submit">
              <div class="grid gap-4 sm:grid-cols-2">
                <UFormField name="name" label="Full name" :ui="fieldUi">
                  <UInput v-model="state.name" size="lg" placeholder="Jane Doe" icon="lucide:user" class="w-full" :ui="{ base: 'w-full rounded-xl' }" />
                </UFormField>

                <UFormField name="school" label="School name" :ui="fieldUi">
                  <UInput v-model="state.school" size="lg" placeholder="Bright Future Academy" icon="lucide:school" class="w-full" :ui="{ base: 'w-full rounded-xl' }" />
                </UFormField>

                <UFormField name="email" label="Email address" :ui="fieldUi">
                  <UInput v-model="state.email" type="email" size="lg" placeholder="you@school.edu" icon="lucide:mail" class="w-full" :ui="{ base: 'w-full rounded-xl' }" />
                </UFormField>

                <UFormField name="phone" label="Phone number" :ui="fieldUi">
                  <UInput v-model="state.phone" size="lg" placeholder="+232..." icon="lucide:phone" class="w-full" :ui="{ base: 'w-full rounded-xl' }" />
                </UFormField>

                <UFormField name="city" label="City" :ui="fieldUi">
                  <UInput v-model="state.city" size="lg" placeholder="Freetown" icon="lucide:map-pin" class="w-full" :ui="{ base: 'w-full rounded-xl' }" />
                </UFormField>

                <UFormField name="address" label="School address" :ui="fieldUi">
                  <UInput v-model="state.address" size="lg" placeholder="12 School Road" icon="lucide:map" class="w-full" :ui="{ base: 'w-full rounded-xl' }" />
                </UFormField>

                <UFormField name="preferred" label="Preferred walkthrough" :ui="fieldUi">
                  <USelectMenu v-model="state.preferred" value-key="value" :items="demoWalkthroughFormats" size="lg" placeholder="Select a format" class="w-full" />
                </UFormField>

                <UFormField name="priority" label="What matters most?" :ui="fieldUi">
                  <USelectMenu v-model="state.priority" value-key="value" :items="demoPriorities" size="lg" placeholder="Select a priority" class="w-full" />
                </UFormField>
              </div>

              <UFormField name="message" label="Anything else?" :ui="fieldUi">
                <UTextarea v-model="state.message" :rows="3" autoresize placeholder="Tell us about your school's size, current challenges, or anything you'd like us to prepare for" class="w-full" />
              </UFormField>

              <UButton type="submit" size="lg" :loading="loading" block
                class="rounded-xl font-semibold shadow-lg shadow-primary/20 tracking-wide mt-1">
                Request a demo
              </UButton>
            </UForm>
          </div>
        </div>

        <p class="mt-6 text-center text-xs text-gray-400 dark:text-white/20">
          © {{ new Date().getFullYear() }} Skultem · All rights reserved
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'

definePageMeta({
  layout: 'blank'
})

const { error: toastError } = useNotify()

const loading = ref(false)
const submitted = ref(false)

const fieldUi = {
  label: 'text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 dark:text-white/30 mb-1.5'
}

const state = reactive<CreateRequestDemoPayload>({
  name: '',
  school: '',
  address: '',
  city: '',
  email: '',
  phone: '',
  preferred: '',
  priority: '',
  message: ''
})

const schema = yup.object({
  name: yup.string().min(3, 'Full name must be at least 3 characters').required('Full name is required'),
  school: yup.string().required('School name is required'),
  address: yup.string().min(5, 'Address must be at least 5 characters').required('School address is required'),
  city: yup.string().required('City is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().matches(/^[0-9+]{7,15}$/, 'Enter a valid phone number').required('Phone is required'),
  preferred: yup.string().required('Preferred walkthrough format is required'),
  priority: yup.string().required('This helps us tailor the walkthrough')
})

async function submit() {
  loading.value = true
  try {
    await RequestDemoApi().create({ ...state })
    submitted.value = true
  } catch (err: any) {
    toastError(err?.message || 'Failed to submit your request - please try again')
  } finally {
    loading.value = false
  }
}

function reset() {
  submitted.value = false
  state.name = ''
  state.school = ''
  state.address = ''
  state.city = ''
  state.email = ''
  state.phone = ''
  state.preferred = ''
  state.priority = ''
  state.message = ''
}

onMounted(() => {
  document.title = 'Request a Demo | Skultem'
})
</script>
