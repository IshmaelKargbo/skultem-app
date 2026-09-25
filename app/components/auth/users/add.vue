<template>
  <u-slideover
    :dismissible="false"
    title="Add User"
    :open="open"
    @update:open="open = $event"
  >
    <!-- Trigger -->
    <UButton
      color="primary"
      label="Add User"
      :icon="ADD_ICON"
      class="hidden md:flex"
      @click="openSlider"
    />
    <!-- Trigger -->
    <UButton
      color="primary"
      class="md:hidden"
      :icon="ADD_ICON"
      @click="openSlider"
    />

    <!-- Header -->
    <template #header>
      <div class="flex justify-between items-center w-full">
        <p class="text-lg font-semibold">Add User</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" @click="close" />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <UForm
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit.prevent="onSubmit"
      >
        <!-- Given Names -->
        <UFormField
          required
          label="Given Names"
          name="givenNames"
          help="Enter the user's first and middle names."
        >
          <UInput
            v-model="state.givenNames"
            :disabled="isLoading"
            placeholder="e.g. Ishmael"
            class="w-full"
          />
        </UFormField>

        <!-- Family Name -->
        <UFormField
          required
          label="Family Name"
          name="familyName"
          help="Enter the user's surname."
        >
          <UInput
            v-model="state.familyName"
            :disabled="isLoading"
            placeholder="e.g. Kargbo"
            class="w-full"
          />
        </UFormField>

        <!-- Email -->
        <UFormField
          required
          label="Email"
          name="email"
          help="Enter the user's email address."
        >
          <UInput
            type="email"
            v-model="state.email"
            :disabled="isLoading"
            placeholder="example@email.com"
            class="w-full"
          />
        </UFormField>

        <!-- Role -->
        <UFormField
          required
          label="Role"
          name="role"
          help="Select the user's role."
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
        that's split into management sections; a one-management school has nothing to pick, this
        user is simply staff of the whole school. Owner-level only, same as editing the structure
        itself - see AssignStaffManagementSectionsUseCase. -->
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

        <UDivider />

        <!-- Payroll toggle -->
        <UFormField name="includeInPayroll">
          <UCheckbox
            v-model="state.includeInPayroll"
            :disabled="isLoading"
            label="Include this user in payroll"
            help="An account role alone doesn't put someone on payroll - turn this on if they're also paid staff (e.g. an Accountant who works at the school)."
          />
        </UFormField>

        <template v-if="state.includeInPayroll">
          <UFormField required label="Staff ID" name="staffId" help="A unique staff ID for their payroll record.">
            <UInput v-model="state.staffId" :disabled="isLoading" placeholder="STAFF001" class="w-full" />
          </UFormField>

          <UFormField required label="Designation" name="designation" help="Their job title or role.">
            <UInput v-model="state.designation" :disabled="isLoading" placeholder="e.g. Accountant, Bursar"
              class="w-full" />
          </UFormField>

          <UFormField required label="Title" name="title">
            <USelectMenu v-model="state.title" :items="titles" value-key="value" :disabled="isLoading"
              placeholder="Select title" class="w-full" />
          </UFormField>

          <UFormField required label="Gender" name="gender">
            <URadioGroup v-model="state.gender" variant="card" :items="genders" :disabled="isLoading" :ui="{
              fieldset: 'grid grid-cols-2 gap-3'
            }" />
          </UFormField>

          <UFormField required label="Phone Number" name="phone">
            <UInput v-model="state.phone" :disabled="isLoading" placeholder="+1234567890" class="w-full" />
          </UFormField>

          <UFormField required label="City" name="city">
            <UInput v-model="state.city" :disabled="isLoading" placeholder="Freetown" class="w-full" />
          </UFormField>

          <UFormField required label="Street Address" name="street">
            <UInput v-model="state.street" :disabled="isLoading" placeholder="123 Main Street" class="w-full" />
          </UFormField>
        </template>
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
  </u-slideover>
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

const { error: toastError, success: toastSuccess } = useNotify()

const open = ref(false)
const isLoading = ref(false)
const submitted = ref(false)

const store = useUserStore()
const formRef = ref()

const titles = [
  { label: 'Mr', value: 'MR' },
  { label: 'Mrs', value: 'MRS' },
  { label: 'Miss', value: 'MISS' },
  { label: 'Ms', value: 'MS' },
  { label: 'Dr', value: 'DR' },
  { label: 'Prof', value: 'PROF' }
]

const genders = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' }
]

const initialState = {
  givenNames: '',
  familyName: '',
  email: '',
  role: '',
  sectionIds: [] as string[],
  includeInPayroll: false,
  staffId: '',
  designation: '',
  title: '',
  gender: '',
  phone: '',
  city: '',
  street: ''
}

const state = reactive({ ...initialState })

// A role change can turn the section picker off (or point it at a different set of options) -
// drop whatever was picked so a stale selection can't silently ride along.
watch(() => state.role, () => { state.sectionIds = [] })

const schema = yup.object({
  givenNames: yup.string().required('Given names are required'),
  familyName: yup.string().required('Family name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.string().required('Role is required'),
  sectionIds: yup.array().of(yup.string()).test(
    'section-required',
    'Select at least one management section',
    (value) => !showSectionPicker.value || !!value?.length
  ),

  staffId: yup.string().when('includeInPayroll', {
    is: true,
    then: s => s.required('Staff ID is required')
  }),
  designation: yup.string().when('includeInPayroll', {
    is: true,
    then: s => s.required('Designation is required')
  }),
  title: yup.string().when('includeInPayroll', {
    is: true,
    then: s => s.required('Title is required')
  }),
  gender: yup.string().when('includeInPayroll', {
    is: true,
    then: s => s.required('Gender is required')
  }),
  phone: yup.string().when('includeInPayroll', {
    is: true,
    then: s => s.required('Phone number is required').matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  }),
  city: yup.string().when('includeInPayroll', {
    is: true,
    then: s => s.required('City is required')
  }),
  street: yup.string().when('includeInPayroll', {
    is: true,
    then: s => s.required('Street address is required')
  })
})

function openSlider() {
  open.value = true
  loadStructure()
}

function close() {
  open.value = false
  submitted.value = false
  Object.assign(state, initialState)
}

async function onSubmit() {
  try {
    isLoading.value = true

    const res: any = await store.create({ ...state })
    const userId = res?.data?.id

    // A section pick only makes it here once the account itself exists - a failure at this step
    // shouldn't look like the whole thing failed (the user IS created), just flag it separately.
    if (showSectionPicker.value && state.sectionIds.length && userId) {
      try {
        await store.assignManagementSections(userId, state.role, state.sectionIds)
      } catch (scopeError: any) {
        toastError(scopeError?.message || 'User created, but limiting them to that management section failed - set it from their profile.')
      }
    }

    toastSuccess('User created successfully')
    store.fetchAll(1, runtimeConf().limit)
    close()
  } catch (error: any) {
    toastError(error?.message || 'Failed to create user')
  } finally {
    isLoading.value = false
  }
}
</script>
