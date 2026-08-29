<template>
  <div class="space-y-5 p-4">
    <Heading title="Write Lesson Note" subtitle="Record the day's lesson note for this week's topic.">
      <div class="flex gap-3">
        <UButton variant="outline" color="neutral" :icon="BACK_ICON" @click="back">
          Back
        </UButton>
      </div>
    </Heading>

    <UForm ref="formRef" :state="state" :schema="schema" class="space-y-6" @submit="onSubmit">
      <div class="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">

        <!-- Sidebar -->
        <div class="space-y-6 xl:sticky xl:top-6 xl:self-start">

          <!-- Inherited from the scheme of work -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-notebook-pen" class="text-primary size-5" />
                <span class="font-semibold">Week {{ week?.week }}</span>
              </div>
            </template>

            <div class="space-y-3 text-sm">
              <div>
                <p class="text-xs text-muted uppercase tracking-wide">Topic</p>
                <p class="font-medium">{{ week?.topic || '—' }}</p>
              </div>
              <div v-if="week?.subTopic">
                <p class="text-xs text-muted uppercase tracking-wide">Sub-topic</p>
                <p class="font-medium">{{ week?.subTopic }}</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-info" class="text-primary size-5" />
                <span class="font-semibold">Lesson Details</span>
              </div>
            </template>

            <div class="space-y-4">
              <UFormField label="Lesson Title" name="title" required>
                <UInput v-model="state.title" placeholder="e.g. Introduction to Simple Fractions" icon="i-lucide-text"
                  class="w-full" />
              </UFormField>

              <UFormField label="Content / Focus" name="content" required>
                <UTextarea v-model="state.content" :rows="2"
                  placeholder="Short summary of what this lesson covers" class="w-full" />
              </UFormField>

              <UFormField label="Date" name="date" required>
                <UInput v-model="state.date" type="date" icon="i-lucide-calendar" class="w-full" />
              </UFormField>

              <UFormField label="Duration / Period" name="duration">
                <UInput v-model="state.duration" placeholder="e.g. 40 minutes or Double period" icon="i-lucide-clock"
                  class="w-full" />
              </UFormField>
            </div>
          </UCard>

        </div>

        <!-- Main Content -->
        <div class="space-y-6">

          <!-- Instructional Objectives -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-target" class="text-primary size-5" />
                  <span class="font-semibold">Instructional Objectives</span>
                </div>
                <UButton variant="soft" size="sm" :icon="ADD_ICON" label="Add" @click="addObjective" />
              </div>
            </template>

            <p class="mb-3 text-sm text-muted">
              By the end of the lesson, pupils should be able to...
            </p>

            <div class="space-y-3">
              <div v-for="(objective, index) in state.objectives" :key="index" class="flex gap-3">
                <UFormField :name="`objectives.${index}`" class="flex-1">
                  <UInput v-model="state.objectives[index]" :placeholder="`Objective ${index + 1}`" />
                </UFormField>
                <UButton v-if="state.objectives.length > 1" color="error" variant="ghost" :icon="DELETE_ICON"
                  @click="removeObjective(index)" />
              </div>
            </div>
          </UCard>

          <!-- Previous Knowledge -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-brain" class="text-primary size-5" />
                <span class="font-semibold">Previous Knowledge</span>
              </div>
            </template>

            <UFormField name="previousKnowledge">
              <UTextarea v-model="state.previousKnowledge" :rows="2"
                placeholder="e.g. Pupils can already identify and count whole numbers" class="w-full" />
            </UFormField>
          </UCard>

          <!-- Teaching Aids -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-boxes" class="text-primary size-5" />
                  <span class="font-semibold">Teaching Aids</span>
                </div>
                <UButton variant="soft" size="sm" :icon="ADD_ICON" label="Add" @click="addAid" />
              </div>
            </template>

            <div class="space-y-3">
              <div v-for="(aid, index) in state.teachingAids" :key="index" class="flex gap-3">
                <UFormField :name="`teachingAids.${index}`" class="flex-1">
                  <UInput v-model="state.teachingAids[index]" placeholder="e.g. Chalkboard, fraction charts" />
                </UFormField>
                <UButton v-if="state.teachingAids.length > 1" color="error" variant="ghost" :icon="DELETE_ICON"
                  @click="removeAid(index)" />
              </div>
            </div>
          </UCard>

          <!-- Reference Materials -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-book-open" class="text-primary size-5" />
                  <span class="font-semibold">Reference Materials</span>
                </div>
                <UButton variant="soft" size="sm" :icon="ADD_ICON" label="Add" @click="addReference" />
              </div>
            </template>

            <div class="space-y-3">
              <div v-for="(ref, index) in state.referenceMaterials" :key="index" class="flex gap-3">
                <UFormField :name="`referenceMaterials.${index}`" class="flex-1">
                  <UInput v-model="state.referenceMaterials[index]"
                    placeholder="e.g. New General Mathematics Bk 1, pg 45-47" />
                </UFormField>
                <UButton v-if="state.referenceMaterials.length > 1" color="error" variant="ghost" :icon="DELETE_ICON"
                  @click="removeReference(index)" />
              </div>
            </div>
          </UCard>

          <!-- Presentation -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-presentation" class="text-primary size-5" />
                <span class="font-semibold">Presentation</span>
              </div>
            </template>

            <p class="mb-4 text-sm text-muted">
              What the teacher does and what pupils do, at each stage of the lesson.
            </p>

            <div class="space-y-4">
              <div v-for="(item, index) in state.presentation" :key="index"
                class="rounded-xl border border-default p-4">
                <p class="mb-3 font-medium">{{ item.stage }}</p>

                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Teacher's Activity" :name="`presentation.${index}.teacherActivity`">
                    <UTextarea v-model="item.teacherActivity" :rows="3" class="w-full" />
                  </UFormField>

                  <UFormField label="Pupils' Activity" :name="`presentation.${index}.pupilsActivity`">
                    <UTextarea v-model="item.pupilsActivity" :rows="3" class="w-full" />
                  </UFormField>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Evaluation -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-clipboard-check" class="text-primary size-5" />
                <span class="font-semibold">Evaluation</span>
              </div>
            </template>

            <p class="mb-2 text-sm text-muted">
              How you will check pupils' understanding before the lesson ends.
            </p>

            <UFormField name="evaluation">
              <UTextarea v-model="state.evaluation" :rows="3"
                placeholder="e.g. Ask pupils to solve 3 fraction problems on the board" class="w-full" />
            </UFormField>
          </UCard>

          <!-- Assignment -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-pencil" class="text-primary size-5" />
                <span class="font-semibold">Assignment</span>
              </div>
            </template>

            <UFormField name="assignment">
              <UTextarea v-model="state.assignment" :rows="3" placeholder="e.g. Complete exercise 4.2, questions 1-10"
                class="w-full" />
            </UFormField>
          </UCard>

          <!-- Footer Actions -->
          <UCard>
            <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-sm text-muted">
                Objectives, title, content and date are required.
              </p>

              <div class="flex gap-3">
                <UButton variant="outline" color="neutral" @click="back">
                  Cancel
                </UButton>

                <UButton type="submit" icon="i-lucide-save" :loading="isSubmitting">
                  Save Lesson Note
                </UButton>
              </div>
            </div>
          </UCard>

        </div>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const route = useRoute()
const weekStore = useWeekStore()
const lessonStore = useLessonStore()

const weekId = computed(() => route.params.id as string)
const { current: week } = storeToRefs(weekStore)

const formRef = ref()
const isSubmitting = ref(false)

const state = reactive({
  title: '',
  content: '',
  date: new Date().toISOString().slice(0, 10),
  duration: '',
  objectives: [''],
  previousKnowledge: '',
  teachingAids: [''],
  referenceMaterials: [''],
  presentation: [
    { stage: 'Introduction', teacherActivity: '', pupilsActivity: '' },
    { stage: 'Development', teacherActivity: '', pupilsActivity: '' },
    { stage: 'Conclusion', teacherActivity: '', pupilsActivity: '' }
  ] as LessonStage[],
  evaluation: '',
  assignment: ''
})

const schema = yup.object({
  title: yup.string().trim().required('Lesson title is required'),
  content: yup.string().trim().required('Content is required'),
  date: yup.string().required('Date is required'),
  objectives: yup.array()
    .of(yup.string().trim().required('Objective is required'))
    .min(1, 'At least one objective is required')
    .required()
})

function addObjective() {
  state.objectives.push('')
}

function removeObjective(index: number) {
  if (state.objectives.length > 1)
    state.objectives.splice(index, 1)
}

function addAid() {
  state.teachingAids.push('')
}

function removeAid(index: number) {
  if (state.teachingAids.length > 1)
    state.teachingAids.splice(index, 1)
}

function addReference() {
  state.referenceMaterials.push('')
}

function removeReference(index: number) {
  if (state.referenceMaterials.length > 1)
    state.referenceMaterials.splice(index, 1)
}

function back() {
  navigateTo(`/curriculums/weeks/${weekId.value}`)
}

async function onSubmit() {
  try {
    isSubmitting.value = true

    await lessonStore.create({
      week: weekId.value,
      title: state.title,
      content: state.content,
      date: state.date,
      duration: state.duration || undefined,
      objectives: state.objectives.filter(o => o.trim()),
      previousKnowledge: state.previousKnowledge || undefined,
      teachingAids: state.teachingAids.filter(a => a.trim()),
      referenceMaterials: state.referenceMaterials.filter(r => r.trim()),
      presentation: state.presentation.filter(p => p.teacherActivity.trim() || p.pupilsActivity.trim()),
      evaluation: state.evaluation || undefined,
      assignment: state.assignment || undefined
    })

    useNotify().success('Lesson note saved successfully.')
    back()
  } catch (error: any) {
    useNotify().error(error.message || error || 'Unable to save lesson note.')
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => route.params.id,
  async (id) => {
    if (id) await weekStore.getWeek(id as string)
  },
  { immediate: true }
)

onMounted(() => {
  useAppStore().setTitle('Write Lesson Note')
  useAppStore().setBack(`/curriculums/weeks/${weekId.value}`)
  document.title = 'Write Lesson Note | Skultem'
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
