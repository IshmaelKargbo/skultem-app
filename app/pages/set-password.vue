<template>
  <div class="flex min-h-screen items-center justify-center bg-elevated/40 px-4 py-10">
    <UCard class="w-full max-w-md">
      <div v-if="done" class="flex flex-col items-center gap-4 py-6 text-center">
        <div class="flex size-16 items-center justify-center rounded-2xl bg-success/10">
          <UIcon name="i-lucide-badge-check" class="size-8 text-success" />
        </div>
        <div class="space-y-1.5">
          <h1 class="text-xl font-semibold text-highlighted">Password changed</h1>
          <p class="text-sm text-muted">You can sign in with your new password now. Any other devices were signed out.</p>
        </div>
        <UButton to="/login" label="Sign in" class="justify-center" />
      </div>

      <div v-else-if="!token" class="flex flex-col items-center gap-4 py-6 text-center">
        <div class="flex size-16 items-center justify-center rounded-2xl bg-error/10">
          <UIcon name="i-lucide-link-2-off" class="size-8 text-error" />
        </div>
        <div class="space-y-1.5">
          <h1 class="text-xl font-semibold text-highlighted">This link is not valid</h1>
          <p class="text-sm text-muted">It may be incomplete. Copy the whole link from the email, or ask for a new one.</p>
        </div>
        <UButton to="/forgot-password" label="Get a new link" class="justify-center" />
      </div>

      <div v-else class="space-y-5 py-2">
        <div class="space-y-1.5">
          <h1 class="text-xl font-semibold text-highlighted">Set a new password</h1>
          <p class="text-sm text-muted">Choose a password between 6 and 20 characters.</p>
        </div>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="submit">
          <UFormField name="password" label="New password">
            <UInput v-model="state.password" :type="show ? 'text' : 'password'" autocomplete="new-password" size="lg"
              icon="lucide:lock" class="w-full">
              <template #trailing>
                <UButton variant="ghost" size="xs" tabindex="-1"
                  :icon="show ? 'iconamoon:eye-off-light' : 'iconamoon:eye-light'" @click="show = !show" />
              </template>
            </UInput>
          </UFormField>

          <UFormField name="confirm" label="Confirm new password">
            <UInput v-model="state.confirm" :type="show ? 'text' : 'password'" autocomplete="new-password" size="lg"
              icon="lucide:lock" class="w-full" />
          </UFormField>

          <UAlert v-if="failure" color="error" variant="soft" icon="i-lucide-alert-triangle" :description="failure" />

          <UButton type="submit" size="lg" block :loading="loading" label="Change password" />
        </UForm>

        <div class="text-center">
          <UButton to="/forgot-password" variant="link" label="Need a new link?" class="p-0 text-sm" />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'

// Opened from the link in a "forgot password" email. Public - the token in the link is the proof.
const route = useRoute()
const token = computed(() => String(route.query.token ?? '').trim())

const schema = yup.object({
  password: yup.string().min(6, 'At least 6 characters').max(20, 'At most 20 characters').required('Enter a new password'),
  confirm: yup.string().oneOf([yup.ref('password')], "The passwords don't match").required('Confirm your new password')
})

const state = reactive({ password: '', confirm: '' })
const show = ref(false)
const loading = ref(false)
const done = ref(false)
const failure = ref('')

async function submit() {
  loading.value = true
  failure.value = ''
  try {
    await UserApi().confirmPasswordReset(token.value, state.password)
    done.value = true
  } catch (err: any) {
    failure.value = err?.message || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  document.title = 'Set a new password | Skultem'
})

definePageMeta({
  layout: 'blank'
})
</script>
