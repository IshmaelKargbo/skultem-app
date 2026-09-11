<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  uploaded: []
}>()

const open = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})

const store = useSchemeOfWorkStore()
const classStore = useClassSessionStore()
const subjectStore = useSubjectStore()
const academicYearStore = useAcademicYearStore()
const { success: toastSuccess, warning: toastWarning, error: toastError } = useNotify()

const fileInput = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)
const uploading = ref(false)
const result = ref<BulkSchemeOfWorkResult | null>(null)

const failedOrSkippedRows = computed(() =>
  (result.value?.rows || []).filter(r => r.outcome !== 'CREATED')
)

function triggerFilePick() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const picked = (event.target as HTMLInputElement).files?.[0]
  if (picked) file.value = picked
}

function removeFile() {
  file.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function csvEscape(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

// A template seeded with real data rather than a blank/placeholder file: real class name(s), the
// first subject, and the active term, repeated across a few example week rows - showing both the
// exact class-name format BulkCreateSchemeOfWorkUseCase expects (bare class name where it's
// unambiguous, the full "Class Section Stream" name otherwise) and how multiple weeks of the same
// scheme repeat those three columns. Capped to two example classes (picking one with an ambiguous
// bare name too, if there is one) so the file stays a short pattern to copy, not every class.
function downloadTemplate() {
  const sessions = classStore.records
  const subjectName = subjectStore.records[0]?.name
  const term = academicYearStore.terms.find(t => t.status === 'ACTIVE') || academicYearStore.terms[0]

  if (!sessions.length || !subjectName || !term) {
    toastWarning('Classes, subjects and an active term are needed before a template can be generated.')
    return
  }

  // How many sessions share a bare class name - only those need the fuller "Class Section
  // Stream" form to disambiguate (matches BulkCreateSchemeOfWorkUseCase#resolveClass).
  const countByClazz = new Map<string, number>()
  for (const s of sessions) countByClazz.set(s.clazz, (countByClazz.get(s.clazz) || 0) + 1)

  const nameFor = (s: ClassSession) => (countByClazz.get(s.clazz) || 0) > 1
    ? [s.clazz, s.sectionName, s.streamName !== 'N/A' ? s.streamName : ''].filter(Boolean).join(' ')
    : s.clazz

  const example = sessions[0]
  const ambiguousExample = sessions.find(s => (countByClazz.get(s.clazz) || 0) > 1 && s !== example)
  const exampleClasses = [example, ambiguousExample].filter(Boolean) as ClassSession[]

  const exampleWeeks = [
    { topic: 'Introduction to Counting', subTopic: 'Numbers 1-10', objectives: 'Count to 10|Recognise numerals 1-10' },
    { topic: 'Addition', subTopic: 'Adding within 10', objectives: 'Add two single-digit numbers' },
    { topic: 'Subtraction', subTopic: '', objectives: '' }
  ]

  const rows = exampleClasses.flatMap((s) => {
    const className = nameFor(s)
    return exampleWeeks.map((w, i) =>
      [className, subjectName, term.name, String(i + 1), w.topic, w.subTopic, w.objectives].map(csvEscape).join(',')
    )
  })

  const csv = ['class,subject,term,week,topic,subTopic,objectives', ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'scheme-of-work-template.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

async function upload() {
  if (!file.value) {
    toastWarning('Choose a CSV file first')
    return
  }

  uploading.value = true
  result.value = null

  try {
    const res = await store.bulkCreate(file.value)
    result.value = res?.data || null

    if (result.value) {
      if (result.value.created > 0) {
        toastSuccess(res?.message || `Created ${result.value.created} week(s)`)
        emit('uploaded')
      } else if (result.value.failed > 0) {
        toastError(`Nothing was created - ${result.value.failed} row(s) failed`)
      } else {
        toastWarning('Nothing to create - every week already existed')
      }
    }
  } catch (err: any) {
    toastError(err.message)
  } finally {
    uploading.value = false
  }
}

function reset() {
  file.value = null
  result.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function close() {
  open.value = false
}

watch(open, (val) => {
  if (val) {
    if (!classStore.records.length) classStore.fetchAll(0, 0)
    if (!subjectStore.records.length) subjectStore.fetchAll(0, 0)
    if (!academicYearStore.terms.length) academicYearStore.getTerms()
  } else {
    reset()
  }
})
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard :ui="{ body: 'space-y-4' }">
        <template #header>
          <div>
            <h3 class="text-lg font-semibold">
              Bulk Upload Schemes of Work
            </h3>
            <p class="text-xs text-muted mt-1">
              Upload a CSV to create many class/subject/term schemes and their weeks in one go.
            </p>
          </div>
        </template>

        <UAlert
          icon="lucide:info"
          variant="soft"
          color="info"
          title="File format"
          description="Columns: class, subject, term, week, topic, subTopic (optional), objectives (optional). Each row is one week - repeat the same class/subject/term across rows to add more weeks to that scheme (created once, reused). Separate more than one learning objective in the same cell with '|', e.g. 'Count to 10|Recognise numerals 1-10'. Class and subject must match names in Skultem exactly; a class with more than one section or stream needs its full name, e.g. 'SSS 1 A Art'. A week number that already exists for that scheme is skipped, not duplicated."
        />

        <UButton variant="soft" color="neutral" icon="lucide:download" label="Download Template"
          @click="downloadTemplate" />

        <div>
          <div v-if="!file"
            class="flex flex-col items-center gap-2 rounded-xl border border-dashed border-default p-6 text-center cursor-pointer"
            @click="triggerFilePick">
            <UIcon name="lucide:upload-cloud" class="size-6 text-muted" />
            <p class="text-sm text-muted">Click to choose a CSV file</p>
          </div>

          <div v-else class="flex items-center justify-between rounded-xl border border-default px-3.5 py-3">
            <div class="flex min-w-0 items-center gap-2.5">
              <UIcon name="lucide:file-spreadsheet" class="size-5 shrink-0 text-primary" />
              <span class="truncate text-sm font-medium">{{ file.name }}</span>
            </div>
            <UButton variant="ghost" color="error" icon="lucide:x" size="xs" :disabled="uploading"
              @click="removeFile" />
          </div>

          <input ref="fileInput" type="file" accept=".csv,text/csv" class="hidden" @change="onFileChange">
        </div>

        <div v-if="result" class="space-y-3">
          <div class="flex flex-wrap gap-2">
            <UBadge color="success" variant="soft" :label="`${result.created} created`" />
            <UBadge v-if="result.skipped" color="neutral" variant="soft" :label="`${result.skipped} skipped`" />
            <UBadge v-if="result.failed" color="error" variant="soft" :label="`${result.failed} failed`" />
          </div>

          <div v-if="failedOrSkippedRows.length" class="max-h-56 space-y-1.5 overflow-y-auto pr-1">
            <div v-for="row in failedOrSkippedRows" :key="row.row"
              class="rounded-lg border border-default px-3 py-2 text-xs">
              <div class="flex items-center justify-between gap-2">
                <span class="font-medium">
                  Row {{ row.row }} - {{ row.className }} / {{ row.subjectName }} / {{ row.termName }}
                  <template v-if="row.week">- Week {{ row.week }}{{ row.topic ? ` (${row.topic})` : '' }}</template>
                </span>
                <UBadge size="xs" :color="row.outcome === 'FAILED' ? 'error' : 'neutral'" variant="soft" :label="row.outcome" />
              </div>
              <p v-if="row.message" class="mt-1 text-muted">{{ row.message }}</p>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Close" variant="soft" color="neutral" :disabled="uploading" @click="close" />
            <UButton label="Upload" icon="lucide:upload" color="primary" :loading="uploading"
              :disabled="!file" @click="upload" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
