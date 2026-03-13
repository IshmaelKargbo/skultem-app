<template>
  <u-slideover :dismissible="false" title="Add Student" :open="open" @update:open="open = $event">
    <!-- Trigger -->
    <UButton color="primary" label="Add Student" :icon="ADD_ICON" @click="openSlider" />

    <!-- Header -->
    <template #header>
      <div class="flex justify-between w-full items-center">
        <p class="text-lg font-semibold">Add Student</p>
        <u-button :icon="CLOSE_ICON" variant="ghost" @click="close" />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit.prevent="onSubmit">

        <!-- BASIC INFO -->
        <UFormField required label="Given Names" name="givenNames"
          help="Enter the student's first and middle names as per official records.">
          <UInput v-model="state.givenNames" :disabled="isLoading" placeholder="e.g. Ishmael" class="w-full" />
        </UFormField>

        <UFormField required label="Family Name" name="familyName" help="Enter the student's surname.">
          <UInput v-model="state.familyName" :disabled="isLoading" placeholder="e.g. Kargbo" class="w-full" />
        </UFormField>

        <UFormField required label="Date of Birth" name="dateOfBirth"
          help="Select the student's official date of birth.">
          <UInput type="date" v-model="state.dateOfBirth" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField required label="Gender" name="gender" help="Select the student's gender.">
          <URadioGroup v-model="state.gender" variant="card" :items="genders" :disabled="isLoading" />
        </UFormField>

        <!-- PARENT / GUARDIAN -->
        <UFormField required label="Parent / Guardian" name="parentId">
          <template #help>
            <div class="flex items-center justify-between">
              <p class="text-xs text-muted">Choose an existing parent/guardian for this student.</p>
              <UButton
                v-if="parentLoadError"
                size="xs"
                variant="ghost"
                color="error"
                label="Retry"
                icon="lucide:refresh-cw"
                :loading="parentsLoading"
                @click="loadParents"
              />
            </div>
          </template>

          <!-- Loading state -->
          <div v-if="parentsLoading" class="flex items-center gap-2 text-sm text-muted py-2">
            <UIcon name="lucide:loader-2" class="animate-spin" />
            Loading parents...
          </div>

          <!-- Error state -->
          <div v-else-if="parentLoadError" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 flex items-center gap-2">
            <UIcon name="lucide:alert-circle" />
            Failed to load parents.
            <UButton size="xs" variant="ghost" color="error" label="Retry" @click="loadParents" />
          </div>

          <!-- Empty state -->
          <div v-else-if="parents.length === 0" class="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700 flex items-center gap-2">
            <UIcon name="lucide:alert-circle" />
            No parents found. Please add a parent first.
          </div>

          <!-- Select -->
          <USelect
            v-else
            :items="parents"
            v-model="state.parentId"
            placeholder="Select parent/guardian"
            :disabled="isLoading"
            class="w-full"
          />
        </UFormField>

        <!-- CLASS -->
        <UFormField required label="Class" name="classId"
          help="Choose the class session the student will be enrolled in.">
          <USelect
            :items="classes"
            v-model="state.classId"
            placeholder="Select class session"
            :disabled="classSession.loading || isLoading"
            class="w-full"
          />
        </UFormField>

        <!-- SUBJECT SELECTION -->
        <div v-if="state.classId" class="rounded-lg border p-4 bg-gray-50/20 border-gray-300 space-y-4">
          <div v-if="curriculumLoading" class="flex items-center gap-2 text-sm text-muted">
            <UIcon name="lucide:loader-2" class="animate-spin" />
            Loading class subjects...
          </div>

          <div v-else-if="curriculumLoadError" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 flex items-center gap-2">
            <UIcon name="lucide:alert-circle" />
            Failed to load subjects.
            <UButton size="xs" variant="ghost" color="error" label="Retry" @click="loadCurriculum" />
          </div>

          <template v-else>
            <!-- CORE SUBJECTS -->
            <div v-if="curriculum?.core?.length">
              <p class="text-sm font-medium mb-1">Core Subjects</p>
              <p class="text-xs text-muted mb-2">These subjects are mandatory and automatically assigned.</p>
              <div class="flex flex-wrap gap-2">
                <UBadge v-for="s in curriculum.core" :key="s.id" variant="outline" color="neutral" :label="s.name" />
              </div>
            </div>

            <!-- OPTIONAL SUBJECTS -->
            <div
              v-for="group in curriculum?.options || []"
              :key="group.groupId"
              class="border-t pt-3 border-gray-200 space-y-2"
            >
              <div class="flex justify-between items-center">
                <p class="font-medium text-sm">{{ group.name }}</p>
                <UBadge
                  :color="optionError(group) && submitted ? 'error' : 'neutral'"
                  variant="soft"
                  :label="`${selectedOptionsByGroup[group.groupId]?.length || 0} / ${group.select}`"
                />
              </div>

              <p class="text-xs text-muted">Please select exactly {{ group.select }} subject(s) from this group.</p>

              <USelect
                :items="group.list.map((s: any) => ({ label: s.name, value: s.id }))"
                :multiple="group.select > 1"
                :model-value="getGroupModelValue(group)"
                @update:model-value="val => updateGroupSelection(group, val)"
                :placeholder="group.select === 1 ? 'Select one subject' : `Select up to ${group.select} subjects`"
                :disabled="isLoading"
                class="w-full"
              />

              <p v-if="submitted && optionError(group)" class="text-xs text-red-500">
                You must select exactly {{ group.select }} subject(s).
              </p>
            </div>
          </template>
        </div>

        <!-- ACADEMIC NUMBER -->
        <UFormField required label="Academic Number" name="academicNumber"
          help="Enter the unique academic registration number for the student.">
          <UInput v-model="state.academicNumber" :disabled="isLoading" placeholder="e.g. STD-2026-001" class="w-full" />
        </UFormField>

      </UForm>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex gap-3">
        <UButton label="Save" icon="lucide:save" :loading="isLoading" @click="formRef?.submit()" />
        <UButton label="Cancel" variant="outline" :disabled="isLoading" @click="close" />
      </div>
    </template>
  </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref, computed, watch } from 'vue'

const store = useStudentStore()
const classSession = useClassSessionStore()
const parentStore = useParentStore()
const toast = useToast()

const open = ref(false)
const isLoading = ref(false)
const submitted = ref(false)
const formRef = ref<any>(null)

// Parent loading state
const parentsLoading = ref(false)
const parentLoadError = ref(false)

// Curriculum loading state
const curriculum = ref<any>(null)
const curriculumLoading = ref(false)
const curriculumLoadError = ref(false)

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
  parentId: '',
  selectedOptionIds: [] as string[]
})

const schema = yup.object({
  givenNames: yup.string().required('Given names are required'),
  familyName: yup.string().required('Family name is required'),
  academicNumber: yup.string().required('Academic number is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  gender: yup.string().required('Gender is required'),
  classId: yup.string().required('Class is required'),
  parentId: yup.string().required('Parent / Guardian is required')
})

const classes = computed(() =>
  classSession.records.map((e: any) => ({
    label: parseClassSession(e),
    value: e.id
  }))
)

const parents = computed(() =>
  parentStore.records.map((p: any) => ({
    label: `${p.givenNames} ${p.familyName}`,
    value: p.id
  }))
)

async function loadParents() {
  parentsLoading.value = true
  parentLoadError.value = false

  try {
    await parentStore.fetchAll(0, 0)
  } catch (e: any) {
    parentLoadError.value = true
    toast.add({ description: `Failed to load parents: ${e.message}`, color: 'error' })
  } finally {
    parentsLoading.value = false
  }
}

async function openSlider() {
  open.value = true
  classSession.fetchAll(0, 0)
  await loadParents()
}

async function loadCurriculum() {
  if (!state.classId) return

  curriculumLoading.value = true
  curriculumLoadError.value = false
  curriculum.value = null
  state.selectedOptionIds = []

  try {
    const session = classSession.records.find((e: any) => e.id === state.classId)
    if (!session) return

    curriculum.value = await ClassApi().getClassSubjects(
      session.clazzId,
      session.streamId || undefined
    )
  } catch (e: any) {
    curriculumLoadError.value = true
    toast.add({ description: `Failed to load subjects: ${e.message}`, color: 'error' })
  } finally {
    curriculumLoading.value = false
  }
}

watch(() => state.classId, () => {
  submitted.value = false
  loadCurriculum()
})

// -----------------------------------------------------------------------
// Subject selection helpers
// -----------------------------------------------------------------------
const selectedOptionsByGroup = computed<Record<string, string[]>>(() => {
  const map: Record<string, string[]> = {}
  curriculum.value?.options?.forEach((g: any) => {
    map[g.groupId] = state.selectedOptionIds.filter((id: string) =>
      g.list.some((s: any) => s.id === id)
    )
  })
  return map
})

function getGroupModelValue(group: any) {
  const selected = selectedOptionsByGroup.value[group.groupId] || []
  return group.select === 1 ? (selected[0] ?? null) : selected
}

function updateGroupSelection(group: any, value: any) {
  const otherIds =
    curriculum.value?.options
      .filter((g: any) => g.groupId !== group.groupId)
      .flatMap((g: any) =>
        state.selectedOptionIds.filter((id: string) =>
          g.list.some((s: any) => s.id === id)
        )
      ) || []

  const newSelection: string[] =
    group.select === 1
      ? value ? [value] : []
      : Array.isArray(value) ? value.slice(0, group.select) : []

  state.selectedOptionIds = [...otherIds, ...newSelection]
}

function optionError(group: any) {
  const selected = selectedOptionsByGroup.value[group.groupId] || []
  return selected.length !== group.select
}

const onSubmit = async () => {
  submitted.value = true
  isLoading.value = true

  try {
    await schema.validate(state)

    for (const group of curriculum.value?.options || []) {
      const selected = selectedOptionsByGroup.value[group.groupId] || []
      if (selected.length !== group.select) {
        throw new Error(`"${group.name}": select exactly ${group.select} subject(s)`)
      }
    }

    await store.create({
      ...state,
      classSessionId: state.classId
    })

    toast.add({ description: 'Student created successfully', color: 'success' })
    close()
    await store.fetchAll(1, runtimeConf().limit)

  } catch (e: any) {
    toast.add({ description: e.message, color: 'error' })
  } finally {
    isLoading.value = false
  }
}

function close() {
  open.value = false
  submitted.value = false
  curriculum.value = null
  parentLoadError.value = false
  curriculumLoadError.value = false

  Object.assign(state, {
    givenNames: '',
    familyName: '',
    academicNumber: '',
    dateOfBirth: '',
    gender: '',
    classId: '',
    parentId: '',
    selectedOptionIds: []
  })
}
</script>