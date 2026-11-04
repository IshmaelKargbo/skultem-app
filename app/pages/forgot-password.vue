<template>
  <div class="flex min-h-screen items-center justify-center bg-elevated/40 px-4 py-10">
    <UCard class="w-full max-w-md">
      <div v-if="sent" class="flex flex-col items-center gap-4 py-6 text-center">
        <div class="flex size-16 items-center justify-center rounded-2xl bg-success/10">
          <UIcon name="i-lucide-mail-check" class="size-8 text-success" />
        </div>
        <div class="space-y-1.5">
          <h1 class="text-xl font-semibold text-highlighted">Check your email</h1>
          <p class="text-sm text-muted">
            If <span class="font-medium text-highlighted">{{ state.email }}</span> belongs to an account at this school,
            we've sent a link to reset your password. It works for 30 minutes.
          </p>
          <p class="text-xs text-muted">Nothing there? Check your spam or junk folder.</p>
        </div>
        <UButton to="/login" label="Back to sign in" class="justify-center" />
      </div>

      <div v-else class="space-y-5 py-2">
        <div class="space-y-1.5">
          <h1 class="text-xl font-semibold text-highlighted">Forgot your password?</h1>
          <p class="text-sm text-muted">Enter the email on your account and we'll send you a link to set a new one.</p>
        </div>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="submit">
          <UFormField name="email" label="Email address">
            <UInput v-model="state.email" type="email" inputmode="email" autocomplete="email" size="lg"
              placeholder="you@school.edu" icon="lucide:mail" class="w-full" />
          </UFormField>

          <UButton type="submit" size="lg" block :loading="loading" label="Send reset link" />
        </UForm>

        <p class="text-center text-sm text-muted">
          Signed in with a phone number and no email? Ask your school admin to reset it for you.
        </p>

        <div class="text-center">
          <UButton to="/login" variant="link" label="Back to sign in" class="p-0 text-sm" />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'

// "Forgot password" on a school's own site. The page always says the same thing after sending, so it can't be used
// to find out who has an account.
const schema = yup.object({
  email: yup.string().trim().email('Enter a valid email address').required('Email is required')
})

const state = reactive({ email: '' })
const loading = ref(false)
const sent = ref(false)
const { error: toastError } = useNotify()

async function submit() {
  loading.value = true
  try {
    await UserApi().requestPasswordReset(resolveTenantSlug(useRequestURL().hostname) || '', state.email.trim())
    sent.value = true
  } catch (err: any) {
    toastError(err?.message || 'Something went wrong. Please try again.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  document.title = 'Forgot password | Skultem'
})

definePageMeta({
  layout: 'blank',
  middleware: 'guest'
})
</script>
