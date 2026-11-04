<template>
  <div v-if="state && state.status !== 'NO_EMAIL'"
    class="flex flex-col gap-3 rounded-xl border border-default bg-elevated/40 p-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="min-w-0 space-y-1">
      <div class="flex flex-wrap items-center gap-2">
        <p class="text-xs text-muted">Email verification</p>
        <EmailVerificationBadge :status="state.status" />
      </div>
      <p class="text-sm text-muted">
        <template v-if="state.status === 'VERIFIED'">
          Verified {{ state.verifiedAt ? formatDateTime(state.verifiedAt) : '' }}.
        </template>
        <template v-else-if="state.status === 'PENDING'">
          We sent a link to <span class="font-medium text-highlighted">{{ state.email }}</span>. It works until
          {{ state.pendingExpiresAt ? formatDateTime(state.pendingExpiresAt) : 'it expires' }}.
        </template>
        <template v-else-if="state.status === 'EXPIRED'">The last link expired. Send a new one.</template>
        <template v-else>Confirm this is your address so the school can reach you reliably.</template>
      </p>
    </div>
    <UButton v-if="state.status !== 'VERIFIED'" size="sm" variant="soft" icon="i-lucide-send" :loading="sending"
      :disabled="cooldown > 0" class="shrink-0 justify-center"
      :label="cooldown > 0 ? `Send again in ${cooldown}s` : state.status === 'PENDING' || state.status === 'EXPIRED' ? 'Resend link' : 'Send verification link'"
      @click="send" />
  </div>
  <USkeleton v-else-if="loading" class="h-16 w-full rounded-xl" />
</template>

<script setup lang="ts">
// The signed-in person's own email verification: where it stands, and sending (or re-sending) the link.
const { success, error: toastError } = useNotify()
const state = ref<EmailVerificationStatus | null>(null)
const loading = ref(true)
const sending = ref(false)

// Seconds until another link can be sent.
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | undefined
const cooldown = computed(() => {
  const at = state.value?.resendAvailableAt
  return at ? Math.max(0, Math.ceil((new Date(at).getTime() - now.value) / 1000)) : 0
})

async function load() {
  loading.value = true
  try {
    state.value = (await EmailVerificationApi().status()) ?? null
  } catch {
    state.value = null
  } finally {
    loading.value = false
  }
}

async function send() {
  sending.value = true
  try {
    const res = await EmailVerificationApi().send()
    if (res) {
      state.value = res
      success(`Verification link sent to ${res.email}. Check your inbox (and spam folder).`)
    }
  } catch (err: any) {
    toastError(err?.message || "Couldn't send the verification email")
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  load()
  ticker = setInterval(() => { now.value = Date.now() }, 1000)
})
onBeforeUnmount(() => clearInterval(ticker))
</script>
