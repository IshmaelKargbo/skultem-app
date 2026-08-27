<template>
  <UForm ref="formRef" :state="state" :schema="schema" class="px-4 md:px-6 space-y-4" @submit="onSubmit">
    <div class="grid gap-6 xl:grid-cols-3">
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
              <UInput disabled v-model.number="state.weeks" type="number" min="1" leading-icon="i-lucide-hash"
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
              <UInput disabled v-model="state.startDate" type="date" class="w-full" />
            </UFormField>

            <UFormField label="End Date" name="endDate">
              <UInput disabled v-model="state.endDate" type="date" class="w-full" />
            </UFormField>

          </div>

          <p v-if="dateRangeInvalid" class="mt-3 flex items-center gap-1.5 text-sm text-error">
            <UIcon name="i-lucide-triangle-alert" class="size-4" />
            End date should be after the start date.
          </p>

        </UCard>
        <UCard>
          <div class="flex gap-3">
            <UButton variant="outline" color="neutral" to="/curriculums/scheme-of-work"
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
                  {{ selectedTerm?.name || 'Not Selected' }}
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
</template>
<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const classSubjectStore = useClassSubjectStore()
const classStore = useClassSessionStore()
const academicYearStore = useAcademicYearStore()
const store = useSchemeOfWorkStore()

const { listByClass: classes } = storeToRefs(classStore)
const { listBySubject: subjects } = storeToRefs(classSubjectStore)
const { termList: terms } = storeToRefs(academicYearStore)
const { error } = useNotify()

const formRef = ref()
const isLoading = ref(false)
const loadingSubjects = ref(false)
const loadingClasses = ref(false)

type SchemeForm = {
  subjectId: string
  classId: string
  term: string
  weeks: number
  startDate: string
  endDate: string
}

const state = reactive<SchemeForm>({
  subjectId: '',
  classId: '',
  term: '',
  weeks: 0,
  startDate: '',
  endDate: ''
})


const selectedSubjectLabel = computed(
  () => subjects.value.find(s => s.value === state.subjectId)?.label || 'Not selected'
)

const selectedClassLabel = computed(
  () => classes.value.find(c => c.value === state.classId)?.label || 'Not selected'
)

const selectedClass = computed(
  () => classStore.getByClazz(state.classId)
)

const selectedTerm = computed(
  () => academicYearStore.getTerm(state.term)
)

const dateRangeInvalid = computed(() => {
  if (!state.startDate || !state.endDate) return false
  return new Date(state.endDate) < new Date(state.startDate)
})

const schema = yup.object({
  subjectId: yup.string().required('Subject is required'),
  classId: yup.string().required('Class is required'),
  term: yup.string().required('Term is required'),
})

async function onSubmit(event: FormSubmitEvent<SchemeForm>) {
  isLoading.value = true

  try {
    const res = await store.create({
      session: selectedClass.value?.id || '',
      subject: state.subjectId,
      term: state.term,
    })

    navigateTo(`/curriculums/${res.id}`)
  }
  catch (err: any) {
    error(err?.message || 'Failed to create Scheme of Work')
    isLoading.value = false
  }
}

function prepareWeek(term: Term) {
  state.startDate = term.startDate
  state.endDate = term.endDate
  state.weeks = getTotalWeeks(term.startDate, term.endDate)
}

onMounted(async () => {
  classStore.fetchAll(0, 0)
  academicYearStore.getTerms()
  useAppStore().setTitle('Create Scheme of Work')
  useAppStore().setBack(true)
})

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER,
    Role.TEACHER
  ]
})

watch(() => selectedTerm.value, (value) => {
  if (value) prepareWeek(value)
})

watch(() => state.classId, async (value) => {
  if (value == "") return
  await classSubjectStore.allByClass(value, 0, 0)
})
</script>