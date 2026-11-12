<template>
  <div class="space-y-3 px-4 md:px-6">

    <Heading :title="record?.studentName || 'Report Card'"
      subtitle="View, print or download this student's report card, in your school's report card design.">
      <UButton v-if="record" icon="i-lucide-printer" variant="outline" color="neutral" class="justify-center"
        :disabled="!printing" @click="printOpen = true">
        Print
      </UButton>
      <UButton v-if="record" data-guide="rc-download" icon="i-lucide-download" color="primary" class="justify-center"
        :loading="downloading" :disabled="!printing" @click="downloadPdf">
        Download PDF
      </UButton>
    </Heading>

    <DocumentPdfViewer v-if="record" v-model:open="printOpen" :title="`${record.studentName} - report card`"
      description="Exactly as it prints, in your school's report card design."
      :fetcher="() => ReportCardApi().pdfBlob(record!.id, sanitizeFilename(record!.studentName))"
      @printed="countDownload" @saved="countDownload" />

    <GuideBar :key="guideTopic" :topic="guideTopic" />
    <div v-if="loading" class="flex justify-center py-20">
      <USkeleton class="h-150 w-full max-w-2xl rounded-2xl" />
    </div>

    <template v-else-if="record">
      <div class="grid gap-6 lg:grid-cols-3">

        <!-- Side info -->
        <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <UCard data-guide="rc-summary">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-info" class="size-5 text-primary" />
                <h3 class="font-semibold">Summary</h3>
              </div>
            </template>

            <dl class="divide-y divide-default">
              <div class="flex items-center justify-between py-2.5">
                <dt class="text-sm text-muted">Admission No.</dt>
                <dd class="text-sm font-medium">{{ record.admissionNumber || '—' }}</dd>
              </div>
              <div class="flex items-center justify-between py-2.5">
                <dt class="text-sm text-muted">Class</dt>
                <dd class="text-sm font-medium">{{ record.className }}</dd>
              </div>
              <div class="flex items-center justify-between py-2.5">
                <dt class="text-sm text-muted">Term</dt>
                <dd class="text-sm font-medium">{{ record.termName }}<span v-if="record.scopeLabel" class="block text-xs text-primary">{{ record.scopeLabel }}</span></dd>
              </div>
              <div class="flex items-center justify-between py-2.5">
                <dt class="text-sm text-muted">Average</dt>
                <dd class="text-sm font-medium">{{ formatScore(record.average) }}%</dd>
              </div>
              <div class="flex items-center justify-between py-2.5">
                <dt class="text-sm text-muted">Position</dt>
                <dd class="text-sm font-medium">{{ record.position ? ordinal(record.position) : '—' }}</dd>
              </div>
              <div class="flex items-center justify-between py-2.5">
                <dt class="text-sm text-muted">Attendance</dt>
                <dd class="text-sm font-medium">
                  {{ record.attendancePercentage != null ? `${record.attendancePercentage}%` : '—' }}
                </dd>
              </div>
            </dl>
          </UCard>

          <!-- Where this card stands in the review step (staff only - parents only ever see approved cards). -->
          <UAlert data-guide="rc-review" v-if="!can(Role.PARENT) && record.reviewStatus && record.reviewStatus !== 'APPROVED'"
            :color="REPORT_CARD_REVIEW[record.reviewStatus].color" variant="subtle"
            :icon="REPORT_CARD_REVIEW[record.reviewStatus].icon" :title="REPORT_CARD_REVIEW[record.reviewStatus].label"
            :description="record.reviewStatus === 'RETURNED'
              ? `${record.reviewedByName || 'The class teacher'}: ${record.reviewNote || 'Sent back for changes.'}`
              : canComment
                ? 'Add your comment below, then approve the class\'s cards on the Report Cards page.'
                : 'Parents will see this card once the class teacher approves it.'" />
          <UAlert v-else-if="!can(Role.PARENT) && record.reviewStatus === 'APPROVED' && record.reviewedByName"
            color="success" variant="subtle" icon="i-lucide-circle-check"
            :title="`Approved by ${record.reviewedByName}`" description="Final - parents can see and download it." />

          <UCard data-guide="rc-remark" v-if="canComment">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-message-square" class="size-5 text-primary" />
                <h3 class="font-semibold">Class Teacher's Remark</h3>
              </div>
            </template>

            <!-- Picked from the school's score ranges; the class master's own remark goes under it. -->
            <div v-if="record.gradeRemark" class="mb-3 rounded-lg bg-muted/40 p-3">
              <p class="text-xs font-medium uppercase tracking-wide text-muted">Automatic remark ({{ formatScore(record.average) }}%)</p>
              <p class="mt-1 text-sm">{{ record.gradeRemark }}</p>
            </div>

            <UFormField :label="record.gradeRemark ? 'Additional remark (optional)' : undefined">
              <UTextarea v-model="remarkDraft" :rows="3"
                :placeholder="record.gradeRemark ? 'Add your own comment on top of the automatic remark...' : 'Add a remark for this student...'"
                class="w-full" />
            </UFormField>

            <UButton class="mt-3" size="sm" :loading="savingRemark" :disabled="remarkDraft === (record.remark || '')"
              @click="saveRemark">
              Save Remark
            </UButton>
          </UCard>

          <!-- Read-only for a parent, for other staff, and once the card is approved. -->
          <UCard data-guide="rc-remark" v-else-if="record.remark || record.gradeRemark">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-message-square" class="size-5 text-primary" />
                <h3 class="font-semibold">Class Teacher's Remark</h3>
              </div>
            </template>

            <p v-if="record.gradeRemark" class="text-sm text-muted">{{ record.gradeRemark }}</p>
            <p v-if="record.remark" class="text-sm text-muted" :class="{ 'mt-2': record.gradeRemark }">{{ record.remark }}</p>
          </UCard>
        </div>

        <!-- The card as it prints: the PDF the document service (M-Compose) makes, in the school's design. -->
        <div class="lg:col-span-2">
          <UCard data-guide="rc-preview" :ui="{ body: 'p-0' }" class="overflow-hidden">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-eye" class="size-5 text-primary" />
                <h3 class="font-semibold">Report card</h3>
                <UBadge v-if="printing" size="sm" variant="subtle" color="neutral" label="As it prints" />
              </div>
            </template>

            <div v-if="documentService.status.value === null" class="p-6">
              <USkeleton class="h-[70vh] w-full rounded-lg" />
            </div>
            <DocumentPdfFrame v-else-if="printing" class="mx-auto max-w-3xl p-3" height="a4"
              caption="Your school's report card design"
              :fetcher="() => ReportCardApi().pdfBlob(record!.id, sanitizeFilename(record!.studentName))"
              @printed="countDownload" @saved="countDownload" />
            <div v-else class="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <UIcon name="i-lucide-printer" class="size-10 text-muted" />
              <h3 class="text-base font-semibold text-highlighted">Report card printing isn't set up yet</h3>
              <p class="max-w-md text-sm text-muted">
                Report cards are printed by the document service. Ask the platform team to connect it - the results
                above are ready as soon as it is.
              </p>
            </div>
          </UCard>
        </div>

      </div>
    </template>

    <UCard v-else>
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <UIcon name="i-lucide-file-x" class="mb-3 size-12 text-muted" />
        <h3 class="text-base font-semibold">Report card not found</h3>
        <p class="mt-1 text-sm text-muted">It may have been removed, or the link is incorrect.</p>
      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
const { formatScore } = useScoreFormat()
const route = useRoute()
const appStore = useAppStore()
const { success, error: toastError } = useNotify()
const store = useReportCardStore()
const { can } = useAuth()
// Parents only ever see an approved card to read and download; staff also review and comment.
const guideTopic = computed(() => (can(Role.PARENT) ? 'parent-report-card' : 'report-card-view'))

// Report cards are printed by the document service (M-Compose): the preview, Print and Download all come from it.
const documentService = useDocumentService()
const printing = computed(() => documentService.reportCards.value)
const printOpen = ref(false)

const id = computed(() => String(route.params.id))
const record = ref<ReportCardDetail>()
const loading = ref(true)
const downloading = ref(false)
const remarkDraft = ref('')

// The class teacher writes the comment, while the card is still under review. (An admin can review a class that
// has no class teacher - the backend checks that.)
const { classOptions: masterClasses, ensureLoaded: ensureClassMasterLoaded } = useClassMaster()
const canComment = computed(() => !!record.value && record.value.reviewStatus !== 'APPROVED'
  && masterClasses.value.some(c => c.value === record.value!.classId))
const savingRemark = ref(false)

function ordinal(n: number) {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || 'th')
}

function sanitizeFilename(value: string) {
  return String(value).replace(/[^a-z0-9-_]/gi, '-')
}

async function fetchRecord() {
  loading.value = true
  try {
    record.value = await store.get(id.value)
    remarkDraft.value = record.value?.remark || ''
  } finally {
    loading.value = false
  }
}

async function saveRemark() {
  if (!record.value) return
  savingRemark.value = true
  try {
    const updated = await store.updateRemark(record.value.id, remarkDraft.value)
    if (updated) record.value = updated
    success('Remark saved')
  } catch (err: any) {
    toastError(err?.message || 'Failed to save remark')
  } finally {
    savingRemark.value = false
  }
}

// Printing or saving the card counts as a download.
async function countDownload() {
  if (!record.value) return
  await store.trackDownload(record.value.id)
  record.value.downloadCount++
}

async function downloadPdf() {
  if (!record.value) return
  downloading.value = true
  try {
    await ReportCardApi().downloadPdf(record.value.id, sanitizeFilename(record.value.studentName))
    await countDownload()
  } catch (err: any) {
    toastError(err?.message || 'The report card could not be downloaded')
  } finally {
    downloading.value = false
  }
}

onMounted(async () => {
  documentService.ensureLoaded()
  ensureClassMasterLoaded({ anyRole: true })
  appStore.setTitle('Report Card')
  appStore.setBack('/report-cards')
  await fetchRecord()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
