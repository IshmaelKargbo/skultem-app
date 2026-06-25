<template>
  <div class="space-y-6 mt-6 md:px-5">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div class="flex items-center gap-4">
        <div class="rounded-2xl bg-primary/10 p-4">
          <UIcon
            name="i-lucide-notebook-tabs"
            class="text-2xl text-primary"
          />
        </div>

        <div>
          <h1 class="text-2xl font-bold tracking-tight lg:text-3xl">
            Create Scheme of Work
          </h1>

          <p class="mt-1 text-sm text-muted">
            Plan topics, objectives and weekly teaching activities.
          </p>
        </div>
      </div>

      <div class="flex gap-3">
        <UButton
          variant="outline"
          color="neutral"
          icon="i-lucide-arrow-left"
          to="/curriculums/scheme-of-work"
          label="Cancel"
        />

        <UButton
          type="submit"
          icon="i-lucide-save"
          label="Save Scheme"
          :loading="isLoading"
          @click="formRef?.submit()"
        />
      </div>

    </div>

    <!-- Statistics -->
    <div class="grid gap-4 sm:grid-cols-3">

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-2xl bg-violet-500/10">
            <UIcon
              name="i-lucide-book-open"
              class="size-6 text-violet-500"
            />
          </div>

          <div>
            <p class="text-sm text-muted">
              Subjects
            </p>

            <h3 class="text-2xl font-bold">
              {{ subjects.length }}
            </h3>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-2xl bg-green-500/10">
            <UIcon
              name="i-lucide-school"
              class="size-6 text-green-500"
            />
          </div>

          <div>
            <p class="text-sm text-muted">
              Classes
            </p>

            <h3 class="text-2xl font-bold">
              {{ classes.length }}
            </h3>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10">
            <UIcon
              name="i-lucide-calendar-days"
              class="size-6 text-blue-500"
            />
          </div>

          <div>
            <p class="text-sm text-muted">
              Weeks
            </p>

            <h3 class="text-2xl font-bold">
              {{ state.weeks }}
            </h3>
          </div>
        </div>
      </UCard>

    </div>

    <UForm
      ref="formRef"
      :state="state"
      :schema="schema"
      class="space-y-6"
      @submit="onSubmit"
    >

      <div class="grid gap-6 xl:grid-cols-3">

        <!-- Left -->
        <div class="space-y-6 xl:col-span-2">

          <!-- Basic Information -->
          <UCard>

            <template #header>
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-book-open"
                  class="text-primary"
                />

                <span class="font-semibold">
                  Basic Information
                </span>
              </div>
            </template>

            <div class="grid gap-5 lg:grid-cols-2">

              <UFormField
                label="Subject"
                name="subjectId"
                required
              >
                <USelectMenu
                  v-model="state.subjectId"
                  :items="subjects"
                  :loading="loadingSubjects"
                  value-key="value"
                  label-key="label"
                  leading-icon="i-lucide-book-open"
                  placeholder="Select subject"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Class"
                name="classId"
                required
              >
                <USelectMenu
                  v-model="state.classId"
                  :items="classes"
                  :loading="loadingClasses"
                  value-key="value"
                  label-key="label"
                  leading-icon="i-lucide-school"
                  placeholder="Select class"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Academic Year"
                name="academicYear"
                required
              >
                <UInput
                  v-model="state.academicYear"
                  leading-icon="i-lucide-calendar"
                  placeholder="2026/2027"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Term"
                name="term"
                required
              >
                <USelectMenu
                  v-model="state.term"
                  :items="terms"
                  value-key="value"
                  label-key="label"
                  leading-icon="i-lucide-calendar-range"
                  placeholder="Select term"
                  class="w-full"
                />
              </UFormField>

            </div>

          </UCard>

          <!-- Schedule -->
          <UCard>

            <template #header>
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-calendar-days"
                  class="text-primary"
                />

                <span class="font-semibold">
                  Schedule Settings
                </span>
              </div>
            </template>

            <div class="grid gap-5 lg:grid-cols-3">

              <UFormField
                label="Weeks"
                name="weeks"
              >
                <UInput
                  v-model.number="state.weeks"
                  type="number"
                  min="1"
                  leading-icon="i-lucide-hash"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Start Date"
                name="startDate"
              >
                <UInput
                  v-model="state.startDate"
                  type="date"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="End Date"
                name="endDate"
              >
                <UInput
                  v-model="state.endDate"
                  type="date"
                  class="w-full"
                />
              </UFormField>

            </div>

            <p v-if="dateRangeInvalid" class="mt-3 flex items-center gap-1.5 text-sm text-error">
              <UIcon name="i-lucide-triangle-alert" class="size-4" />
              End date should be after the start date.
            </p>

          </UCard>

          <!-- Resources -->
          <UCard>

            <template #header>
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-folder-open"
                  class="text-primary"
                />

                <span class="font-semibold">
                  Resources & Notes
                </span>
              </div>
            </template>

            <div class="space-y-5">

              <UFormField
                label="Resources"
                name="resources"
              >
                <UTextarea
                  v-model="state.resources"
                  :rows="4"
                  autoresize
                  placeholder="Books, materials, websites..."
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Remarks"
                name="remarks"
              >
                <UTextarea
                  v-model="state.remarks"
                  :rows="4"
                  autoresize
                  placeholder="Additional notes..."
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Attachment"
                name="document"
                description="Optional. Upload a PDF copy of the scheme (e.g. syllabus or curriculum guide)."
              >
                <div
                  v-if="!state.document"
                  class="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-default p-6 text-center transition-colors hover:border-primary hover:bg-primary/5"
                  :class="{ 'border-primary bg-primary/5': isDragging }"
                  @click="fileInput?.click()"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="onDrop"
                >
                  <div class="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted">
                    <UIcon name="i-lucide-file-up" class="size-6" />
                  </div>

                  <div>
                    <p class="text-sm font-medium">
                      Click to upload or drag and drop
                    </p>

                    <p class="mt-0.5 text-xs text-muted">
                      PDF only, up to 10MB
                    </p>
                  </div>

                  <input
                    ref="fileInput"
                    type="file"
                    accept="application/pdf"
                    class="hidden"
                    @change="onFileChange"
                  >
                </div>

                <div
                  v-else
                  class="flex items-center gap-3 rounded-2xl border border-default p-4"
                >
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-error/10 text-error">
                    <UIcon name="i-lucide-file-text" class="size-5" />
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium">
                      {{ state.document.name }}
                    </p>

                    <p class="text-xs text-muted">
                      {{ formatFileSize(state.document.size) }}
                    </p>
                  </div>

                  <UButton
                    icon="i-lucide-eye"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    @click="previewFile"
                  />

                  <UButton
                    icon="i-lucide-x"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    @click="removeFile"
                  />
                </div>

                <p v-if="fileError" class="mt-2 flex items-center gap-1.5 text-sm text-error">
                  <UIcon name="i-lucide-triangle-alert" class="size-4" />
                  {{ fileError }}
                </p>
              </UFormField>

            </div>

          </UCard>

        </div>

        <!-- Right -->
        <div>
          <UCard
            class="sticky top-6 overflow-hidden border-primary/20"
            :ui="{
              body: 'space-y-6'
            }"
          >
            <!-- Header -->
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="rounded-xl bg-primary/10 p-3">
                    <UIcon
                      name="i-lucide-eye"
                      class="text-xl text-primary"
                    />
                  </div>

                  <div>
                    <h3 class="font-semibold">
                      Scheme Preview
                    </h3>

                    <p class="text-sm text-muted">
                      Live summary of the scheme
                    </p>
                  </div>
                </div>

                <UBadge
                  color="primary"
                  variant="soft"
                  label="Draft"
                />
              </div>
            </template>

            <!-- Preview Items -->
            <div class="space-y-4">

              <div class="flex items-center gap-4 rounded-2xl bg-primary/5 p-4">
                <div class="rounded-xl bg-primary/10 p-2">
                  <UIcon
                    name="i-lucide-book-open"
                    class="text-primary"
                  />
                </div>

                <div>
                  <p class="text-xs text-muted uppercase">
                    Subject
                  </p>

                  <p class="font-medium">
                    {{ selectedSubjectLabel }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-4 rounded-2xl bg-green-500/5 p-4">
                <div class="rounded-xl bg-green-500/10 p-2">
                  <UIcon
                    name="i-lucide-school"
                    class="text-green-500"
                  />
                </div>

                <div>
                  <p class="text-xs text-muted uppercase">
                    Class
                  </p>

                  <p class="font-medium">
                    {{ selectedClassLabel }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-4 rounded-2xl bg-violet-500/5 p-4">
                <div class="rounded-xl bg-violet-500/10 p-2">
                  <UIcon
                    name="i-lucide-calendar"
                    class="text-violet-500"
                  />
                </div>

                <div>
                  <p class="text-xs text-muted uppercase">
                    Academic Year
                  </p>

                  <p class="font-medium">
                    {{ state.academicYear || 'Not specified' }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-4 rounded-2xl bg-orange-500/5 p-4">
                <div class="rounded-xl bg-orange-500/10 p-2">
                  <UIcon
                    name="i-lucide-calendar-range"
                    class="text-orange-500"
                  />
                </div>

                <div>
                  <p class="text-xs text-muted uppercase">
                    Term
                  </p>

                  <p class="font-medium">
                    {{ selectedTermLabel }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-4 rounded-2xl bg-sky-500/5 p-4">
                <div class="rounded-xl bg-sky-500/10 p-2">
                  <UIcon
                    name="i-lucide-clock-3"
                    class="text-sky-500"
                  />
                </div>

                <div>
                  <p class="text-xs text-muted uppercase">
                    Duration
                  </p>

                  <p class="font-medium">
                    {{ state.weeks }}
                    {{ state.weeks === 1 ? 'Week' : 'Weeks' }}
                  </p>

                  <p
                    v-if="state.startDate && state.endDate"
                    class="text-xs text-muted"
                  >
                    {{ state.startDate }} → {{ state.endDate }}
                  </p>
                </div>
              </div>

              <div v-if="state.document" class="flex items-center gap-4 rounded-2xl bg-red-500/5 p-4">
                <div class="rounded-xl bg-red-500/10 p-2">
                  <UIcon
                    name="i-lucide-file-text"
                    class="text-red-500"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="text-xs text-muted uppercase">
                    Attachment
                  </p>

                  <button
                    type="button"
                    class="truncate font-medium text-left hover:underline"
                    @click="previewFile"
                  >
                    {{ state.document.name }}
                  </button>
                </div>

                <UButton
                  icon="i-lucide-external-link"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  @click="previewFile"
                />
              </div>

            </div>

            <!-- Footer -->
            <template #footer>
              <div class="rounded-2xl border bg-muted/30 p-4">

                <div class="flex items-center gap-2 mb-2">
                  <UIcon
                    name="i-lucide-info"
                    class="text-primary"
                  />

                  <p class="font-medium">
                    Status
                  </p>
                </div>

                <p class="text-sm text-muted">
                  This scheme is currently being prepared and has not yet been published.
                </p>

              </div>
            </template>

          </UCard>
        </div>

      </div>

    </UForm>

  </div>
</template>
<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const subjectStore = useSubjectStore()
const classStore = useClassSessionStore()
const { success, error } = useNotify()

const formRef = ref()
const fileInput = ref<HTMLInputElement>()
const isLoading = ref(false)
const loadingSubjects = ref(false)
const loadingClasses = ref(false)
const isDragging = ref(false)
const fileError = ref('')

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

type SchemeForm = {
  subjectId: string
  classId: string
  academicYear: string
  term: string
  weeks: number
  startDate: string
  endDate: string
  resources: string
  remarks: string
  document: File | null
}

const state = reactive<SchemeForm>({
  subjectId: '',
  classId: '',
  academicYear: '',
  term: '',
  weeks: 12,
  startDate: '',
  endDate: '',
  resources: '',
  remarks: '',
  document: null
})

const subjects = ref<{ label: string; value: string }[]>([])
const classes = ref<{ label: string; value: string }[]>([])

const terms = [
  { label: 'Term 1', value: 'TERM_1' },
  { label: 'Term 2', value: 'TERM_2' },
  { label: 'Term 3', value: 'TERM_3' }
]

const selectedSubjectLabel = computed(
  () => subjects.value.find(s => s.value === state.subjectId)?.label || 'Not selected'
)

const selectedClassLabel = computed(
  () => classes.value.find(c => c.value === state.classId)?.label || 'Not selected'
)

const selectedTermLabel = computed(
  () => terms.find(t => t.value === state.term)?.label || 'Not selected'
)

const dateRangeInvalid = computed(() => {
  if (!state.startDate || !state.endDate) return false
  return new Date(state.endDate) < new Date(state.startDate)
})

const schema = yup.object({
  subjectId: yup.string().required('Subject is required'),
  classId: yup.string().required('Class is required'),
  academicYear: yup.string().required('Academic year is required'),
  term: yup.string().required('Term is required'),
  weeks: yup.number().required('Weeks is required').min(1, 'Weeks must be greater than 0'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup
    .string()
    .required('End date is required')
    .test('after-start', 'End date must be after start date', function (value) {
      const { startDate } = this.parent
      if (!value || !startDate) return true
      return new Date(value) >= new Date(startDate)
    }),
  resources: yup.string(),
  remarks: yup.string(),
  document: yup.mixed().nullable()
})

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function validateAndSetFile(file: File) {
  fileError.value = ''

  if (file.type !== 'application/pdf') {
    fileError.value = 'Only PDF files are allowed.'
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    fileError.value = 'File size must be under 10MB.'
    return
  }

  state.document = file
}

function previewFile() {
  if (!state.document) return

  const url = URL.createObjectURL(state.document)
  window.open(url, '_blank')

  // Revoke after a short delay to give the new tab time to load it
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) validateAndSetFile(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false

  const file = e.dataTransfer?.files?.[0]
  if (file) validateAndSetFile(file)
}

function removeFile() {
  state.document = null
  fileError.value = ''

  if (fileInput.value) fileInput.value.value = ''
}

async function onSubmit(event: FormSubmitEvent<SchemeForm>) {
  isLoading.value = true

  try {
    const payload = new FormData()

    payload.append('subjectId', state.subjectId)
    payload.append('classId', state.classId)
    payload.append('academicYear', state.academicYear)
    payload.append('term', state.term)
    payload.append('weeks', String(state.weeks))
    payload.append('startDate', state.startDate)
    payload.append('endDate', state.endDate)
    payload.append('resources', state.resources)
    payload.append('remarks', state.remarks)

    if (state.document) {
      payload.append('document', state.document)
    }

    await schemeStore.create(payload)

    success('Scheme of Work created successfully')

    await navigateTo('/scheme-of-work')
  }
  catch (err: any) {
    error(err?.message || 'Failed to create Scheme of Work')
  }
  finally {
    isLoading.value = false
  }
}

async function loadSubjects() {
  loadingSubjects.value = true

  try {
    const res = await subjectStore.fetchAll()

    if (!res) return

    subjects.value = res.map((subject: any) => ({
      label: subject.subjectName,
      value: subject.id
    }))
  }
  catch (err) {
    console.error(err)
  }
  finally {
    loadingSubjects.value = false
  }
}

async function loadClasses() {
  loadingClasses.value = true

  try {
    const res = await classStore.fetchAll(0, 0)

    if (!res) return

    classes.value = res.map((c: any) => {
      let name = c.clazz

      if (c.streamName) {
        name = `${name} (${c.streamName})`
      }

      return {
        label: name,
        value: c.id
      }
    })
  }
  catch (err) {
    console.error(err)
  }
  finally {
    loadingClasses.value = false
  }
}

onMounted(() => {
  loadSubjects()
  loadClasses()
})

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER,
    Role.TEACHER
  ]
})
</script>