<template>
  <u-slideover :dismissible="false" title="Add Student" :open="open" @update:open="open = $event">
    <!-- Trigger -->
    <UButton color="primary" label="Add Student" icon="prime:plus" @click="open = true" />

    <!-- Header -->
    <template #header>
      <div class="flex justify-between w-full items-center">
        <p class="text-lg font-semibold">Add Student</p>
        <u-button icon="codicon:close" variant="ghost" @click="close" />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit.prevent="onSubmit">
        <!-- BASIC INFO -->
        <UFormField required label="Given Names" name="givenNames"
          help="Enter the student's first and middle names as per official records.">
          <UInput v-model="state.givenNames" :disabled="isLoading" placeholder="e.g. Ishmael" />
        </UFormField>

        <UFormField required label="Family Name" name="familyName" help="Enter the student's surname.">
          <UInput v-model="state.familyName" :disabled="isLoading" placeholder="e.g. Kargbo" />
        </UFormField>

        <UFormField required label="Date of Birth" name="dateOfBirth"
          help="Select the student's official date of birth.">
          <UInput type="date" v-model="state.dateOfBirth" :disabled="isLoading" />
        </UFormField>

        <UFormField required label="Gender" name="gender" help="Select the student's gender.">
          <USelect :items="genders" v-model="state.gender" placeholder="Select gender" :disabled="isLoading" />
        </UFormField>

        <UFormField required label="Class" name="classId"
          help="Choose the class session the student will be enrolled in.">
          <USelect :items="classes" v-model="state.classId" placeholder="Select class session"
            :disabled="classSession.loading || isLoading" />
        </UFormField>

        <!-- SUBJECT SELECTION -->
        <div v-if="state.classId" class="rounded-lg border p-4 bg-gray-50/20 border-gray-300 space-y-4">
          <p v-if="curriculumLoading" class="text-sm text-muted">
            Loading class subjects...
          </p>

          <template v-else>
            <!-- CORE SUBJECTS -->
            <div v-if="curriculum?.core?.length">
              <p class="text-sm font-medium mb-2">
                Core Subjects
              </p>
              <p class="text-xs text-muted mb-2">
                These subjects are mandatory and automatically assigned.
              </p>

              <div class="flex flex-wrap gap-2">
                <UBadge v-for="s in curriculum.core" :key="s.id" variant="outline" color="neutral" :label="s.name" />
              </div>
            </div>

            <!-- OPTIONAL SUBJECTS -->
            <div v-for="group in curriculum?.options || []" :key="group.groupId"
              class="border-t py-3 border-gray-200 space-y-2">
              <div class="flex justify-between items-center">
                <p class="font-medium">
                  {{ group.name }}
                </p>
                <span class="text-xs text-muted">
                  Select {{ group.select }}
                </span>
              </div>

              <p class="text-xs text-muted">
                Please select exactly {{ group.select }}
                subject(s) from this group.
              </p>

              <USelect :items="group.list.map((s: any) => ({
                label: s.name,
                value: s.id
              }))" :multiple="group.select > 1" :model-value="getGroupModelValue(group)"
                @update:model-value="val => updateGroupSelection(group, val)" :placeholder="group.select === 1
                  ? 'Select one subject'
                  : `Select up to ${group.select} subjects`
                  " :disabled="isLoading" />

              <p class="text-xs text-muted">
                Selected:
                {{ selectedOptionsByGroup[group.groupId]?.length || 0 }}
                /
                {{ group.select }}
              </p>

              <p v-if="submitted && optionError(group)" class="text-xs text-red-500">
                You must select exactly {{ group.select }} subject(s).
              </p>
            </div>
          </template>
        </div>

        <UFormField required label="Academic Number" name="academicNumber"
          help="Enter the unique academic registration number for the student.">
          <UInput v-model="state.academicNumber" :disabled="isLoading" placeholder="e.g. STD-2026-001" />
        </UFormField>
      </UForm>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex gap-3">
        <u-button label="Save" icon="mynaui:save" :loading="isLoading" @click="formRef?.submit()" />
        <u-button label="Cancel" variant="outline" @click="close" />
      </div>
    </template>
  </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref, computed, watch, onMounted } from 'vue'

const store = useStudentStore()
const classSession = useClassSessionStore()
const toast = useToast()

const open = ref(false)
const isLoading = ref(false)
const submitted = ref(false)
const formRef = ref<any>(null)

const genders = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' }
]

const state = reactive({
  givenNames: '',
  familyName: '',
  academicNumber: '',
  dateOfBirth: '',
  gender: '',
  classId: '',
  selectedOptionIds: [] as string[]
})

const schema = yup.object({
  givenNames: yup.string().required(),
  familyName: yup.string().required(),
  academicNumber: yup.string().required(),
  dateOfBirth: yup.string().required(),
  gender: yup.string().required(),
  classId: yup.string().required()
})

const classes = computed(() =>
  classSession.records.map(e => ({
    label: parseClassSession(e),
    value: e.id
  }))
)

const curriculum = ref<any>(null)
const curriculumLoading = ref(false)

const selectedOptionsByGroup = computed<Record<string, string[]>>(() => {
  const map: Record<string, string[]> = {}
  curriculum.value?.options?.forEach((g: any) => {
    map[g.groupId] = state.selectedOptionIds.filter(id =>
      g.list.some((s: any) => s.id === id)
    )
  })
  return map
})

function getGroupModelValue(group: any) {
  const selected = selectedOptionsByGroup.value[group.groupId] || []
  return group.select === 1
    ? selected[0] ?? null
    : selected
}

function updateGroupSelection(group: any, value: any) {
  const otherGroups =
    curriculum.value?.options
      .filter((g: any) => g.groupId !== group.groupId)
      .flatMap((g: any) =>
        state.selectedOptionIds.filter((id: string) =>
          g.list.some((s: any) => s.id === id)
        )
      ) || []

  let newSelection: string[] = []

  if (group.select === 1) {
    newSelection = value ? [value] : []
  } else {
    newSelection = Array.isArray(value)
      ? value.slice(0, group.select)
      : []
  }

  state.selectedOptionIds = [...otherGroups, ...newSelection]
}

function optionError(group: any) {
  const selected = selectedOptionsByGroup.value[group.groupId] || []
  return selected.length !== group.select
}

watch(
  () => state.classId,
  async () => {
    curriculum.value = null
    state.selectedOptionIds = []
    submitted.value = false

    if (!state.classId) return

    curriculumLoading.value = true
    try {
      const session = classSession.records.find(e => e.id === state.classId)
      if (!session) return

      curriculum.value = await ClassApi().getClassSubjects(
        session.clazzId,
        session.streamId || undefined
      )
    } catch (e: any) {
      toast.add({ description: e.message, color: 'error' })
    } finally {
      curriculumLoading.value = false
    }
  }
)

const onSubmit = async () => {
  submitted.value = true
  isLoading.value = true

  try {
    await schema.validate(state)

    for (const group of curriculum.value?.options || []) {
      const selected = selectedOptionsByGroup.value[group.groupId] || []
      if (selected.length !== group.select) {
        throw new Error(`${group.name}: select exactly ${group.select}`)
      }
    }

    await store.create({
      ...state,
      classSessionId: state.classId
    })

    toast.add({
      description: 'Student created successfully',
      color: 'success'
    })

    close()
    await store.fetchAll(1, runtimeConf().limit)
  } catch (e: any) {
    toast.add({
      description: e.message,
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

function close() {
  open.value = false
  submitted.value = false

  Object.assign(state, {
    givenNames: '',
    familyName: '',
    academicNumber: '',
    dateOfBirth: '',
    gender: '',
    classId: '',
    selectedOptionIds: []
  })

  curriculum.value = null
}

onMounted(() => {
  classSession.fetchAll(0, 0)
})
</script>