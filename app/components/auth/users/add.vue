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
            :items="roles"
            value-key="value"
            placeholder="Select role"
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

const schema = yup.object({
  givenNames: yup.string().required('Given names are required'),
  familyName: yup.string().required('Family name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.string().required('Role is required'),

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
}

function close() {
  open.value = false
  submitted.value = false
  Object.assign(state, initialState)
}

async function onSubmit() {
  try {
    isLoading.value = true

    await store.create({ ...state })

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
