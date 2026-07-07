<template>
  <div class="space-y-6 p-4">
    <UCard>
      <Heading title="Create Scheme of Work" subtitle="Plan topics, objectives and weekly teaching activities.">
        <div class="flex gap-3">
          <UButton variant="outline" color="neutral" :icon="BACK_ICON" to="/curriculums" label="Back" />
        </div>
      </Heading>
    </UCard>
    <UForm ref="formRef" :state="state" :schema="schema" class="space-y-6" @submit="onSubmit">

      <div class="grid gap-6 xl:grid-cols-3">

        <!-- Left -->
        <div class="space-y-4 xl:col-span-2">

          <!-- Basic Information -->
          <UCard>

            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-book-open" class="text-primary" />

                <span class="font-semibold">
                  Basic Information
                </span>
              </div>
            </template>

            <div class="grid gap-5 lg:grid-cols-2">
              <UFormField label="Class" name="classId" required>
                <USelectMenu v-model="state.classId" :items="classes" :loading="loadingClasses" value-key="value"
                  label-key="label" leading-icon="i-lucide-school" placeholder="Select class" class="w-full" />
              </UFormField>
              <UFormField label="Subject" name="subjectId" required>
                <USelectMenu v-model="state.subjectId" :items="subjects" :loading="loadingSubjects" value-key="value"
                  label-key="label" leading-icon="i-lucide-book-open" placeholder="Select subject" class="w-full" />
              </UFormField>
              <UFormField label="Term" name="term" required>
                <USelectMenu v-model="state.term" :items="terms" value-key="value" label-key="label"
                  leading-icon="i-lucide-calendar-range" placeholder="Select term" class="w-full" />
              </UFormField>
              <UFormField label="Weeks" name="weeks">
                <UInput v-model.number="state.weeks" type="number" min="1" leading-icon="i-lucide-hash"
                  class="w-full" />
              </UFormField>
            </div>

          </UCard>

          <!-- Schedule -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-calendar-days" class="text-primary" />

                <span class="font-semibold">
                  Schedule Settings
                </span>
              </div>
            </template>

            <div class="grid gap-5 lg:grid-cols-2">
              <UFormField label="Start Date" name="startDate">
                <UInput v-model="state.startDate" type="date" class="w-full" />
              </UFormField>

              <UFormField label="End Date" name="endDate">
                <UInput v-model="state.endDate" type="date" class="w-full" />
              </UFormField>

            </div>

            <p v-if="dateRangeInvalid" class="mt-3 flex items-center gap-1.5 text-sm text-error">
              <UIcon name="i-lucide-triangle-alert" class="size-4" />
              End date should be after the start date.
            </p>

          </UCard>
          <UCard>
            <div class="flex gap-3">
              <UButton variant="outline" color="neutral" :icon="BACK_ICON" to="/curriculums/scheme-of-work"
                label="Cancel" />

              <UButton type="submit" :trailing-icon="SAVE_ICON" label="Save Scheme" :loading="isLoading"
                @click="formRef?.submit()" />
            </div>
          </UCard>
        </div>

        <!-- Right -->
        <div>
          <UCard class="sticky top-6 overflow-hidden border-primary/20" :ui="{
            body: 'space-y-6'
          }">
            <!-- Header -->
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div>
                    <h3 class="font-semibold">
                      Scheme Preview
                    </h3>

                    <p class="text-xs text-muted">
                      Live summary of the scheme
                    </p>
                  </div>
                </div>

                <UBadge color="primary" variant="soft" label="Draft" />
              </div>
            </template>

            <!-- Preview Items -->
            <div class="space-y-2.5">

              <div class="flex items-center gap-4 rounded-2xl bg-primary/5 p-3">
                <div>
                  <div class="rounded-xl bg-primary/10 p-2 flex items-center">
                    <UIcon name="i-lucide-book-open" class="text-primary" />
                  </div>
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

              <div class="flex items-center gap-4 rounded-2xl bg-green-500/5 p-3">
                <div>
                  <div class="rounded-xl bg-green-500/10 p-2 flex items-center">
                    <UIcon name="i-lucide-school" class="text-green-500" />
                  </div>
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

              <div class="flex items-center gap-4 rounded-2xl bg-orange-500/5 p-3">
                <div>
                  <div class="rounded-xl bg-orange-500/10 p-2 flex items-center">
                    <UIcon name="i-lucide-calendar-range" class="text-orange-500" />
                  </div>
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

              <div class="flex items-center gap-4 rounded-2xl bg-sky-500/5 p-3">
                <div>
                  <div class="rounded-xl bg-sky-500/10 p-2 items-center flex">
                    <UIcon name="i-lucide-clock-3" class="text-sky-500" />
                  </div>
                </div>

                <div>
                  <p class="text-xs text-muted uppercase">
                    Duration
                  </p>

                  <p class="font-medium">
                    {{ state.weeks }}
                    {{ state.weeks === 1 ? 'Week' : 'Weeks' }}
                  </p>

                  <p v-if="state.startDate && state.endDate" class="text-xs text-muted">
                    {{ state.startDate }} → {{ state.endDate }}
                  </p>
                </div>
              </div>

              <div v-if="state.document" class="flex items-center gap-4 rounded-2xl bg-red-500/5 p-4">
                <div class="rounded-xl bg-red-500/10 p-2">
                  <UIcon name="i-lucide-file-text" class="text-red-500" />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="text-xs text-muted uppercase">
                    Attachment
                  </p>

                  <button type="button" class="truncate font-medium text-left hover:underline" @click="previewFile">
                    {{ state.document.name }}
                  </button>
                </div>

                <UButton icon="i-lucide-external-link" color="neutral" variant="ghost" size="sm" @click="previewFile" />
              </div>

            </div>

            <!-- Footer -->
            <template #footer>
              <div class="rounded-2xl border bg-muted/30 p-4 border-gray-300">

                <div class="flex items-center gap-2 mb-2">
                  <UIcon name="i-lucide-info" class="text-primary" />

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

const classSubjectStore = useClassSubjectStore()
const classStore = useClassSessionStore()
const appStore = useAppStore()

const { listByClass: classes } = storeToRefs(classStore)
const { list: subjects, error: subjectError } = storeToRefs(classSubjectStore)
const { success, error } = useNotify()

const formRef = ref()
const isLoading = ref(false)
const loadingSubjects = ref(false)
const loadingClasses = ref(false)

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
onMounted(async () => {
  classStore.fetchAll(0, 0);
  const res = await appStore.fetchCycleOverview()
  console.log(res);

})

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER,
    Role.TEACHER
  ]
})

watch(() => state.classId, async (value) => {
  if (value == "") return
  await classSubjectStore.allByClass(value, 0, 0)
}, { immediate: true })
</script>