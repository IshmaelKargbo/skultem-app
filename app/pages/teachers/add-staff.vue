<template>
  <div class="space-y-6  p-4 md:px-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 pl-2 md:pl-0 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold">
          Add Staff
        </h1>

        <p class="mt-1 text-sm text-muted">
          Add a staff record for someone who won't be using the portal - a cleaner, cook, security
          guard, driver, or anyone else who still needs to show up in payroll and attendance.
        </p>
      </div>
    </div>

    <UAlert color="primary" variant="soft" icon="i-lucide-info" class="rounded-lg"
      title="They won't be sent login credentials"
      description="A record is still created for them under the hood - that's what payroll and attendance run off - but they're never emailed a password. If this person will log in themselves, use Add Teacher instead." />

    <UForm ref="formRef" :state="state" :schema="schema" class="space-y-6" @submit="onSubmit">

      <!-- Personal Information -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-user" class="text-primary text-2xl" />
            <div>
              <p class="font-semibold">
                Personal Information
              </p>

              <p class="text-sm text-muted hidden md:block">
                Enter the staff member's personal details.
              </p>
            </div>
          </div>
        </template>

        <div class="grid gap-5 md:grid-cols-2">

          <UFormField label="Title" name="title" required>
            <USelectMenu v-model="state.title" value-key="value" placeholder="Mr " :items="titles"
              leading-icon="i-lucide-graduation-cap" />
            <template #help>
              <p class="text-sm text-muted">
                Select the appropriate title.
              </p>
            </template>
          </UFormField>

          <UFormField label="Given Names" name="givenNames" required>
            <UInput v-model="state.givenNames" placeholder="Aruna" leading-icon="i-lucide-user" />
            <template #help>
              <p class="text-sm text-muted">
                You can enter multiple given names separated by spaces.
              </p>
            </template>
          </UFormField>

          <UFormField label="Family Name" name="familyName" required>
            <UInput v-model="state.familyName" placeholder="Kargbo" leading-icon="i-lucide-user-round" />
            <template #help>
              <p class="text-sm text-muted">
                Enter their surname or last name.
              </p>
            </template>
          </UFormField>

          <UFormField label="Gender" name="gender" required>
            <URadioGroup v-model="state.gender" variant="card" :items="genders" :ui="{
              fieldset: 'grid grid-cols-2 gap-3'
            }" />

            <template #help>
              <p class="text-sm text-muted">
                Select their gender.
              </p>
            </template>
          </UFormField>

        </div>
      </UCard>

      <!-- Contact Information -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-phone" class="text-primary text-2xl" />
            <div>
              <p class="font-semibold">
                Contact Information
              </p>

              <p class="text-sm text-muted hidden md:block">
                Used to identify their record - not shared with them for login.
              </p>
            </div>
          </div>
        </template>

        <div class="grid gap-5 md:grid-cols-2">

          <UFormField label="Email Address" name="email" required>
            <UInput v-model="state.email" placeholder="staff@example.com" leading-icon="i-lucide-mail" />
            <template #help>
              <p class="text-sm text-muted">
                Still required to create their record, even though it won't be used for login.
              </p>
            </template>
          </UFormField>

          <UFormField label="Phone Number" name="phone" required>
            <UInput v-model="state.phone" placeholder="+1234567890" leading-icon="i-lucide-phone" />
            <template #help>
              <p class="text-sm text-muted">
                Enter their phone number in international format, e.g. +1234567890.
              </p>
            </template>
          </UFormField>

          <UFormField label="City" name="city" required>
            <UInput v-model="state.city" placeholder="Freetown" leading-icon="i-lucide-map-pin" />
            <template #help>
              <p class="text-sm text-muted">
                Enter the city where they reside.
              </p>
            </template>
          </UFormField>

          <UFormField label="Street Address" name="street" required>
            <UInput v-model="state.street" placeholder="123 Main Street" leading-icon="i-lucide-map" />
            <template #help>
              <p class="text-sm text-muted">
                Enter their residential street address.
              </p>
            </template>
          </UFormField>

        </div>
      </UCard>

      <!-- Employment Information -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-briefcase" class="text-primary text-2xl" />
            <div>
              <p class="font-semibold">
                Employment Information
              </p>

              <p class="text-sm text-muted hidden md:block">
                Provide their employment details.
              </p>
            </div>
          </div>
        </template>

        <div class="grid gap-5 md:grid-cols-2">

          <UFormField label="Staff ID" name="staffId" required>
            <UInput v-model="state.staffId" placeholder="STAFF001" leading-icon="i-lucide-id-card" />
            <template #help>
              <p class="text-sm text-muted">
                Enter the unique staff ID assigned to them.
              </p>
            </template>
          </UFormField>

          <UFormField label="Designation" name="designation" required>
            <UInput v-model="state.designation" placeholder="e.g. Cleaner, Security Guard, Cook, Driver"
              leading-icon="i-lucide-briefcase" />
            <template #help>
              <p class="text-sm text-muted">
                Their job title or role.
              </p>
            </template>
          </UFormField>

        </div>
      </UCard>

      <!-- Footer -->
      <div class="flex justify-end gap-3">

        <UButton label="Cancel" color="neutral" variant="outline" to="/teachers" />

        <UButton type="submit" :loading="isLoading" icon="i-lucide-save" label="Add Staff" />

      </div>

    </UForm>

  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const teacherStore = useTeacherStore()
const { success, error } = useNotify()

const isLoading = ref(false)
const formRef = ref()

type StaffForm = {
  title: string
  givenNames: string
  familyName: string
  gender: string
  email: string
  phone: string
  city: string
  street: string
  staffId: string
  designation: string
}

const state = reactive<StaffForm>({
  title: '',
  givenNames: '',
  familyName: '',
  gender: '',
  email: '',
  phone: '',
  city: '',
  street: '',
  staffId: '',
  designation: ''
})

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

const schema = yup.object({
  title: yup.string().required('Title is required'),

  givenNames: yup
    .string()
    .required('Given names are required'),

  familyName: yup
    .string()
    .required('Family name is required'),

  gender: yup
    .string()
    .required('Gender is required'),

  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),

  phone: yup
    .string()
    .required('Phone number is required')
    .matches(
      /^\+?[1-9]\d{1,14}$/,
      'Invalid phone number format'
    ),

  city: yup
    .string()
    .required('City is required'),

  street: yup
    .string()
    .required('Street address is required'),

  staffId: yup
    .string()
    .required('Staff ID is required'),

  designation: yup
    .string()
    .required('Designation is required')
})

async function onSubmit(
  event: FormSubmitEvent<StaffForm>
) {
  isLoading.value = true

  try {
    await teacherStore.create({
      ...state,
      classMaster: '',
      sendWelcomeEmail: false,
      teaching: false
    })

    success('Staff added successfully')

    await teacherStore.fetchAll()

    await navigateTo('/teachers')
  } catch (err: any) {
    error(
      err?.message || 'Failed to add staff'
    )
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  useAppStore().setTitle('Add Staff');
  document.title = 'Add Staff | Teachers | Skultem'
})

// Missing entirely before - see teachers/index.vue's guard for why.
definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
