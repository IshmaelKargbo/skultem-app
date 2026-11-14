<template>
  <!-- A user's WhatsApp number, so Skully recognises them. Own profile (no userId) or a staff member's page. -->
  <div class="space-y-2">
    <div class="flex items-start gap-3">
      <UIcon name="i-lucide-message-circle" class="mt-0.5 size-4 shrink-0 text-muted" />
      <div class="min-w-0 flex-1">
        <p class="text-xs text-muted">WhatsApp number (Skully)</p>
        <form v-if="editing" class="mt-1 flex flex-wrap items-center gap-2" @submit.prevent="save">
          <UInput v-model="draft" placeholder="e.g. 076 123 456" autocomplete="tel" class="min-w-40 flex-1"
            :aria-label="'WhatsApp number'" />
          <UButton type="submit" size="sm" label="Save" :loading="saving" />
          <UButton size="sm" variant="ghost" color="neutral" label="Cancel" @click="editing = false" />
        </form>
        <div v-else class="mt-0.5 flex flex-wrap items-center gap-2">
          <p class="font-medium text-highlighted">{{ loading ? '…' : (phone ? `+${phone}` : 'Not set') }}</p>
          <UButton v-if="!loading" size="xs" variant="link" :label="phone ? 'Change' : 'Add'" class="px-0" @click="start" />
        </div>
        <p class="mt-1 text-xs text-muted">
          {{ userId ? 'Lets them' : 'Lets you' }} message Skully on WhatsApp about the school - only what
          {{ userId ? 'their' : 'your' }} role can see in Skultem. Leave empty to turn it off.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ userId?: string }>()

const { $api } = useNuxtApp()
const { success, error: toastError } = useNotify()
const path = computed(() => props.userId ? `/user/${encodeURIComponent(props.userId)}/whatsapp` : '/user/me/whatsapp')

const phone = ref<string | null>(null)
const draft = ref('')
const loading = ref(true)
const saving = ref(false)
const editing = ref(false)

function start() {
  draft.value = phone.value ? `+${phone.value}` : ''
  editing.value = true
}

async function load() {
  loading.value = true
  try {
    const res = await $api(path.value) as any
    phone.value = res.data?.phone ?? null
  } catch {
    phone.value = null
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    const res = await $api(path.value, { method: 'PUT', body: { phone: draft.value.trim() } }) as any
    phone.value = res.data?.phone ?? null
    editing.value = false
    success(phone.value ? 'WhatsApp number saved' : 'WhatsApp number removed')
  } catch (err: any) {
    toastError(err?.data?.message || err?.message || 'The number could not be saved')
  } finally {
    saving.value = false
  }
}

watch(() => props.userId, load)
onMounted(load)
</script>
