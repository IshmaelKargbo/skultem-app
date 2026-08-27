<template>
  <div class="space-y-6 mt-6 p-4 md:px-6">

    <Heading :title="record?.studentName || 'Report Card'"
      subtitle="Preview, print or download this student's report card.">
      <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" to="/report-cards" class="justify-center">
        Back
      </UButton>

      <UButton icon="i-lucide-printer" variant="outline" color="neutral" class="justify-center" @click="printCard">
        Print
      </UButton>

      <UButton icon="i-lucide-download" color="primary" class="justify-center" :loading="downloading"
        @click="downloadPdf">
        Download PDF
      </UButton>
    </Heading>

    <div v-if="loading" class="flex justify-center py-20">
      <USkeleton class="h-150 w-full max-w-2xl rounded-2xl" />
    </div>

    <template v-else-if="record">
      <div class="grid gap-6 lg:grid-cols-3">

        <!-- Side info -->
        <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <UCard>
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
                <dd class="text-sm font-medium">{{ record.termName }}</dd>
              </div>
              <div class="flex items-center justify-between py-2.5">
                <dt class="text-sm text-muted">Average</dt>
                <dd class="text-sm font-medium">{{ record.average.toFixed(1) }}%</dd>
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

          <UCard v-if="record.settings.showRemarks">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-message-square" class="size-5 text-primary" />
                <h3 class="font-semibold">Class Teacher's Remark</h3>
              </div>
            </template>

            <UTextarea v-model="remarkDraft" :rows="3" placeholder="Add a remark for this student..." class="w-full" />

            <UButton class="mt-3" size="sm" :loading="savingRemark" :disabled="remarkDraft === (record.remark || '')"
              @click="saveRemark">
              Save Remark
            </UButton>
          </UCard>
        </div>

        <!-- Printable preview -->
        <div class="lg:col-span-2">
          <UCard :ui="{ body: 'p-0' }" class="overflow-hidden">
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

                <div v-if="schoolAddressLine || record.school.owner?.email || record.school.owner?.phone"
                  class="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-gray-500">
                  <span v-if="schoolAddressLine">{{ schoolAddressLine }}</span>
                  <span
                    v-if="schoolAddressLine && (record.school.owner?.email || record.school.owner?.phone)">&middot;</span>
                  <span v-if="record.school.owner?.email">{{ record.school.owner.email }}</span>
                  <span v-if="record.school.owner?.email && record.school.owner?.phone">&middot;</span>
                  <span v-if="record.school.owner?.phone">{{ record.school.owner.phone }}</span>
                </div>
              </div>

              <!-- Student -->
              <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                <div class="space-y-1.5">
                  <div class="flex justify-between gap-3 border-b border-dashed border-gray-200 pb-1.5">
                    <span class="text-gray-500">Name</span>
                    <span class="font-medium">{{ record.studentName }}</span>
                  </div>
                  <div class="flex justify-between gap-3 border-b border-dashed border-gray-200 pb-1.5">
                    <span class="text-gray-500">Admission No.</span>
                    <span class="font-medium">{{ record.admissionNumber || '—' }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-gray-500">Class</span>
                    <span class="font-medium">{{ record.className }}</span>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <div class="flex justify-between gap-3 border-b border-dashed border-gray-200 pb-1.5">
                    <span class="text-gray-500">Term</span>
                    <span class="font-medium">{{ record.termName }}</span>
                  </div>
                  <div class="flex justify-between gap-3 border-b border-dashed border-gray-200 pb-1.5">
                    <span class="text-gray-500">Session</span>
                    <span class="font-medium">{{ record.academicYearName }}</span>
                  </div>
                  <div v-if="record.settings.showPosition" class="flex justify-between gap-3">
                    <span class="text-gray-500">Position</span>
                    <span class="font-medium">{{ record.position ? ordinal(record.position) : '—' }}</span>
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
                      <th class="border border-gray-200 p-2.5 text-center font-semibold">Total</th>
                      <th class="border border-gray-200 p-2.5 text-center font-semibold">Grade</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="subject in record.subjects" :key="subject.subject">
                      <td class="border border-gray-200 p-2.5">{{ subject.subject }}</td>
                      <td v-for="col in assessmentColumns" :key="col" class="border border-gray-200 p-2.5 text-center">
                        {{subject.assessments?.find(a => a.name === col)?.score ?? '—'}}
                      </td>
                      <td class="border border-gray-200 p-2.5 text-center font-semibold">{{ subject.score }}</td>
                      <td class="border border-gray-200 p-2.5 text-center font-bold"
                        :style="{ color: gradeColor(subject.grade) }">
                        {{ subject.grade || 'N/A' }}
                      </td>
                    </tr>
                  </tbody>

                  <tfoot>
                    <tr class="bg-gray-50">
                      <td class="border border-gray-200 p-2.5 font-semibold" :colspan="1 + assessmentColumns.length">
                        Overall Average
                      </td>
                      <td class="border border-gray-200 p-2.5 text-center font-semibold" colspan="2">
                        {{ record.average.toFixed(1) }}%
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
              <div v-if="record.settings.showRemarks && record.remark" class="mt-7 rounded-lg bg-gray-50 p-4">
                <h3 class="text-sm font-semibold">Class Teacher's Remark</h3>
                <p class="mt-1.5 text-sm text-gray-600">{{ record.remark }}</p>
              </div>

              <!-- Footer note -->
              <p v-if="record.settings.footerNote" class="mt-6 text-center text-[11px] text-gray-400">
                {{ record.settings.footerNote }}
              </p>

              <p class="mt-2 text-center text-[9px] uppercase tracking-widest text-gray-300">
                Powered by Skultem
              </p>

              <!-- Signatures -->
              <div v-if="record.settings.showSignatures" class="mt-12 grid grid-cols-2 gap-6 text-center">
                <div>
                  <img v-if="signatureSrc" :src="signatureSrc" class="mx-auto h-10 object-contain"
                    alt="Principal's signature">
                  <div class="h-5 border-b border-gray-400" />
                  <p class="text-xs mt-2 text-gray-500">Class Teacher</p>
                </div>

                <div>
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
const route = useRoute()
const appStore = useAppStore()
const { success, error: toastError } = useNotify()
const store = useReportCardStore()
const { $generatePdf } = useNuxtApp()

const id = computed(() => String(route.params.id))
const record = ref<ReportCardDetail>()
const loading = ref(true)
const downloading = ref(false)
const remarkDraft = ref('')
const savingRemark = ref(false)

const brandingAssets = ref<{ logo: string | null, principalSignature: string | null }>()
const logoSrc = computed(() =>
  brandingAssets.value?.logo || record.value?.settings.logoUrl || record.value?.school.logo || '')
const signatureSrc = computed(() =>
  brandingAssets.value?.principalSignature || record.value?.school.principalSignature || '')

const schoolAddressLine = computed(() => {
  const address = record.value?.school.address
  if (!address) return ''
  return [address.street, address.city, address.chiefdom, address.district, address.region]
    .filter(part => part && part.trim())
    .join(', ')
})

const assessmentColumns = computed(() => {
  if (!record.value) return []

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
      brandingAssets.value = await SchoolApi().getBrandingAssets()
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
  appStore.setTitle('Report Card')
  await fetchRecord()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
