<script setup lang="ts">
const emit = defineEmits<{
  live: []
}>()

const { success, error: toastError } = useNotify()
const { can } = useAuth()
const { school, setSchool, currentDomain } = useSchoolInfo()
const { setCachedSchool } = useSchoolCache()

const summary = ref<PlaygroundSummary>()
const loading = ref(true)
const submitting = ref(false)
// Shown in place of the panel - a failed load used to leave the card silently empty.
const loadError = ref('')

// Owner, proprietor or super admin (roleAllows lets SUPER_ADMIN through any owner-level gate) -
// a plain admin sees what's there but can't take the school live.
const canGoLive = computed(() => can([Role.OWNER, Role.PROPRIETOR]))

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    summary.value = await PlaygroundApi().getSummary()
    if (!summary.value) loadError.value = 'The server returned no playground data.'
  } catch (err: any) {
    loadError.value = err?.message || 'Unable to load playground data'
  } finally {
    loading.value = false
  }
}

async function goLive(payload: GoLivePayload) {
  submitting.value = true
  try {
    const updated = await PlaygroundApi().goLive(payload)
    if (!updated) return

    // Drop the banner straight away rather than waiting for the next branding refresh.
    if (school.value) {
      const entry = { ...school.value, testSchool: false }
      setSchool(entry)
      const domain = currentDomain()
      if (domain) setCachedSchool(domain, entry)
    }

    success(payload.categories.length ? 'Test data cleared - your school is now live' : 'Your school is now live')
    emit('live')
  } catch (err: any) {
    toastError(err?.message || 'Unable to take the school live')
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-start gap-3">
        <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
          <UIcon name="i-lucide-flask-conical" class="size-5" />
        </div>
        <div>
          <p class="font-semibold text-highlighted">Playground</p>
          <p class="text-sm text-muted">
            Your school is in playground mode, so you can try every feature without worrying about the records you
            create. When you're ready, choose what to clear and go live.
          </p>
        </div>
      </div>
    </template>

    <div v-if="loading" class="grid grid-cols-1 gap-2 md:grid-cols-2">
      <USkeleton v-for="i in 6" :key="i" class="h-24 w-full rounded-xl" />
    </div>

    <UAlert v-else-if="loadError" color="error" variant="subtle" icon="i-lucide-circle-alert"
      title="Couldn't load your playground data" :description="loadError"
      :actions="[{ label: 'Retry', icon: 'i-lucide-refresh-cw', color: 'error', variant: 'outline', onClick: load }]" />

    <UAlert v-else-if="summary && !summary.testSchool" color="success" variant="subtle" icon="i-lucide-circle-check"
      title="This school is live" description="Playground mode is off." />

    <PlaygroundGoLivePanel v-else-if="summary" :summary="summary" :submitting="submitting" :readonly="!canGoLive"
      @submit="goLive" />
  </UCard>
</template>
