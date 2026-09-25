<template>
  <USlideover
    :dismissible="false"
    :open="open"
    @update:open="open = $event"
  >
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <p class="text-lg font-semibold">Assign Role</p>

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
        <!-- User -->
        <UFormField
          label="User"
          name="user"
          required
        >
          <USelectMenu
            v-model="state.user"
            :items="users"
            value-key="value"
            class="w-full"
            disabled
          />
        </UFormField>

        <!-- Role -->
        <UFormField
          label="Role"
          name="role"
          required
        >
          <USelectMenu
            v-model="state.role"
            :items="roleOptions"
            value-key="value"
            placeholder="Select role"
            class="w-full"
          />
        </UFormField>

        <!-- Management section - only for a scopable role (Admin/Accountant/Teacher) in a school
        split into management sections; nothing to pick in a one-management school, this user is
        simply staff of the whole school. Owner-level only, same as editing the structure itself. -->
        <UFormField
          v-if="showSectionPicker"
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
            :disabled="isLoading"
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

// Only owner-level staff can hand out Super Admin (the backend enforces it too - see
// PermissionService#canGrantRole), so a plain admin isn't offered an option that would fail.
const { can } = useAuth()
const roleOptions = computed(() =>
  can([Role.OWNER, Role.PROPRIETOR]) ? roles : roles.filter(r => r.value !== Role.SUPER_ADMIN))

// Management-section assignment is owner-level too (see AssignStaffManagementSectionsUseCase) -
// and only meaningful once the school has actually split itself into sections.
const { isSectionBased, sectionOptions, load: loadStructure } = useSchoolStructure()
const showSectionPicker = computed(() =>
  can([Role.OWNER, Role.PROPRIETOR]) && isSectionBased.value && isScopableRole(state.role))

const props = defineProps<{
  modelValue: boolean
  userId: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const { success: toastSuccess, error: toastError } = useNotify()

const store = useUserStore()
const { records } = storeToRefs(store)

const formRef = ref()
const isLoading = ref(false)

const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const state = reactive({
  user: props.userId,
  role: '',
  sectionIds: [] as string[]
})

// A role change can turn the section picker off (or point it at a different set of options) -
// drop whatever was picked so a stale selection can't silently ride along.
watch(() => state.role, () => { state.sectionIds = [] })

const users = computed(() =>
  records.value.map((user) => ({
    label: `${user.givenNames} ${user.familyName} - ${user.email}`,
    value: user.id
  }))
)

const schema = yup.object({
  user: yup.string().required(),
  role: yup.string().required('Role is required'),
  sectionIds: yup.array().of(yup.string()).test(
    'section-required',
    'Select at least one management section',
    (value) => !showSectionPicker.value || !!value?.length
  )
})

watch(
  () => props.userId,
  (value) => {
    state.user = value
  },
  { immediate: true }
)

function close() {
  open.value = false

  Object.assign(state, {
    user: props.userId,
    role: '',
    sectionIds: []
  })
}

async function onSubmit() {
  try {
    isLoading.value = true

    await store.assignRole({
      userId: state.user,
      role: state.role
    })

    // The role assignment succeeded regardless of what happens next - a failure here shouldn't
    // look like the whole thing failed, just flag it separately.
    if (showSectionPicker.value && state.sectionIds.length) {
      try {
        await store.assignManagementSections(state.user, state.role, state.sectionIds)
      } catch (scopeError: any) {
        toastError(scopeError?.message || 'Role assigned, but limiting them to that management section failed - set it from their profile.')
      }
    }

    toastSuccess('Role assigned successfully')

    emit('success')

    close()
  } catch (error: any) {
    toastError(error?.message || 'Failed to assign role')
  } finally {
    isLoading.value = false
  }
}

async function fetchUsers() {
  await store.fetchAll(1, 100)
}

onMounted(() => {
  fetchUsers()
  loadStructure()
})
</script>