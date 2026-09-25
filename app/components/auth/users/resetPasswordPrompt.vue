<script setup lang="ts">
const props = defineProps<{
  open: boolean
  userId: string
  userName: string
  // What they type in the login box alongside the password, e.g. a guardian's phone number -
  // shown with the temporary password so the admin can pass both on.
  signInWith?: string
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  changed: [User]
}>()

const open = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})

const store = useUserStore()
const { success: toastSuccess, error: toastError } = useNotify()
const loading = ref(false)
const temporaryPassword = ref<string | null>(null)

// Reset back to the confirmation step whenever the modal is reopened for a (possibly
// different) user, rather than showing the previous person's leftover temp password.
watch(open, (v) => {
  if (v) temporaryPassword.value = null
})

function close() {
  open.value = false
}

async function confirm() {
  loading.value = true
  try {
    const res = await store.adminResetPassword(props.userId)
    if (res) {
      temporaryPassword.value = res.temporaryPassword
      emit('changed', res.user)
    }
  } catch (err: any) {
    toastError(err.message)
  } finally {
    loading.value = false
  }
}

async function copy() {
  if (!temporaryPassword.value) return
  try {
    await navigator.clipboard.writeText(temporaryPassword.value)
    toastSuccess('Temporary password copied to clipboard.')
  } catch {
    toastError('Could not copy - please copy it manually.')
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            Reset Password
          </h3>
        </template>

        <template v-if="!temporaryPassword">
          <UAlert
            color="warning"
            variant="soft"
            :title="`Reset password for ${userName}?`"
            description="A new temporary password is generated and their current one stops working immediately. Share it with them directly - they'll use it to log in and set their own password."
          />
        </template>

        <template v-else>
          <UAlert
            color="success"
            variant="soft"
            :title="`Password reset for ${userName}`"
            description="Share this temporary password with them yourself (call, chat, in person). It's shown only once and they'll be asked to set their own password the moment they log in with it."
          />

          <div class="mt-4 flex items-center gap-2">
            <UInput :model-value="temporaryPassword" readonly class="flex-1 font-mono" />
            <UButton icon="lucide:copy" color="neutral" variant="soft" @click="copy" />
          </div>
          <p v-if="signInWith" class="mt-3 text-sm text-toned">
            They sign in with <span class="font-semibold text-highlighted">{{ signInWith }}</span> and this password.
          </p>
        </template>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton v-if="!temporaryPassword" label="Cancel" variant="soft" color="neutral" :disabled="loading"
              @click="close" />
            <UButton v-if="!temporaryPassword" label="Reset Password" color="warning" icon="lucide:key-round"
              :loading="loading" @click="confirm" />
            <UButton v-else label="Done" color="primary" @click="close" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
