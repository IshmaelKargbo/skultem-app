<template>
  <div class="space-y-3 px-4 md:px-6">
    <Heading title="Print Designs"
      subtitle="The layouts result slips and statements of result are printed in: one general design for every exam, and a different one for any exam that needs it." />
    <ExternalExamSectionNav />

    <UAlert v-if="documentService.status.value && !documentService.status.value.enabled" color="warning" variant="soft"
      icon="i-lucide-printer" title="Printing is not set up yet"
      description="The designs come from the document service, which the platform team has not connected yet." />

    <template v-else>
      <!-- General: every exam that has no design of its own -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-layout-template" class="size-5 text-primary" />
            <h3 class="font-semibold text-highlighted">General design - all exams</h3>
          </div>
          <p class="mt-1 text-sm text-muted">Used by every exam below that doesn't have its own design.</p>
        </template>
        <UTabs :items="documentTabs" :unmount-on-hide="false" class="w-full">
          <template #slip>
            <DocumentDesignPicker :key="`general-slip-${generalVersion}`" kind="exam-result-slip" links-page="/external-exams/data-links" class="pt-3"
              @saved="generalVersion++" />
          </template>
          <template #statement>
            <DocumentDesignPicker :key="`general-statement-${generalVersion}`" kind="exam-statement" links-page="/external-exams/data-links" class="pt-3"
              @saved="generalVersion++" />
          </template>
        </UTabs>
      </UCard>

      <!-- Per exam -->
      <UCard>
        <template #header>
          <h3 class="font-semibold text-highlighted">Each exam</h3>
          <p class="mt-1 text-sm text-muted">Give an exam its own design - for example one layout for NPSE and another for BECE.</p>
        </template>

        <div v-if="loading" class="space-y-3"><USkeleton v-for="i in 3" :key="i" class="h-14 w-full" /></div>
        <ul v-else class="divide-y divide-default">
          <li v-for="exam in exams" :key="exam.id" class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0">
              <p class="font-medium text-highlighted">{{ exam.code }} <span class="font-normal text-muted">· {{ exam.name }}</span></p>
              <div class="mt-1 flex flex-wrap gap-1.5">
                <UBadge :color="exam.slipTemplate ? 'primary' : 'neutral'" variant="soft" size="sm"
                  :label="`Result slip: ${exam.slipTemplate ? designName(exam.slipTemplate) : 'general design'}`" />
                <UBadge :color="exam.statementTemplate ? 'primary' : 'neutral'" variant="soft" size="sm"
                  :label="`Statement: ${exam.statementTemplate ? designName(exam.statementTemplate) : 'general design'}`" />
              </div>
            </div>
            <UButton size="sm" variant="soft" icon="i-lucide-palette" :label="`Designs for ${exam.code}`"
              class="justify-center" @click="openExam(exam)" />
          </li>
        </ul>
      </UCard>
    </template>

    <UModal v-model:open="examOpen" :title="editing ? `${editing.code} print designs` : ''"
      description="Pick this exam's own design, or keep using the general one." :ui="{ content: 'sm:max-w-3xl' }">
      <template #body>
        <UTabs v-if="editing" :items="documentTabs" :unmount-on-hide="false" class="w-full">
          <template #slip>
            <DocumentDesignPicker :key="`${editing.id}-slip`" kind="exam-result-slip" :exam-id="editing.id" links-page="/external-exams/data-links"
              default-label="the general design" class="pt-3" @saved="examSaved" />
          </template>
          <template #statement>
            <DocumentDesignPicker :key="`${editing.id}-statement`" kind="exam-statement" :exam-id="editing.id" links-page="/external-exams/data-links"
              default-label="the general design" class="pt-3" @saved="examSaved" />
          </template>
        </UTabs>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { error: toastError } = useNotify()
const documentService = useDocumentService()

const documentTabs = [
  { label: 'Result slip', slot: 'slip' as const },
  { label: 'Statement of result', slot: 'statement' as const }
]

const exams = ref<ExternalExam[]>([])
const loading = ref(true)
const names = ref<Record<string, string>>({})
const generalVersion = ref(0)

// "sample:report-card-classic" -> its name, from the designs the pickers have seen.
function designName(ref: string) {
  return names.value[ref] ?? ref.replace(/^sample:/, '')
}

async function loadNames() {
  try {
    const choice = await DocumentDesignApi().choice('exam-result-slip', true)
    names.value = Object.fromEntries(choice.options.map(o => [o.ref, o.name]))
  } catch {
    // The badges show the design's id instead.
  }
}

async function load() {
  loading.value = true
  try {
    exams.value = await ExternalExamApi().exams() ?? []
  } catch (err: any) {
    toastError(err.message)
  } finally {
    loading.value = false
  }
}

const examOpen = ref(false)
const editing = ref<ExternalExam | null>(null)
function openExam(exam: ExternalExam) {
  editing.value = exam
  examOpen.value = true
}
function examSaved() {
  load()
}

onMounted(() => {
  useAppStore().setTitle('External Exams · Print Designs')
  document.title = 'Print Designs | External Exams | Skultem'
  documentService.ensureLoaded()
  load()
  loadNames()
})

definePageMeta({
  role: [Role.EXAM_OFFICER, Role.ADMIN, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
})
</script>
