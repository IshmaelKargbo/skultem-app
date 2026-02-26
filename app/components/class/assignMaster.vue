<template>
  <USlideover v-model:open="open">
    <!-- Trigger -->
    <UButton color="info" label="Assign Class Master" icon="hugeicons:assignments" @click="open = true" />

    <!-- Header -->
    <template #header>
      <div class="flex justify-between w-full items-center">
        <p class="text-lg font-semibold">Assign Class Master</p>
        <UButton icon="codicon:close" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5 w-full" @submit="onSubmit">
        <!-- Class -->
        <UFormField label="Class" name="classId" required>
          <USelect :items="classes" v-model="state.classId" @change="fetchRecords" :disabled="isLoading"
            placeholder="Select class" />
          <template #hint>
            <p class="text-xs text-muted">
              Select the class where you want to assign a class master.
            </p>
          </template>
        </UFormField>

        <!-- Section -->
        <UFormField v-if="selectedClass" label="Section" name="sectionId" required>
          <USelect :items="sections" v-model="state.sectionId" :disabled="isLoading" placeholder="Select section" />
          <template #hint>
            <p class="text-xs text-muted">
              Choose the section within this class.
            </p>
          </template>
        </UFormField>

        <!-- Stream (SSS only) -->
        <UFormField v-if="selectedClass?.level === Level.SSS" label="Stream" name="streamId" required>
          <USelect :items="streams" v-model="state.streamId" :disabled="isLoading" placeholder="Select stream" />
          <template #hint>
            <p class="text-xs text-muted">
              Select the stream for this SSS class.
            </p>
          </template>
        </UFormField>

        <!-- Teacher -->
        <UFormField v-if="selectedClass" label="Teacher" name="teacherId" required>
          <USelect :items="teachers" v-model="state.teacherId" :disabled="isLoading" placeholder="Select teacher" />
          <template #hint>
            <p class="text-xs text-muted">
              Select the teacher to assign as the class master.
            </p>
          </template>
        </UFormField>
      </UForm>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex space-x-3">
        <UButton icon="mynaui:save" :loading="isLoading" label="Save" @click="formRef?.submit()" />
        <UButton label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import * as yup from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const store = useClassStore()
const teacherStore = useTeacherStore()
const toast = useToast()

const isLoading = ref(false)
const open = ref(false)
const formRef = ref<any>(null)

const state = reactive({
  classId: '',
  sectionId: '',
  streamId: '',
  teacherId: ''
})

const schema = yup.object({
  classId: yup.string().required('Class is required'),
  sectionId: yup.string().required('Section is required'),
  streamId: yup.string().when('classId', {
    is: (val: string) =>
      store.records.find(c => c.id === val)?.level === 'SSS',
    then: schema => schema.required('Stream is required')
  }),
  teacherId: yup.string().required('Teacher is required')
})


const classes = computed(() =>
  store.records.map(c => ({
    label: c.name,
    value: c.id
  }))
)

const selectedClass = computed(() =>
  store.records.find(c => c.id === state.classId) || null
)

const teachers = computed(() =>
  teacherStore.records.map(t => ({
    label: `${t.user.givenNames} ${t.user.familyName}`,
    value: t.id
  }))
)

const sections = ref<{ label: string; value: string }[]>([])
const streams = ref<{ label: string; value: string }[]>([])

async function fetchRecords() {
  try {
    if (!state.classId) return

    // Reset dependent fields
    state.sectionId = ''
    state.streamId = ''

    const resultSections = await store.findAllSections(state.classId)
    sections.value = resultSections?.map((s: ClassSection) => ({
      label: s.section.name,
      value: s.section.id
    })) || []

    const resultStreams = await store.findAllStreams(state.classId)
    streams.value = resultStreams?.map((s: ClassStream) => ({
      label: s.stream.name,
      value: s.stream.id
    })) || []

  } catch (err) {
    sections.value = []
    streams.value = []
  }
}

const close = () => {
  open.value = false
  state.classId = ''
  state.sectionId = ''
  state.streamId = ''
  state.teacherId = ''
  sections.value = []
  streams.value = []
}

const onSubmit = async (event: FormSubmitEvent<typeof state>) => {
  isLoading.value = true
  try {
    await store.assignClassMaster(state.classId, {
      sectionId: state.sectionId,
      streamId: state.streamId,
      teacherId: state.teacherId
    })

    toast.add({
      description: 'The class master has been assigned successfully.',
      color: 'success'
    })

    close()
    useClassSessionStore().fetchAll()
  } catch (err: any) {
    toast.add({
      description: err.message || 'Something went wrong',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await store.fetchAll()
  await teacherStore.fetchAll()
})
</script>
