<template>
  <div class="space-y-6 mt-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-2xl font-bold">
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
          to="/lesson-plans"
        >
          Back
        </UButton>

        <UButton
          icon="i-lucide-save"
        >
          Save Draft
        </UButton>

      </div>

    </div>


    <div class="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">

      <!-- Sidebar -->
      <div class="space-y-6">

        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-info"
                class="text-primary"
              />

              <span class="font-semibold">
                Lesson Details
              </span>
            </div>
          </template>

          <div class="space-y-4">

            <USelectMenu
              label="Subject"
              placeholder="Select subject"
              :items="subjects"
            />

            <USelectMenu
              label="Class"
              placeholder="Select class"
              :items="classes"
            />

            <USelectMenu
              label="Week"
              placeholder="Select week"
              :items="weeks"
            />

            <UInput
              label="Lesson Title"
              placeholder="Enter title"
            />

            <UInput
              type="date"
              label="Date"
            />

          </div>

        </UCard>


        <UCard>

          <template #header>
            <span class="font-semibold">
              Publish Settings
            </span>
          </template>

          <div class="space-y-4">

            <UCheckbox
              label="Publish immediately"
            />

            <UCheckbox
              label="Visible to students"
            />

            <UCheckbox
              label="Include homework"
            />

          </div>

        </UCard>

      </div>


      <!-- Main Content -->
      <div class="space-y-6">

        <!-- Objectives -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-target"
                class="text-primary"
              />

              <span class="font-semibold">
                Learning Objectives
              </span>
            </div>
          </template>

          <UTextarea
            :rows="4"
            placeholder="What should students learn?"
          />

        </UCard>


        <!-- Activities -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-users"
                class="text-primary"
              />

              <span class="font-semibold">
                Teaching Activities
              </span>
            </div>
          </template>

          <UTextarea
            :rows="6"
            placeholder="Explain lesson activities..."
          />

        </UCard>


        <!-- Materials -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-book-open"
                class="text-primary"
              />

              <span class="font-semibold">
                Materials & Resources
              </span>
            </div>
          </template>

          <UTextarea
            :rows="4"
            placeholder="Books, charts, computers, etc."
          />

        </UCard>


        <!-- Assessment -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-clipboard-check"
                class="text-primary"
              />

              <span class="font-semibold">
                Assessment
              </span>
            </div>
          </template>

          <UTextarea
            :rows="4"
            placeholder="How will students be assessed?"
          />

        </UCard>


        <!-- Homework -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-pencil"
                class="text-primary"
              />

              <span class="font-semibold">
                Homework
              </span>
            </div>
          </template>

          <UTextarea
            :rows="4"
            placeholder="Homework or follow-up exercises"
          />

        </UCard>


        <div class="flex justify-end gap-3">

          <UButton
            variant="outline"
            color="neutral"
          >
            Cancel
          </UButton>

          <UButton
            icon="i-lucide-save"
          >
            Save Lesson Plan
          </UButton>

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

async function saveLessonPlan() {
  try {
    isSubmitting.value = true

    // TODO: Replace with API request
    console.log(form)

    useToast().add({
      title: 'Lesson plan saved',
      description: 'Lesson plan created successfully.',
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