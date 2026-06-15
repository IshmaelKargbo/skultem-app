<template>
  <div class="space-y-6 mt-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold">
          Add Teacher
        </h1>

        <p class="mt-1 text-sm text-muted">
          Create a teacher profile and assign responsibilities.
        </p>
      </div>
    </div>

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

              <p class="text-sm text-muted">
                Enter the teacher's personal details.
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
                Select the appropriate title for the teacher.
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
                Enter the teacher's surname or last name.
              </p>
            </template>
          </UFormField>

          <UFormField label="Gender" name="gender" required>
            <URadioGroup v-model="state.gender" variant="card" :items="genders" :ui="{
              fieldset: 'grid grid-cols-2 gap-3'
            }" />

            <template #help>
              <p class="text-sm text-muted">
                Select the teacher's gender.
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

              <p class="text-sm text-muted">
                Provide the teacher's contact details for communication and account access.
              </p>
            </div>
          </div>
        </template>

        <div class="grid gap-5 md:grid-cols-2">

          <UFormField label="Email Address" name="email" required>
            <UInput v-model="state.email" placeholder="teacher@example.com" leading-icon="i-lucide-mail" />
            <template #help>
              <p class="text-sm text-muted">
                Enter the teacher's email address. This will be used for login and communication.
              </p>
            </template>
          </UFormField>

          <UFormField label="Phone Number" name="phone" required>
            <UInput v-model="state.phone" placeholder="+1234567890" leading-icon="i-lucide-phone" />
            <template #help>
              <p class="text-sm text-muted">
                Enter the teacher's phone number in international format, e.g. +1234567890.
              </p>
            </template>
          </UFormField>

          <UFormField label="City" name="city" required>
            <UInput v-model="state.city" placeholder="Freetown" leading-icon="i-lucide-map-pin" />
            <template #help>
              <p class="text-sm text-muted">
                Enter the city where the teacher resides.
              </p>
            </template>
          </UFormField>

          <UFormField label="Street Address" name="street" required>
            <UInput v-model="state.street" placeholder="123 Main Street" leading-icon="i-lucide-map" />
            <template #help>
              <p class="text-sm text-muted">
                Enter the teacher's residential street address.
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

              <p class="text-sm text-muted">
                Provide the teacher's employment details.
              </p>
            </div>
          </div>
        </template>

        <div class="grid gap-5 md:grid-cols-2">

          <UFormField label="Staff ID" name="staffId" required>
            <UInput v-model="state.staffId" placeholder="STAFF001" leading-icon="i-lucide-id-card" />
            <template #help>
              <p class="text-sm text-muted">
                Enter the unique staff ID assigned to the teacher.
              </p>
            </template>
          </UFormField>


          <UFormField label="Class Master" name="classMaster">
            <USelectMenu v-model="state.classMaster" :items="classes" value-key="value" placeholder="Select class"
              leading-icon="i-lucide-school" />
            <template #help>
              <p class="text-sm text-muted">
                Assign the teacher as a class master for a specific class, if applicable.
              </p>
            </template>
          </UFormField>
        </div>
      </UCard>


      <!-- Footer -->
      <div class="flex justify-end gap-3">

        <UButton label="Cancel" color="neutral" variant="outline" to="/teachers" />

        <UButton type="submit" :loading="isLoading" icon="i-lucide-save" label="Create Teacher" />

      </div>

    </UForm>

  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const teacherStore = useTeacherStore()
const classStore = useClassSessionStore()
const { success, error } = useNotify()

const isLoading = ref(false)
const formRef = ref()

type TeacherForm = {
  title: string
  givenNames: string
  familyName: string
  gender: string
  email: string
  phone: string
  city: string
  street: string
  staffId: string
  classMaster: string
}

const state = reactive<TeacherForm>({
  title: '',
  givenNames: '',
  familyName: '',
  gender: '',
  email: '',
  phone: '',
  city: '',
  street: '',
  staffId: '',
  classMaster: ''
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

const classes = ref<{ label: string; value: string }[]>([])

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
    .required('Staff ID is required')
})

async function onSubmit(
  event: FormSubmitEvent<TeacherForm>
) {
  isLoading.value = true

  try {
    await teacherStore.create({
      ...state
    })

    success('Teacher created successfully')

    await teacherStore.fetchAll()

    await navigateTo('/teachers')
  } catch (err: any) {
    error(
      err?.message || 'Failed to create teacher'
    )
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  const res = await classStore.fetchAllUnassign(0, 0)

  if (!res) return

  classes.value = res.map((c: ClassSession) => {
    let name = c.clazz

    if (c.streamName) {
      name = `${name} (${c.streamName})`
    }

    return {
      label: name,
      value: c.id
    }
  })
})

onMounted(() => {
  useAppStore().setTitle('Add Teachers');
  document.title = 'Teachers | Skultem'
})
</script>
