<template>
  <USlideover
    :dismissible="false"
    :open="open"
    @update:open="open = $event"
  >
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <p class="text-lg font-semibold">Manage Sections</p>
          <p class="text-xs text-muted">{{ userName }}</p>
        </div>

        <UButton
          :icon="CLOSE_ICON"
          variant="ghost"
          @click="close"
        />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <UForm
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <!-- Which of this user's scopable roles is being edited - most users only hold one, but a
        role that's also Accountant on the side needs its own scope. -->
        <UFormField
          v-if="roleOptions.length > 1"
          required
          label="Role"
          name="role"
        >
          <USelectMenu
            v-model="state.role"
            :items="roleOptions"
            value-key="value"
            :disabled="loading"
            class="w-full"
          />
        </UFormField>

        <UFormField name="wholeSchool">
          <UCheckbox
            v-model="state.wholeSchool"
            :disabled="loading"
            label="Whole-school access"
            help="They'll see and work with every section's data under this role, not just one."
          />
        </UFormField>

        <UFormField
          v-if="!state.wholeSchool"
          required
          label="Management Section"
          name="sectionIds"
          help="Which part of the school will they manage? They'll only see and work with that section's data."
        >
          <USelectMenu
            v-model="state.sectionIds"
            :items="sectionOptions"
            value-key="value"
            multiple
            :disabled="loading"
            placeholder="Select management section(s)"
            class="w-full"
          />
        </UFormField>
      </UForm>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex gap-3">
        <UButton
          label="Save"
          icon="lucide:save"
          :loading="isLoading"
          :disabled="loading"
          @click="formRef?.submit()"
        />

        <UButton
          label="Cancel"
          variant="outline"
          :disabled="isLoading"
          @click="close"
        />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const props = defineProps<{
  modelValue: boolean
  userId: string
  userName: string
  // The scopable roles (Admin/Accountant/Teacher) this user currently holds - what to offer editing.
  roles: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const { success: toastSuccess, error: toastError } = useNotify()
const store = useUserStore()
const { sectionOptions, load: loadStructure } = useSchoolStructure()

const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const formRef = ref()
const isLoading = ref(false)
const loading = ref(false)

const roleOptions = computed(() => props.roles.map(r => ({ label: parseRole[r] || r, value: r })))

const state = reactive({
  role: '',
  wholeSchool: true,
  sectionIds: [] as string[]
})

// This user's current scope per role, as returned by the backend - a role missing from the map (or
// present with an empty list) means whole-school access under that role.
const currentScopes = ref<Record<string, string[]>>({})

function applyRole(role: string) {
  const sections = currentScopes.value[role] ?? []
  state.sectionIds = [...sections]
  state.wholeSchool = sections.length === 0
}

watch(() => state.role, (role) => { if (role) applyRole(role) })

const schema = yup.object({
  role: yup.string().required(),
  sectionIds: yup.array().of(yup.string()).test(
    'section-required',
    'Select at least one management section',
    (value) => state.wholeSchool || !!value?.length
  )
})

async function load() {
  loading.value = true
  try {
    const [scopes] = await Promise.all([
      store.getManagementSections(),
      loadStructure()
    ])

    currentScopes.value = Object.fromEntries(
      (scopes ?? [])
        .filter(s => s.userId === props.userId)
        .map(s => [s.role, s.sectionIds])
    )

    state.role = props.roles[0] ?? ''
    applyRole(state.role)
  } catch (err: any) {
    toastError(err?.message || 'Failed to load current section access')
  } finally {
    loading.value = false
  }
}

watch(open, (value) => { if (value) load() })

function close() {
  open.value = false
}

async function onSubmit() {
  try {
    isLoading.value = true

    await store.assignManagementSections(props.userId, state.role, state.wholeSchool ? [] : state.sectionIds)

    toastSuccess('Section access updated successfully')
    emit('success')
    close()
  } catch (error: any) {
    toastError(error?.message || 'Failed to update section access')
  } finally {
    isLoading.value = false
  }
}
</script>
