<template>
  <div class="space-y-3 px-4 md:px-6">
    <Heading title="Data Links"
      subtitle="Tell Skultem what goes in each placeholder of a result slip or statement design: pick the data, type fixed text, or leave it blank." />
    <ExternalExamSectionNav />

    <UAlert v-if="documentService.status.value && !documentService.status.value.enabled" color="warning" variant="soft"
      icon="i-lucide-printer" title="Printing is not set up yet"
      description="Designs come from the document service, which the platform team has not connected yet." />

    <template v-else>
      <div class="flex flex-col gap-2 sm:flex-row">
        <USelect v-model="kind" :items="kinds" class="w-full sm:w-56" aria-label="Document" />
        <USelectMenu v-model="template" :items="designOptions" value-key="value" label-key="label"
          class="w-full sm:w-96" :loading="loadingDesigns" placeholder="Choose a design" aria-label="Design" />
      </div>

      <UCard v-if="template">
        <DocumentDesignFieldLinker :kind="kind" :template="template" />
      </UCard>
      <UCard v-else-if="!loadingDesigns">
        <p class="py-8 text-center text-sm text-muted">Choose a design on the Print Designs page first.</p>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const documentService = useDocumentService()
const { error: toastError } = useNotify()

const kinds = [
  { label: 'Result slip', value: 'exam-result-slip' },
  { label: 'Statement of result', value: 'exam-statement' }
]
const kind = ref<DocumentDesignKind>(route.query.kind === 'exam-statement' ? 'exam-statement' : 'exam-result-slip')
const template = ref<string | undefined>(typeof route.query.template === 'string' ? route.query.template : undefined)
const designOptions = ref<{ label: string, value: string }[]>([])
const loadingDesigns = ref(true)

// The designs for this document, each marked with where it is in use (the general design, or an exam's own).
async function loadDesigns(keepTemplate: boolean) {
  loadingDesigns.value = true
  try {
    const [choice, exams] = await Promise.all([
      DocumentDesignApi().choice(kind.value),
      ExternalExamApi().exams()
    ])
    const usedBy = new Map<string, string[]>()
    const mark = (ref: string | null, by: string) => {
      if (ref) usedBy.set(ref, [...(usedBy.get(ref) ?? []), by])
    }
    mark(choice.current, 'all exams')
    for (const e of exams ?? []) {
      mark(kind.value === 'exam-statement' ? e.statementTemplate : e.slipTemplate, e.code)
    }
    designOptions.value = [...choice.options]
      .sort((a, b) => Number(usedBy.has(b.ref)) - Number(usedBy.has(a.ref)))
      .map(o => ({
        label: usedBy.has(o.ref) ? `${o.name} (in use: ${usedBy.get(o.ref)!.join(', ')})` : o.name,
        value: o.ref
      }))
    if (!keepTemplate || !template.value) template.value = choice.current || undefined
  } catch (err: any) {
    toastError(err.message)
  } finally {
    loadingDesigns.value = false
  }
}

watch(kind, () => loadDesigns(false))
watch([kind, template], ([k, t]) => {
  router.replace({ query: { ...route.query, kind: k, template: t || undefined } })
})

onMounted(() => {
  useAppStore().setTitle('External Exams · Data Links')
  document.title = 'Data Links | External Exams | Skultem'
  documentService.ensureLoaded()
  loadDesigns(true)
})

definePageMeta({
  role: [Role.EXAM_OFFICER, Role.ADMIN, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
})
</script>
