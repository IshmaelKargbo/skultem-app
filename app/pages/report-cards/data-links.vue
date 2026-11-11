<template>
  <div class="space-y-3 px-4 md:px-6">
    <ReportCardSectionNav />
    <Heading title="Data Links"
      subtitle="Tell Skultem what goes in each placeholder of your report card design: pick the data, type fixed text, or leave it blank.">
      <USelectMenu v-model="template" :items="designOptions" value-key="value" label-key="label" class="w-full sm:w-72"
        :loading="loadingDesigns" placeholder="Choose a design" aria-label="Design" />
    </Heading>

    <UAlert v-if="documentService.status.value && !documentService.status.value.enabled" color="warning" variant="soft"
      icon="i-lucide-printer" title="Printing is not set up yet"
      description="Designs come from the document service, which the platform team has not connected yet." />

    <UCard v-else-if="template">
      <DocumentDesignFieldLinker kind="report-card" :template="template" />
    </UCard>

    <UCard v-else-if="!loadingDesigns">
      <p class="py-8 text-center text-sm text-muted">Choose a print design on the Design page first.</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const documentService = useDocumentService()
const { error: toastError } = useNotify()

const template = ref<string | undefined>(typeof route.query.template === 'string' ? route.query.template : undefined)
const designOptions = ref<{ label: string, value: string }[]>([])
const loadingDesigns = ref(true)

async function loadDesigns() {
  loadingDesigns.value = true
  try {
    const choice = await DocumentDesignApi().choice('report-card')
    designOptions.value = choice.options.map(o => ({
      label: o.ref === choice.current ? `${o.name} (in use)` : o.name,
      value: o.ref
    }))
    if (!template.value) template.value = choice.current || undefined
  } catch (err: any) {
    toastError(err.message)
  } finally {
    loadingDesigns.value = false
  }
}

watch(template, (t) => {
  router.replace({ query: { ...route.query, template: t || undefined } })
})

onMounted(() => {
  useAppStore().setTitle('Report Cards · Data Links')
  document.title = 'Data Links | Report Cards | Skultem'
  documentService.ensureLoaded()
  loadDesigns()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
