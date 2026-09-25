<script setup lang="ts">
const classStore = useClassSessionStore()
const { success: toastSuccess, warning: toastWarning, error: toastError } = useNotify()

const fileInput = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)
const checking = ref(false)
const importing = ref(false)
const check = ref<BulkStudentImportResult | null>(null)
const result = ref<BulkStudentImportResult | null>(null)

const shown = computed(() => result.value ?? check.value)
const problemRows = computed(() => (shown.value?.rows || []).filter(r => r.outcome === 'FAILED'))
const goodRows = computed(() => (shown.value?.rows || []).filter(r => r.outcome !== 'FAILED'))
const siblingCount = computed(() => goodRows.value.filter(r => r.existingGuardian).length)

const REQUIRED_COLUMNS = ['First Name', 'Last Name', 'Gender', 'Date of Birth', 'Class', 'Guardian Name', 'Guardian Phone']
const OPTIONAL_COLUMNS = ['Guardian Email', 'Relationship', 'Admission Number', 'Admission Date', 'Enrollment Type',
  'Subjects', 'Nationality', 'Religion', 'City', 'Address', 'Previous School', 'Father Name', 'Father Occupation', 'Father Phone',
  'Mother Name', 'Mother Occupation', 'Mother Phone']

const classNames = computed(() => {
  const countByClazz = new Map<string, number>()
  for (const s of classStore.records) countByClazz.set(s.clazz, (countByClazz.get(s.clazz) || 0) + 1)
  return classStore.records.map(s => (countByClazz.get(s.clazz) || 0) > 1
    ? [s.clazz, s.sectionName, s.streamName !== 'N/A' ? s.streamName : ''].filter(Boolean).join(' ')
    : s.clazz)
})

function csvEscape(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function downloadTemplate() {
  if (!classNames.value.length) {
    toastWarning('Set up your classes first - the template lists them for you.')
    return
  }

  const [first, second] = [classNames.value[0]!, classNames.value[1] ?? classNames.value[0]!]
  const header = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]

  const examples = [
    ['Aminata', 'Koroma', 'Female', '12/03/2012', first, 'Fatmata Koroma', '076123456', '', 'Mother'],
    ['Ibrahim', 'Koroma', 'Male', '01/07/2011', second, 'Fatmata Koroma', '076123456', '', 'Mother'],
    ['Musa', 'Bangura', 'Male', '05/09/2012', first, 'Abu Bangura', '077654321', 'abu@example.com', 'Father']
  ]

  const rows = examples.map(r => [...r, ...Array(header.length - r.length).fill('')].map(csvEscape).join(','))

  const csv = [header.join(','), ...rows].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'students-import-template.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Subjects picked per failed row, to copy into that row's Subjects cell.
const picks = ref<Record<number, string[]>>({})

function isPicked(row: number, subject: string) {
  return picks.value[row]?.includes(subject) ?? false
}

function togglePick(row: number, subject: string) {
  const current = picks.value[row] ?? []
  picks.value[row] = current.includes(subject) ? current.filter(s => s !== subject) : [...current, subject]
}

function pickedCount(row: number, subjects: string[]) {
  return subjects.filter(s => isPicked(row, s)).length
}

function subjectsCell(row: BulkStudentImportRow) {
  // Keep the file's group order so the cell reads the same for every student.
  const order = (row.subjectChoices || []).flatMap(c => c.subjects)
  return order.filter(s => isPicked(row.row, s)).join(' | ')
}

function picksComplete(row: BulkStudentImportRow) {
  return (row.subjectChoices || []).every(c => pickedCount(row.row, c.subjects) >= c.select)
}

async function copySubjects(row: BulkStudentImportRow) {
  try {
    await navigator.clipboard.writeText(subjectsCell(row))
    toastSuccess(`Copied - paste it into the Subjects cell of row ${row.row}`)
  } catch {
    toastError('Could not copy - type the subjects in yourself')
  }
}

function triggerFilePick() {
  fileInput.value?.click()
}

const dragging = ref(false)

async function onDrop(event: DragEvent) {
  dragging.value = false
  const dropped = event.dataTransfer?.files?.[0]
  if (!dropped) return
  if (!/\.csv$/i.test(dropped.name)) {
    toastWarning('Drop a CSV file - save it as CSV from Excel or Google Sheets first.')
    return
  }
  file.value = dropped
  await runCheck()
}

function fileSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function onFileChange(event: Event) {
  const picked = (event.target as HTMLInputElement).files?.[0]
  if (!picked) return
  file.value = picked
  await runCheck()
}

function removeFile() {
  file.value = null
  check.value = null
  result.value = null
  picks.value = {}
  if (fileInput.value) fileInput.value.value = ''
}

async function runCheck() {
  if (!file.value) return
  checking.value = true
  check.value = null
  result.value = null
  try {
    const res = await StudentApi().bulkImport(file.value, true)
    check.value = res?.data ?? null
  } catch (err: any) {
    toastError(err?.message || 'Could not check the file')
  } finally {
    checking.value = false
  }
}

async function runImport() {
  if (!file.value || !check.value?.ready) return
  importing.value = true
  try {
    const res = await StudentApi().bulkImport(file.value, false)
    result.value = res?.data ?? null
    if (result.value?.created) {
      toastSuccess(res?.message || `Imported ${result.value.created} student(s)`)
    } else {
      toastError('No students were imported - see the rows below')
    }
  } catch (err: any) {
    toastError(err?.message || 'Import failed')
  } finally {
    importing.value = false
  }
}

onMounted(() => {
  useAppStore().setTitle('Import Students')
  useAppStore().setBack(true)
  document.title = 'Import Students | Students | Skultem'
  if (!classStore.records.length) classStore.fetchAll(0, 0)
})

definePageMeta({
  role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 pb-10 md:px-6">
    <div class="grid gap-5 lg:grid-cols-5 lg:items-start lg:gap-6">
      <!-- LEFT: how to prepare the file -->
      <aside class="space-y-4 lg:sticky lg:top-5 lg:col-span-2">
        <div class="overflow-hidden rounded-2xl border border-default bg-default shadow-sm">
          <div class="space-y-5 p-5">
            <!-- step 1 -->
            <div class="flex gap-3">
              <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-inverted">1</span>
              <div class="min-w-0 flex-1 space-y-3">
                <div>
                  <p class="text-sm font-semibold text-highlighted">Download the template</p>
                  <p class="mt-0.5 text-xs text-muted">It has every column, plus example rows using your class names.</p>
                </div>
                <UButton block color="primary" variant="soft" icon="i-lucide-download" label="Download template"
                  @click="downloadTemplate" />
              </div>
            </div>

            <!-- step 2 -->
            <div class="flex gap-3">
              <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-inverted">2</span>
              <div class="min-w-0 flex-1 space-y-2">
                <p class="text-sm font-semibold text-highlighted">Fill in your students</p>
                <p class="text-xs text-muted">Only these columns are required:</p>
                <div class="flex flex-wrap gap-1">
                  <UBadge v-for="col in REQUIRED_COLUMNS" :key="col" size="sm" variant="subtle" color="primary"
                    :label="col" />
                </div>
              </div>
            </div>

            <!-- step 3 -->
            <div class="flex gap-3">
              <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-inverted">3</span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-highlighted">Save as CSV and upload</p>
                <p class="mt-0.5 text-xs text-muted">In Excel or Google Sheets: File › Download / Save as › CSV.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- good to know -->
        <div class="space-y-3 rounded-2xl border border-default bg-default p-5 shadow-sm">
          <p class="text-sm font-semibold text-highlighted">Good to know</p>
          <ul class="space-y-2.5 text-xs text-toned">
            <li class="flex gap-2.5">
              <UIcon name="i-lucide-hash" class="mt-0.5 size-4 shrink-0 text-primary" />
              <span>Leave <b class="font-medium text-highlighted">Admission Number</b> blank and one is created for you.</span>
            </li>
            <li class="flex gap-2.5">
              <UIcon name="i-lucide-users" class="mt-0.5 size-4 shrink-0 text-secondary" />
              <span>Siblings are linked automatically when they share the same guardian phone.</span>
            </li>
            <li class="flex gap-2.5">
              <UIcon name="i-lucide-book-open" class="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <b class="font-medium text-highlighted">Subjects</b> is only needed for classes with electives -
                separate them with <code class="rounded bg-elevated px-1 font-mono">|</code>. If a row misses any,
                the check lists the subjects to pick from.
              </span>
            </li>
          </ul>

          <details v-if="classNames.length" class="group border-t border-default pt-3 text-xs">
            <summary class="flex cursor-pointer select-none items-center justify-between font-medium text-toned">
              Class names to use ({{ classNames.length }})
              <UIcon name="i-lucide-chevron-down" class="size-4 transition-transform group-open:rotate-180" />
            </summary>
            <div class="mt-2.5 flex flex-wrap gap-1">
              <UBadge v-for="name in classNames" :key="name" size="sm" variant="outline" color="neutral" :label="name" />
            </div>
          </details>
        </div>
      </aside>

      <!-- RIGHT: upload + results -->
      <section class="min-w-0 space-y-4 lg:col-span-3">
        <!-- upload -->
        <div class="rounded-2xl border border-default bg-default p-4 shadow-sm sm:p-5">
          <div v-if="!file"
            class="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors"
            :class="dragging ? 'border-primary bg-primary/5' : 'border-accented hover:border-primary/60 hover:bg-primary/[0.03]'"
            role="button" tabindex="0" @click="triggerFilePick" @keydown.enter.prevent="triggerFilePick"
            @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @drop.prevent="onDrop">
            <span class="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-secondary/15 text-primary">
              <UIcon name="i-lucide-upload-cloud" class="size-7" />
            </span>
            <div>
              <p class="text-base font-semibold text-highlighted">
                {{ dragging ? 'Drop it here' : 'Drop your CSV here' }}
              </p>
              <p class="mt-1 text-sm text-muted">or <span class="font-medium text-primary">browse your files</span></p>
            </div>
            <p class="text-xs text-dimmed">CSV only · up to 2,000 students per file</p>
          </div>

          <div v-else class="flex items-center gap-3">
            <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UIcon name="i-lucide-file-spreadsheet" class="size-5" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-highlighted">{{ file.name }}</p>
              <p class="text-xs text-muted">
                {{ fileSize(file.size) }}
                <template v-if="checking"> · Checking…</template>
                <template v-else-if="result"> · Imported</template>
                <template v-else-if="check"> · Checked</template>
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-1">
              <UButton v-if="!result" variant="ghost" color="neutral" icon="i-lucide-refresh-cw" size="sm"
                label="Re-check" class="hidden sm:flex" :loading="checking" :disabled="importing" @click="runCheck" />
              <UButton v-if="!result" variant="ghost" color="neutral" icon="i-lucide-refresh-cw" size="sm"
                class="sm:hidden" aria-label="Re-check" :loading="checking" :disabled="importing" @click="runCheck" />
              <UButton variant="ghost" color="error" icon="i-lucide-x" size="sm" aria-label="Remove file"
                :disabled="checking || importing" @click="removeFile" />
            </div>
          </div>
          <input ref="fileInput" type="file" accept=".csv,text/csv" class="hidden" @change="onFileChange">
        </div>

        <!-- checking -->
        <div v-if="checking" class="space-y-3">
          <div class="grid grid-cols-3 gap-3">
            <USkeleton v-for="i in 3" :key="i" class="h-24 rounded-2xl" />
          </div>
          <USkeleton class="h-48 w-full rounded-2xl" />
        </div>

        <!-- nothing yet -->
        <div v-else-if="!shown"
          class="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-default px-6 py-14 text-center">
          <UIcon name="i-lucide-list-checks" class="size-8 text-dimmed" />
          <p class="text-sm font-medium text-toned">Your check results will show here</p>
          <p class="max-w-sm text-xs text-muted">
            Upload a file and we'll list any rows that need fixing - nothing is saved until you press Import.
          </p>
        </div>

        <template v-else>
          <!-- import finished -->
          <div v-if="result?.created"
            class="flex items-center gap-3 rounded-2xl bg-linear-to-r from-success/15 to-secondary/10 p-4 ring-1 ring-success/25">
            <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-success text-inverted">
              <UIcon name="i-lucide-check" class="size-5" />
            </span>
            <div class="min-w-0">
              <p class="font-semibold text-highlighted">{{ result.created }} student{{ result.created === 1 ? '' : 's' }} enrolled</p>
              <p class="text-xs text-toned">
                {{ result.failed ? `${result.failed} row${result.failed === 1 ? '' : 's'} were skipped - see below.` : 'Everything in the file was imported.' }}
              </p>
            </div>
          </div>

          <!-- stats -->
          <div class="grid grid-cols-3 gap-3">
            <div class="rounded-2xl border border-default bg-default p-4 shadow-sm">
              <div class="flex items-center gap-2 text-success">
                <UIcon name="i-lucide-circle-check" class="size-4" />
                <span class="text-xs font-medium">{{ result ? 'Imported' : 'Ready' }}</span>
              </div>
              <p class="mt-2 text-2xl font-semibold text-highlighted md:text-3xl">{{ result ? result.created : shown.ready }}</p>
            </div>
            <div class="rounded-2xl border bg-default p-4 shadow-sm"
              :class="shown.failed ? 'border-error/40' : 'border-default'">
              <div class="flex items-center gap-2" :class="shown.failed ? 'text-error' : 'text-muted'">
                <UIcon name="i-lucide-circle-alert" class="size-4" />
                <span class="text-xs font-medium">{{ result ? 'Failed' : 'To fix' }}</span>
              </div>
              <p class="mt-2 text-2xl font-semibold md:text-3xl" :class="shown.failed ? 'text-error' : 'text-highlighted'">
                {{ shown.failed }}
              </p>
            </div>
            <div class="rounded-2xl border border-default bg-default p-4 shadow-sm">
              <div class="flex items-center gap-2 text-secondary">
                <UIcon name="i-lucide-users" class="size-4" />
                <span class="text-xs font-medium">Siblings</span>
              </div>
              <p class="mt-2 text-2xl font-semibold text-highlighted md:text-3xl">{{ siblingCount }}</p>
            </div>
          </div>

          <!-- rows that need fixing -->
          <div v-if="problemRows.length" class="overflow-hidden rounded-2xl border border-default bg-default shadow-sm">
            <div class="flex items-center justify-between gap-3 border-b border-default px-4 py-3 sm:px-5">
              <div>
                <p class="text-sm font-semibold text-highlighted">
                  {{ result ? 'Not imported' : 'Fix these rows, then re-check' }}
                </p>
                <p class="text-xs text-muted">Row numbers match your spreadsheet.</p>
              </div>
              <UBadge color="error" variant="subtle" :label="`${problemRows.length}`" />
            </div>

            <div class="max-h-[60vh] divide-y divide-default overflow-y-auto">
              <div v-for="row in problemRows" :key="row.row" class="flex gap-3 px-4 py-3 sm:px-5">
                <span class="mt-0.5 flex h-6 min-w-9 shrink-0 items-center justify-center rounded-md bg-error/10 px-1.5 font-mono text-xs font-semibold text-error">
                  {{ row.row }}
                </span>
                <div class="min-w-0 flex-1 space-y-2">
                  <div>
                    <p class="truncate text-sm font-medium text-highlighted">
                      {{ row.name || 'Unnamed row' }}<span v-if="row.className" class="font-normal text-muted"> · {{ row.className }}</span>
                    </p>
                    <p class="mt-0.5 text-xs text-error">{{ row.message }}</p>
                  </div>

                  <!-- Subjects this row's class can choose from -->
                  <div v-if="row.subjectChoices?.length" class="space-y-3 rounded-xl bg-elevated/60 p-3">
                    <div v-for="choice in row.subjectChoices" :key="choice.group" class="space-y-1.5">
                      <div class="flex items-center justify-between gap-2 text-xs">
                        <p class="text-toned">
                          <span class="font-semibold text-highlighted">{{ choice.group }}</span> · pick {{ choice.select }}
                        </p>
                        <span class="font-medium"
                          :class="pickedCount(row.row, choice.subjects) >= choice.select ? 'text-success' : 'text-muted'">
                          {{ pickedCount(row.row, choice.subjects) }}/{{ choice.select }}
                        </span>
                      </div>
                      <div class="flex flex-wrap gap-1.5">
                        <UButton v-for="subject in choice.subjects" :key="subject" size="xs"
                          :variant="isPicked(row.row, subject) ? 'solid' : 'outline'"
                          :color="isPicked(row.row, subject) ? 'primary' : 'neutral'"
                          :icon="isPicked(row.row, subject) ? 'i-lucide-check' : undefined" :label="subject"
                          @click="togglePick(row.row, subject)" />
                      </div>
                    </div>
                    <div v-if="picks[row.row]?.length"
                      class="flex flex-col gap-2 border-t border-default pt-2.5 sm:flex-row sm:items-center sm:justify-between">
                      <p class="min-w-0 text-xs text-muted">
                        Subjects cell:
                        <code class="break-words rounded bg-default px-1.5 py-0.5 font-mono text-highlighted">{{ subjectsCell(row) }}</code>
                      </p>
                      <UButton size="xs" icon="i-lucide-copy" class="shrink-0 self-start sm:self-auto"
                        :variant="picksComplete(row) ? 'solid' : 'soft'" :color="picksComplete(row) ? 'primary' : 'neutral'"
                        label="Copy" @click="copySubjects(row)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- good rows -->
          <div v-if="goodRows.length" class="overflow-hidden rounded-2xl border border-default bg-default shadow-sm">
            <details class="group">
              <summary class="flex cursor-pointer select-none items-center justify-between px-4 py-3 sm:px-5">
                <span class="text-sm font-semibold text-highlighted">
                  {{ result ? 'Imported' : 'Ready to import' }}
                  <span class="font-normal text-muted">({{ goodRows.length }})</span>
                </span>
                <UIcon name="i-lucide-chevron-down" class="size-4 text-muted transition-transform group-open:rotate-180" />
              </summary>
              <div class="max-h-80 divide-y divide-default overflow-y-auto border-t border-default text-xs">
                <div v-for="row in goodRows" :key="row.row" class="flex items-center justify-between gap-2 px-4 py-2 sm:px-5">
                  <span class="flex min-w-0 items-center gap-2">
                    <UIcon name="i-lucide-circle-check" class="size-3.5 shrink-0 text-success" />
                    <span class="truncate text-highlighted">{{ row.name }}</span>
                    <span class="truncate text-muted">· {{ row.className }}</span>
                    <UIcon v-if="row.existingGuardian" name="i-lucide-users" class="size-3.5 shrink-0 text-secondary"
                      title="Linked to an existing guardian" />
                  </span>
                  <span class="shrink-0 font-mono text-muted">{{ row.admissionNumber }}</span>
                </div>
              </div>
            </details>
          </div>
        </template>

        <!-- actions -->
        <div
          class="sticky bottom-0 z-10 -mx-4 flex gap-2 border-t border-default bg-default/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <template v-if="result">
            <UButton label="Import another" variant="outline" color="neutral" icon="i-lucide-file-spreadsheet"
              class="flex-1 justify-center sm:flex-none" @click="removeFile" />
            <UButton label="View students" color="primary" trailing-icon="i-lucide-arrow-right" to="/students"
              class="flex-1 justify-center sm:flex-none" />
          </template>
          <template v-else>
            <UButton label="Cancel" variant="outline" color="neutral" to="/students" :disabled="importing"
              class="flex-1 justify-center sm:flex-none" />
            <UButton icon="i-lucide-user-plus" color="primary" :loading="importing"
              :disabled="checking || !check?.ready" class="flex-[2] justify-center sm:flex-none"
              :label="check?.ready ? `Import ${check.ready} student${check.ready === 1 ? '' : 's'}` : 'Import students'"
              @click="runImport" />
          </template>
        </div>
      </section>
    </div>
  </div>
</template>
