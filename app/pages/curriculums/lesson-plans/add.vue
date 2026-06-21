<template>
  <div class="space-y-6 mt-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          Create Lesson Plan
        </h1>

        <p class="text-sm text-muted mt-1">
          Prepare and organize lesson activities for students.
        </p>
      </div>

      <div class="flex gap-3">

        <UButton
          variant="outline"
          color="neutral"
          icon="i-lucide-arrow-left"
          to="/curriculums/lesson-plans"
        >
          Back
        </UButton>

        <UButton
          icon="i-lucide-save"
          variant="outline"
          color="neutral"
          :loading="isSubmitting"
          @click="saveLessonPlan(true)"
        >
          Save Draft
        </UButton>

      </div>

    </div>


    <div class="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">

      <!-- Sidebar -->
      <div class="space-y-6 xl:sticky xl:top-6 xl:self-start">

        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-info"
                class="text-primary size-5"
              />

              <span class="font-semibold">
                Lesson Details
              </span>
            </div>
          </template>

          <div class="space-y-4">

            <UFormField label="Subject" required>
              <USelectMenu
                v-model="form.subject"
                placeholder="Select subject"
                icon="i-lucide-book"
                :items="subjects"
                class="w-full"
              />
            </UFormField>

            <div class="grid grid-cols-1 gap-3">

              <UFormField label="Class" required>
                <USelectMenu
                  v-model="form.class"
                  placeholder="Class"
                  icon="i-lucide-school"
                  :items="classes"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Week" required>
                <USelectMenu
                  v-model="form.week"
                  placeholder="Week"
                  icon="i-lucide-calendar-days"
                  :items="weeks"
                  class="w-full"
                />
              </UFormField>

            </div>

            <UFormField label="Lesson Title" required>
              <UInput
                v-model="form.title"
                placeholder="e.g. Introduction to Fractions"
                icon="i-lucide-text"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Date" required>
              <UInput
                v-model="form.date"
                type="date"
                icon="i-lucide-calendar"
                class="w-full"
              />
            </UFormField>

          </div>

        </UCard>


        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-settings-2"
                class="text-primary size-5"
              />

              <span class="font-semibold">
                Publish Settings
              </span>
            </div>
          </template>

          <div class="space-y-3">

            <label class="flex items-start gap-3 rounded-lg border border-default p-3 cursor-pointer hover:bg-muted/40 transition-colors">
              <UCheckbox v-model="form.publish" class="mt-0.5" />
              <div>
                <p class="text-sm font-medium">Publish immediately</p>
                <p class="text-xs text-muted">Make this lesson plan active right away.</p>
              </div>
            </label>

            <label class="flex items-start gap-3 rounded-lg border border-default p-3 cursor-pointer hover:bg-muted/40 transition-colors">
              <UCheckbox v-model="form.visibleToStudents" class="mt-0.5" />
              <div>
                <p class="text-sm font-medium">Visible to students</p>
                <p class="text-xs text-muted">Students can view this lesson plan.</p>
              </div>
            </label>

            <label class="flex items-start gap-3 rounded-lg border border-default p-3 cursor-pointer hover:bg-muted/40 transition-colors">
              <UCheckbox v-model="form.includeHomework" class="mt-0.5" />
              <div>
                <p class="text-sm font-medium">Include homework</p>
                <p class="text-xs text-muted">Attach homework section to this plan.</p>
              </div>
            </label>

          </div>

        </UCard>

      </div>


      <!-- Main Content -->
      <div class="space-y-6">

        <!-- Objectives -->
        <UCard>

          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-target"
                  class="text-primary size-5"
                />

                <span class="font-semibold">
                  Learning Objectives
                </span>
              </div>

              <UBadge color="neutral" variant="subtle" size="sm">Required</UBadge>
            </div>
          </template>

          <div class="space-y-2">
            <p class="text-sm text-muted">
              List what students should know or be able to do by the end of the lesson.
            </p>

            <UTextarea
              v-model="form.objectives"
              :rows="4"
              placeholder="e.g. Students will be able to identify and compare fractions..."
              class="w-full"
            />
          </div>

        </UCard>


        <!-- Activities -->
        <UCard>

          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-users"
                  class="text-primary size-5"
                />

                <span class="font-semibold">
                  Teaching Activities
                </span>
              </div>

              <UBadge color="neutral" variant="subtle" size="sm">Required</UBadge>
            </div>
          </template>

          <div class="space-y-2">
            <p class="text-sm text-muted">
              Outline the step-by-step activities and teaching methods for this lesson.
            </p>

            <UTextarea
              v-model="form.activities"
              :rows="6"
              placeholder="e.g. 1. Warm-up discussion (10 mins)&#10;2. Group activity (20 mins)&#10;3. Class review (15 mins)"
              class="w-full"
            />
          </div>

        </UCard>


        <!-- Materials -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-book-open"
                class="text-primary size-5"
              />

              <span class="font-semibold">
                Materials & Resources
              </span>
            </div>
          </template>

          <div class="space-y-2">
            <p class="text-sm text-muted">
              List any books, charts, devices, or tools needed for this lesson.
            </p>

            <UTextarea
              v-model="form.materials"
              :rows="3"
              placeholder="e.g. Textbook, fraction charts, whiteboard markers"
              class="w-full"
            />
          </div>

        </UCard>


        <!-- Assessment -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-clipboard-check"
                class="text-primary size-5"
              />

              <span class="font-semibold">
                Assessment
              </span>
            </div>
          </template>

          <div class="space-y-2">
            <p class="text-sm text-muted">
              Describe how you will check students' understanding.
            </p>

            <UTextarea
              v-model="form.assessment"
              :rows="3"
              placeholder="e.g. Short quiz, oral questions, classwork review"
              class="w-full"
            />
          </div>

        </UCard>


        <!-- Homework -->
        <UCard v-if="form.includeHomework">

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-pencil"
                class="text-primary size-5"
              />

              <span class="font-semibold">
                Homework
              </span>
            </div>
          </template>

          <div class="space-y-2">
            <p class="text-sm text-muted">
              Assign follow-up exercises or reading for students.
            </p>

            <UTextarea
              v-model="form.homework"
              :rows="3"
              placeholder="e.g. Complete exercise 4.2, questions 1-10"
              class="w-full"
            />
          </div>

        </UCard>


        <!-- Footer Actions -->
        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-default pt-5">

          <p class="text-sm text-muted">
            All required fields must be completed before publishing.
          </p>

          <div class="flex gap-3">

            <UButton
              variant="outline"
              color="neutral"
              @click="resetForm"
            >
              Cancel
            </UButton>

            <UButton
              icon="i-lucide-save"
              :loading="isSubmitting"
              @click="saveLessonPlan(false)"
            >
              Save Lesson Plan
            </UButton>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>
<script setup lang="ts">
const router = useRouter()

const form = reactive({
  subject: '',
  class: '',
  week: '',
  title: '',
  date: '',
  objectives: '',
  activities: '',
  materials: '',
  assessment: '',
  homework: '',
  publish: false,
  visibleToStudents: false,
  includeHomework: true
})

const subjects = [
  'Mathematics',
  'English Language',
  'Integrated Science',
  'Social Studies',
  'Basic Science',
  'Agricultural Science'
]

const classes = [
  'JSS 1',
  'JSS 2',
  'JSS 3',
  'SSS 1',
  'SSS 2',
  'SSS 3'
]

const weeks = Array.from(
  { length: 12 },
  (_, i) => ({
    label: `Week ${i + 1}`,
    value: i + 1
  })
)

const isSubmitting = ref(false)

async function saveLessonPlan(asDraft: boolean) {
  try {
    isSubmitting.value = true

    if (asDraft) {
      form.publish = false
    }

    // TODO: Replace with API request
    console.log(form)

    useToast().add({
      title: asDraft ? 'Draft saved' : 'Lesson plan saved',
      description: asDraft
        ? 'Your lesson plan has been saved as a draft.'
        : 'Lesson plan created successfully.',
      color: 'success'
    })

    router.push('/lesson-plans')
  }
  catch {
    useToast().add({
      title: 'Error',
      description: 'Unable to save lesson plan.',
      color: 'error'
    })
  }
  finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  form.subject = ''
  form.class = ''
  form.week = ''
  form.title = ''
  form.date = ''
  form.objectives = ''
  form.activities = ''
  form.materials = ''
  form.assessment = ''
  form.homework = ''
  form.publish = false
  form.visibleToStudents = false
  form.includeHomework = true
}

onMounted(() => {
  useAppStore().setTitle('Create Lesson Plan')

  document.title =
    'Create Lesson Plan | Skultem'
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