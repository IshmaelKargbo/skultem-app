<template>
  <div class="space-y-3 px-4 md:px-6">

    <Heading :title="record?.studentName || 'Report Card'"
      subtitle="Preview, print or download this student's report card.">
      <UButton data-guide="rc-download" icon="i-lucide-download" color="primary" class="justify-center" :loading="downloading"
        @click="downloadPdf">
        Download PDF
      </UButton>
    </Heading>

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
              <div v-if="record.settings.showPosition" class="flex items-center justify-between py-2.5">
                <dt class="text-sm text-muted">Position</dt>
                <dd class="text-sm font-medium">{{ record.position ? ordinal(record.position) : '—' }}</dd>
              </div>
              <div v-if="record.settings.showAttendance" class="flex items-center justify-between py-2.5">
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

          <UCard data-guide="rc-remark" v-if="record.settings.showRemarks && canComment">
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
          <UCard data-guide="rc-remark" v-else-if="record.settings.showRemarks && (record.remark || record.gradeRemark)">
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

        <!-- Printable preview -->
        <div class="lg:col-span-2">
          <UCard data-guide="rc-preview" :ui="{ body: 'p-0' }" class="overflow-hidden">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-eye" class="size-5 text-primary" />
                <h3 class="font-semibold">Preview</h3>
              </div>
            </template>

            <div id="report-card-preview" class="relative isolate overflow-hidden bg-white p-8 sm:p-10 text-gray-900">
              <!-- Watermark - centered on the full page, well behind everything -->
              <img v-if="logoSrc" :src="logoSrc" alt=""
                class="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-112 w-md -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.07] grayscale" />

              <!-- School Header -->
              <div class="-m-8 mb-8 border-b-4 px-8 pb-5 pt-8 text-center sm:-m-10 sm:mb-8 sm:px-10 sm:pt-10"
                :style="{ borderColor: record.settings.headerColor }">
                <img v-if="logoSrc" :src="logoSrc" class="size-36 mx-auto object-contain" alt="School logo">

                <h2 class="text-2xl font-black tracking-wide" :style="{ color: record.settings.headerColor }">
                  {{ record.school.name }}
                </h2>

                <!-- Each part stays on one line (no shrinking): the PDF capture measures text a little wider than the
                     screen, which used to squeeze the address and push its last word onto a line of its own. If a
                     long address really doesn't fit, the email/phone move down whole. -->
                <div v-if="schoolAddressLine || record.school.owner?.email || record.school.owner?.phone"
                  class="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-gray-500">
                  <span v-if="schoolAddressLine" class="shrink-0 whitespace-nowrap">{{ schoolAddressLine }}</span>
                  <span v-if="schoolAddressLine && (record.school.owner?.email || record.school.owner?.phone)"
                    class="shrink-0">&middot;</span>
                  <span v-if="record.school.owner?.email" class="shrink-0 whitespace-nowrap">{{ record.school.owner.email }}</span>
                  <span v-if="record.school.owner?.email && record.school.owner?.phone" class="shrink-0">&middot;</span>
                  <span v-if="record.school.owner?.phone" class="shrink-0 whitespace-nowrap">{{ record.school.owner.phone }}</span>
                </div>
              </div>

              <!-- Student -->
              <div data-pdf-keep class="mt-6 flex items-start gap-4 text-sm">
                <!-- The student's photo (Report Card Design → Student Photo). Initials when there is none. -->
                <div v-if="showStudentPhoto" class="h-28 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <img v-if="studentPhotoSrc" :src="studentPhotoSrc" class="h-full w-full object-cover" :alt="record.studentName">
                  <div v-else class="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">{{ studentInitials }}</div>
                </div>
                <!-- Values stay on one line (the PDF capture measures text wider than the screen, which wrapped names);
                     the name/admission/class column gets the extra room. -->
                <div class="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                  <div class="space-y-1.5">
                    <div class="flex justify-between gap-3 border-b border-dashed border-gray-200 pb-1.5">
                      <span class="shrink-0 text-gray-500">Name</span>
                      <span class="whitespace-nowrap text-right font-medium">{{ record.studentName }}</span>
                    </div>
                    <div class="flex justify-between gap-3 border-b border-dashed border-gray-200 pb-1.5">
                      <span class="shrink-0 text-gray-500">Admission No.</span>
                      <span class="whitespace-nowrap text-right font-medium">{{ record.admissionNumber || '—' }}</span>
                    </div>
                    <div class="flex justify-between gap-3">
                      <span class="shrink-0 text-gray-500">Class</span>
                      <span class="whitespace-nowrap text-right font-medium">{{ record.className }}</span>
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <div class="flex justify-between gap-3 border-b border-dashed border-gray-200 pb-1.5">
                      <span class="shrink-0 text-gray-500">Term</span>
                      <span class="whitespace-nowrap text-right font-medium">{{ record.termName }}<template v-if="record.scopeLabel"> ({{ record.scopeLabel }})</template></span>
                    </div>
                    <div class="flex justify-between gap-3 border-b border-dashed border-gray-200 pb-1.5">
                      <span class="shrink-0 text-gray-500">Session</span>
                      <span class="whitespace-nowrap text-right font-medium">{{ record.academicYearName }}</span>
                    </div>
                    <div v-if="record.settings.showPosition" class="flex justify-between gap-3">
                      <span class="shrink-0 text-gray-500">Position</span>
                      <span class="whitespace-nowrap text-right font-medium">{{ record.position ? ordinal(record.position) : '—' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-7 overflow-x-auto">
                <table class="w-full min-w-max border-collapse text-sm">
                  <thead>
                    <tr class="bg-gray-50">
                      <th class="border border-gray-200 p-2.5 text-left font-semibold">Subject</th>
                      <th v-for="col in assessmentColumns" :key="col"
                        class="border border-gray-200 p-2.5 text-center font-semibold">{{ col }}</th>
                      <th class="border border-gray-200 p-2.5 text-center font-semibold">{{ isYearCard ? 'Final Score' : 'Total' }}</th>
                      <th class="border border-gray-200 p-2.5 text-center font-semibold">Grade</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="subject in record.subjects" :key="subject.subject">
                      <td class="border border-gray-200 p-2.5">{{ subject.subject }}</td>
                      <td v-for="col in assessmentColumns" :key="col" class="border border-gray-200 p-2.5 text-center">
                        {{ cellScore(subject, col) }}
                      </td>
                      <td class="border border-gray-200 p-2.5 text-center font-semibold">{{ formatScore(subject.score) }}</td>
                      <td class="border border-gray-200 p-2.5 text-center font-bold"
                        :style="{ color: gradeColor(subject.grade) }">
                        {{ subject.grade || 'N/A' }}
                      </td>
                    </tr>
                  </tbody>

                  <tfoot>
                    <tr class="bg-gray-50">
                      <td class="border border-gray-200 p-2.5 font-semibold" :colspan="1 + assessmentColumns.length">
                        {{ isYearCard ? 'Final Average (all terms)' : 'Overall Average' }}
                      </td>
                      <td class="border border-gray-200 p-2.5 text-center font-semibold" colspan="2">
                        {{ formatScore(record.average) }}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div v-if="record.settings.showAttendance" class="mt-6 flex items-center gap-2 text-sm">
                <span class="font-semibold">Attendance:</span>
                <span>{{ record.attendancePercentage != null ? `${record.attendancePercentage}%` : 'Not recorded for this term'
                  }}</span>
              </div>

              <!-- Grade Scale -->
              <div v-if="record.settings.showGradeScale && record.school.gradingScale?.length" class="mt-7">
                <h3 class="text-sm font-semibold">Grade Scale</h3>
                <table class="mt-2 w-full border-collapse text-xs">
                  <thead>
                    <tr class="bg-gray-50">
                      <th class="border border-gray-200 p-1.5 text-left font-semibold">Grade</th>
                      <th class="border border-gray-200 p-1.5 text-left font-semibold">Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="band in record.school.gradingScale" :key="band.grade">
                      <td class="border border-gray-200 p-1.5 font-bold" :style="{ color: gradeColor(band.grade) }">{{
                        band.grade }}</td>
                      <td class="border border-gray-200 p-1.5">{{ band.minScore }} - {{ band.maxScore }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Remarks -->
              <div v-if="record.settings.showRemarks && (record.remark || record.gradeRemark)" data-pdf-keep
                class="mt-7 rounded-lg bg-gray-50 p-4">
                <h3 class="text-sm font-semibold">Class Teacher's Remark</h3>
                <p v-if="record.gradeRemark" class="mt-1.5 text-sm text-gray-600">{{ record.gradeRemark }}</p>
                <p v-if="record.remark" class="text-sm text-gray-600" :class="record.gradeRemark ? 'mt-1' : 'mt-1.5'">{{ record.remark }}</p>
              </div>

              <!-- Footer note -->
              <p v-if="record.settings.footerNote" class="mt-6 text-center text-[11px] text-gray-400">
                {{ record.settings.footerNote }}
              </p>

              <p class="mt-2 text-center text-[9px] uppercase tracking-widest text-gray-300">
                Powered by Skultem
              </p>

              <!-- Signatures -->
              <div v-if="showTeacherSignature || showPrincipalSignature" data-pdf-keep class="mt-12 grid gap-6 text-center"
                :class="showTeacherSignature && showPrincipalSignature ? 'grid-cols-2' : 'grid-cols-1 max-w-xs mx-auto'">
                <div v-if="showTeacherSignature">
                  <!-- Signed when the class teacher approved the card (blank until then). -->
                  <img v-if="teacherSignatureSrc" :src="teacherSignatureSrc" class="mx-auto h-10 object-contain"
                    alt="Class teacher's signature">
                  <div v-else class="h-10" />
                  <div class="h-5 border-b border-gray-400" />
                  <p class="text-xs mt-2 text-gray-500">Class Teacher<template v-if="record.classTeacherName"> ({{ record.classTeacherName }})</template></p>
                </div>

                <div v-if="showPrincipalSignature">
                  <img v-if="signatureSrc" :src="signatureSrc" class="mx-auto h-10 object-contain"
                    alt="Principal's signature">
                  <div class="h-5 border-b border-gray-400" />
                  <p class="text-xs mt-2 text-gray-500">Principal ({{ record.school.principalName || '—' }})</p>
                </div>
              </div>

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
const { $generatePdf } = useNuxtApp()
const { can } = useAuth()
// Parents only ever see an approved card to read and download; staff also review and comment.
const guideTopic = computed(() => (can(Role.PARENT) ? 'parent-report-card' : 'report-card-view'))

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

const brandingAssets = ref<{ logo: string | null, principalSignature: string | null }>()
// Warm the print-safe logo/signature as soon as the card is open, so Download PDF doesn't wait on
// the image round trip (and it's already in the browser cache on later visits).
watch(() => record.value?.level, (level) => {
  if (level !== undefined) useBrandingAssets().get({ level }).catch(() => {})
})
const logoSrc = computed(() =>
  brandingAssets.value?.logo || record.value?.school.logo || record.value?.settings.logoUrl || '')
// Older saved settings only have the combined showSignatures - fall back to it for either signatory.
const showTeacherSignature = computed(() => record.value?.settings.showTeacherSignature ?? record.value?.settings.showSignatures ?? false)
const showPrincipalSignature = computed(() => record.value?.settings.showPrincipalSignature ?? record.value?.settings.showSignatures ?? false)

// The class teacher's signature, as a data URI so the PDF capture can draw it (the storage bucket sends no CORS
// headers). Falls back to the plain URL on screen until the conversion lands.
const teacherSignatureData = ref<string | null>(null)
watch(() => record.value?.classTeacherSignature, async (url) => {
  teacherSignatureData.value = null
  if (!url) return
  try {
    teacherSignatureData.value = (await SchoolApi().getAssetDataUri(url)) ?? null
  } catch {
    // The plain URL still shows on screen.
  }
}, { immediate: true })
const teacherSignatureSrc = computed(() => teacherSignatureData.value || record.value?.classTeacherSignature || '')

// The student's photo - also a data URI for the PDF capture, like the signature above.
const showStudentPhoto = computed(() => record.value?.settings.showStudentPhoto ?? true)
const studentPhotoData = ref<string | null>(null)
watch(() => record.value?.photo, async (url) => {
  studentPhotoData.value = null
  if (!url) return
  try {
    studentPhotoData.value = (await SchoolApi().getAssetDataUri(url)) ?? null
  } catch {
    // The plain URL still shows on screen.
  }
}, { immediate: true })
const studentPhotoSrc = computed(() => studentPhotoData.value || record.value?.photo || '')
const studentInitials = computed(() => (record.value?.studentName ?? '')
  .split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join(''))

const signatureSrc = computed(() =>
  brandingAssets.value?.principalSignature || record.value?.school.principalSignature || '')

const schoolAddressLine = computed(() => {
  const address = record.value?.school.address
  if (!address) return ''
  return [address.street, address.city, address.chiefdom, address.district, address.region]
    .filter(part => part && part.trim())
    .join(', ')
})

// A whole-year card: its columns are the terms (each term's score), and "Total" becomes the final score.
const isYearCard = computed(() => !!record.value?.subjects.some(s => s.termScores?.length))

function cellScore(subject: ReportCardSubject, col: string) {
  return isYearCard.value
    ? formatScore(subject.termScores?.find(t => t.term === col)?.score, '—')
    : subject.assessments?.find(a => a.name === col)?.score ?? '—'
}

const assessmentColumns = computed(() => {
  if (!record.value) return []

  if (isYearCard.value) {
    const terms: string[] = []
    for (const subject of record.value.subjects) {
      for (const t of subject.termScores || []) if (!terms.includes(t.term)) terms.push(t.term)
    }
    return terms
  }

  const levelByName = new Map<string, number>()
  for (const subject of record.value.subjects) {
    for (const a of subject.assessments || []) {
      if (!levelByName.has(a.name)) levelByName.set(a.name, a.level ?? Number.MAX_SAFE_INTEGER)
    }
  }

  return [...levelByName.entries()].sort((a, b) => a[1] - b[1]).map(([name]) => name)
})

function ordinal(n: number) {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}

function sanitizeFilename(value: string) {
  return String(value).replace(/[^a-z0-9-_]/gi, '-')
}

function gradeColor(grade: string | null) {
  switch ((grade || '').toUpperCase()) {
    case 'A': return '#16a34a'
    case 'B': return '#2563eb'
    case 'C': return '#d97706'
    case 'D': return '#ea580c'
    case 'F': return '#dc2626'
    default: return '#6b7280'
  }
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

function printCard() {
  window.print()
}

async function downloadPdf() {
  if (!record.value) return
  downloading.value = true
  try {
    if (!brandingAssets.value) {
      brandingAssets.value = await useBrandingAssets().get({ level: record.value.level })
      await nextTick()
    }

    await $generatePdf('#report-card-preview', `report-card-${sanitizeFilename(record.value.studentName)}`)
    await store.trackDownload(record.value.id)
    record.value.downloadCount++
    success('Report card downloaded')
  } catch (err: any) {
    toastError(err?.message || 'Failed to generate PDF')
  } finally {
    downloading.value = false
  }
}

onMounted(async () => {
  if (can(Role.TEACHER)) ensureClassMasterLoaded()
  appStore.setTitle('Report Card')
  appStore.setBack('/report-cards')
  await fetchRecord()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
