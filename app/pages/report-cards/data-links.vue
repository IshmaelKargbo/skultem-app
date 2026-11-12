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

    <!-- The same links for every level, or a level's own (Primary "Head Teacher", JSS "Principal"). -->
    <UTabs v-if="template && levelTabs.length > 1" v-model="levelTab" :items="levelTabs" :content="false" size="sm"
      class="w-full" />
    <UCard v-if="template && documentService.status.value?.enabled !== false" :ui="{ root: 'overflow-visible' }">
      <DocumentDesignFieldLinker kind="report-card" :template="template"
        :level="levelTab === 'ALL' ? null : levelTab" />
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
const { levelOptions, load: loadStructure } = useSchoolStructure()
const levelTab = ref<string>(typeof route.query.level === 'string' ? route.query.level : 'ALL')
const levelTabs = computed(() => [
  { label: 'All levels', value: 'ALL' },
  ...levelOptions.value.map(l => ({ label: l.label, value: l.value }))
])
watch(levelTab, (l) => {
  router.replace({ query: { ...route.query, level: l === 'ALL' ? undefined : l } })
})

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
  loadStructure()
  loadDesigns()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
