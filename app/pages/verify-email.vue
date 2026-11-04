<template>
  <div class="flex min-h-screen items-center justify-center bg-elevated/40 px-4 py-10">
    <UCard class="w-full max-w-md">
      <div class="flex flex-col items-center gap-4 py-6 text-center">
        <div class="flex size-16 items-center justify-center rounded-2xl" :class="view.iconBg">
          <UIcon :name="view.icon" class="size-8" :class="[view.iconColor, { 'animate-spin': state === 'loading' }]" />
        </div>

        <div class="space-y-1.5">
          <h1 class="text-xl font-semibold text-highlighted">{{ view.title }}</h1>
          <p class="text-sm text-muted">
            {{ view.message }}
            <template v-if="result?.email && view.showEmail">
              <br><span class="font-medium text-highlighted">{{ result.email }}</span>
            </template>
          </p>
        </div>

        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <UButton v-if="view.action" :to="view.action.to" :label="view.action.label" class="justify-center" />
          <UButton v-if="state === 'error'" label="Try again" :icon="REFRESH_ICON" variant="soft" class="justify-center"
            @click="confirm" />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
// Opened from the link in a verification email. Public: the person may not be signed in (or may be signed in as
// someone else) - the token in the link is the proof. Each outcome says what to do next.
const route = useRoute()
const { accessToken } = useAuthCookies()

type State = 'loading' | 'error' | EmailVerificationResultState
const state = ref<State>('loading')
const result = ref<EmailVerificationResult | null>(null)
const failure = ref('')

const signedIn = computed(() => !!accessToken.value)
const next = computed(() => signedIn.value ? { to: '/profile', label: 'Go to your profile' } : { to: '/login', label: 'Sign in' })
const resend = computed(() => signedIn.value
  ? { to: '/profile', label: 'Send a new link' }
  : { to: '/login', label: 'Sign in to send a new link' })

const view = computed(() => {
  switch (state.value) {
    case 'loading':
      return { title: 'Verifying your email…', message: 'One moment.', icon: 'i-lucide-loader-circle', iconBg: 'bg-primary/10', iconColor: 'text-primary' }
    case 'VERIFIED':
      return { title: 'Email verified', message: 'Thank you - this address is now confirmed:', showEmail: true, icon: 'i-lucide-badge-check', iconBg: 'bg-success/10', iconColor: 'text-success', action: next.value }
    case 'ALREADY_VERIFIED':
      return { title: 'Already verified', message: 'This link was used before - the address is confirmed:', showEmail: true, icon: 'i-lucide-badge-check', iconBg: 'bg-success/10', iconColor: 'text-success', action: next.value }
    case 'EXPIRED':
      return { title: 'This link has expired', message: 'Verification links only work for a short time. Ask for a new one.', icon: 'i-lucide-clock-alert', iconBg: 'bg-warning/10', iconColor: 'text-warning', action: resend.value }
    case 'SUPERSEDED':
      return { title: 'A newer link was sent', message: 'Only the most recent verification email works. Open the latest one, or ask for a new link.', icon: 'i-lucide-mail-warning', iconBg: 'bg-warning/10', iconColor: 'text-warning', action: resend.value }
    case 'EMAIL_CHANGED':
      return { title: 'The email address changed', message: 'This link was for an address the account no longer uses. Verify the current address instead.', icon: 'i-lucide-mail-warning', iconBg: 'bg-warning/10', iconColor: 'text-warning', action: resend.value }
    case 'error':
      return { title: "Couldn't verify right now", message: failure.value || 'Something went wrong. Please try again.', icon: 'i-lucide-alert-triangle', iconBg: 'bg-error/10', iconColor: 'text-error' }
    default:
      return { title: 'This link is not valid', message: 'It may be incomplete - try copying the whole link from the email, or ask for a new one.', icon: 'i-lucide-link-2-off', iconBg: 'bg-error/10', iconColor: 'text-error', action: resend.value }
  }
})

async function confirm() {
  const token = String(route.query.token ?? '').trim()
  if (!token) {
    state.value = 'INVALID'
    return
  }
  state.value = 'loading'
  try {
    const res = await EmailVerificationApi().confirm(token)
    if (!res) throw new Error('No answer from the server')
    result.value = res
    state.value = res.status
    // Signed in as this person? Their own record now says verified.
    if (res.status === 'VERIFIED' && signedIn.value) useUserStore().me().catch(() => {})
  } catch (err: any) {
    failure.value = err?.message || ''
    state.value = 'error'
  }
}

onMounted(() => {
  document.title = 'Verify email | Skultem'
  confirm()
})

definePageMeta({
  layout: 'blank'
})
</script>
