<!-- Change your own password from the profile page. The current password is required, and every other
     device you're signed in on is signed out (this one stays in). -->
<template>
  <UCard>
    <template #header>
      <div>
        <h3 class="text-lg font-semibold">Change Password</h3>
        <p class="text-sm text-muted">You'll stay signed in here. Other phones and computers will be signed out.</p>
      </div>
    </template>

    <UForm ref="formRef" :schema="schema" :state="state" class="grid gap-4 md:grid-cols-2" @submit="onSubmit">
      <UFormField label="Current password" name="currentPassword" required class="md:col-span-2">
        <UInput v-model="state.currentPassword" :type="show.current ? 'text' : 'password'" autocomplete="current-password"
          :disabled="saving" class="w-full md:max-w-sm">
          <template #trailing>
            <UButton :icon="show.current ? 'i-lucide-eye-off' : 'i-lucide-eye'" color="neutral" variant="link" size="sm"
              :aria-label="show.current ? 'Hide password' : 'Show password'" @click="() => { show.current = !show.current }" />
          </template>
        </UInput>
      </UFormField>

      <UFormField label="New password" name="newPassword" required>
        <UInput v-model="state.newPassword" :type="show.next ? 'text' : 'password'" autocomplete="new-password"
          :disabled="saving" class="w-full">
          <template #trailing>
            <UButton :icon="show.next ? 'i-lucide-eye-off' : 'i-lucide-eye'" color="neutral" variant="link" size="sm"
              :aria-label="show.next ? 'Hide password' : 'Show password'" @click="() => { show.next = !show.next }" />
          </template>
        </UInput>
        <template #help>
          <div v-if="state.newPassword" class="mt-1 space-y-1">
            <div class="flex gap-1">
              <span v-for="i in 3" :key="i" class="h-1 flex-1 rounded-full"
                :class="i <= strength ? level.bar : 'bg-elevated'" />
            </div>
            <p class="text-xs" :class="level.text">{{ level.label }}</p>
          </div>
          <span v-else>At least 6 characters. Mix letters, numbers and symbols.</span>
        </template>
      </UFormField>

      <UFormField label="Confirm new password" name="confirmPassword" required>
        <UInput v-model="state.confirmPassword" :type="show.next ? 'text' : 'password'" autocomplete="new-password"
          :disabled="saving" class="w-full" />
      </UFormField>

      <div class="md:col-span-2">
        <UButton type="submit" icon="i-lucide-key-round" label="Change password" :loading="saving" />
      </div>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
import * as yup from 'yup'

type StrengthStyle = { label: string, bar: string, text: string }

const STRENGTH: StrengthStyle[] = [
  { label: 'Too short', bar: 'bg-error', text: 'text-error' },
  { label: 'Weak', bar: 'bg-error', text: 'text-error' },
  { label: 'Fair', bar: 'bg-warning', text: 'text-warning' },
  { label: 'Strong', bar: 'bg-success', text: 'text-success' },
]

const { success, error: toastError } = useNotify()
const formRef = ref<any>(null)
const saving = ref(false)
const show = reactive({ current: false, next: false })
const state = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })

const schema = yup.object({
  currentPassword: yup.string().required('Enter your current password'),
  newPassword: yup.string().required('Enter a new password').min(6, 'At least 6 characters').max(72, 'At most 72 characters')
    .test('different', 'Choose a password different from your current one', (v, ctx) => !v || v !== ctx.parent.currentPassword),
  confirmPassword: yup.string().required('Type the new password again').oneOf([yup.ref('newPassword')], 'The passwords don\'t match'),
})

// 0 too short, then 1-3 for length and variety.
const strength = computed(() => {
  const p = state.newPassword
  if (p.length < 6) return 0
  let s = 1
  if (/[A-Za-z]/.test(p) && /[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p) || p.length >= 10) s++
  return s
})

const level = computed(() => STRENGTH[strength.value] ?? STRENGTH[0]!)

async function onSubmit() {
  saving.value = true
  try {
    const res = await UserApi().changeMyPassword(state.currentPassword, state.newPassword)
    const others = res?.otherSessionsSignedOut ?? 0
    success(others
      ? `Password changed. ${others} other ${others === 1 ? 'device was' : 'devices were'} signed out.`
      : 'Password changed.')
    Object.assign(state, { currentPassword: '', newPassword: '', confirmPassword: '' })
    formRef.value?.clear?.()
  } catch (err: any) {
    toastError(err?.message || 'Could not change your password')
  } finally {
    saving.value = false
  }
}
</script>
