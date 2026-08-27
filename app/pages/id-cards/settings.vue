<template>
  <div class="space-y-4 px-4 md:px-6">
    <!-- Nuxt auto-imports this as IdCardsIDCardSettings (directory-prefixed) —
         use that name directly rather than an explicit import, which "remove
         unused import" tooling keeps stripping since it looks redundant. -->
    <IdCardsIDCardSettings
      v-model="open"
      :settings="uiSettings"
      :active-fields="store.fields"
      :default-settings="uiSettings"
      @update:settings="updateSettings"
      @update:active-fields="updateFields"
      @save="save"
      @close="onClose"
    />
  </div>
</template>

<script setup lang="ts">
// Do NOT add `import IDCardSettings from '.../IDCardSettings.vue'` here — see
// the template comment. Nuxt registers this component globally already; the
// bare `IDCardSettings` tag name just isn't it (see IdCardsIDCardSettings).
const router = useRouter()
const { success, error: toastError } = useNotify()
const store = useIdCardStore()

const open = ref(true)

const uiSettings = reactive({ ...store.settings, preset: 'modern' })

watch(() => store.settings, (val) => Object.assign(uiSettings, val), { deep: true })

function updateSettings(newSettings: typeof uiSettings) {
  Object.assign(uiSettings, newSettings)
  Object.assign(store.settings, newSettings)
}

function updateFields(newFields: any[]) {
  store.fields = newFields
}

async function save() {
  try {
    await store.save()
    success('Settings saved')
    router.push('/id-cards')
  } catch (err: any) {
    toastError(err?.message || 'Failed to save settings')
  }
}

function onClose() {
  router.push('/id-cards')
}

onMounted(async () => {
  useAppStore().setTitle('ID Card Settings')
  await store.fetch()
  Object.assign(uiSettings, store.settings)
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
