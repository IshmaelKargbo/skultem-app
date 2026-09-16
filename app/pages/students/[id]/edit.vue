<template>
  <div class="space-y-6 p-4 md:px-6">
    <Heading title="Edit Student" subtitle="Update the student's personal information.">
      <div class="md:w-auto w-full items-center space-x-2 flex">
        <UButton label="Back" :to="`/students/${id}`" :icon="BACK_ICON" variant="outline" color="neutral" />
        <UButton @click="formRef.submit()" :loading="isLoading" :trailing-icon="SAVE_ICON" label="Save Changes" />
      </div>
    </Heading>

    <UForm ref="formRef" :state="state" :schema="schema" class="space-y-6" @submit="onSubmit">
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-user" class="text-primary text-2xl" />
            <div>
              <p class="font-semibold">Personal Information</p>
              <p class="text-sm text-muted">Update the student's basic details.</p>
            </div>
          </div>
        </template>

        <div class="grid gap-5 md:grid-cols-2">
          <UFormField label="Admission Number" name="admissionNumber" required>
            <UInput v-model="state.admissionNumber" placeholder="Enter admission number" :leading-icon="ID_CARD_ICON" />
          </UFormField>

          <UFormField label="Given Names" name="givenNames" required>
            <UInput v-model="state.givenNames" placeholder="Enter given names" :leading-icon="USER_ICON" />
          </UFormField>

          <UFormField label="Family Name" name="familyName" required>
            <UInput v-model="state.familyName" placeholder="Enter family name" :leading-icon="USER_ICON" />
          </UFormField>

          <UFormField label="Date of Birth" name="dateOfBirth" required>
            <UInput v-model="state.dateOfBirth" type="date" :leading-icon="CALENDAR_ICON" />
          </UFormField>

          <UFormField label="Gender" name="gender" required>
            <USelectMenu v-model="state.gender" :items="genders" value-key="value" placeholder="Select gender"
              :leading-icon="GENDER_ICON" />
          </UFormField>

          <UFormField label="Nationality" name="nationality" required>
            <USelectMenu v-model="state.nationality" :items="nationalities" value-key="value"
              placeholder="Select nationality" :leading-icon="FLAG_ICON" />
          </UFormField>

          <UFormField label="Religion" name="religion" required>
            <USelectMenu v-model="state.religion" :items="religions" value-key="value" placeholder="Select religion"
              :leading-icon="BOOK_ICON" />
          </UFormField>

          <UFormField label="City" name="city" required>
            <UInput v-model="state.city" placeholder="Enter city" :leading-icon="CITY_ICON" />
          </UFormField>

          <UFormField label="Address" name="street" required>
            <UInput v-model="state.street" placeholder="Enter address" :leading-icon="ADDRESS_ICON" />
          </UFormField>
        </div>
      </UCard>

      <div class="flex justify-end gap-3">
        <UButton label="Cancel" color="neutral" variant="outline" :to="`/students/${id}`" />
        <UButton type="submit" :loading="isLoading" :trailing-icon="SAVE_ICON" label="Save Changes" />
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const store = useStudentStore()
const { success, error } = useNotify()

const id = useRoute().params.id as string

const isLoading = ref(false)
const formRef = ref()

type StudentForm = {
  admissionNumber: string
  givenNames: string
  familyName: string
  dateOfBirth: string
  gender: string
  nationality: string
  religion: string
  city: string
  street: string
}

const state = reactive<StudentForm>({
  admissionNumber: '',
  givenNames: '',
  familyName: '',
  dateOfBirth: '',
  gender: '',
  nationality: '',
  religion: '',
  city: '',
  street: ''
})

const genders = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' }
]

const religions = [
  { label: 'Christianity', value: 'CHRISTIANITY' },
  { label: 'Islam', value: 'ISLAM' },
  { label: 'Other', value: 'OTHER' }
]

const schema = yup.object({
  admissionNumber: yup.string().required('Admission number is required'),
  givenNames: yup.string().required('Given names are required'),
  familyName: yup.string().required('Family name is required'),
  dateOfBirth: yup.string().required('Date of birth is required')
    .test('is-past', 'Date of birth must be in the past', value => {
      if (!value) return false
      const dob = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return dob < today
    }),
  gender: yup.string().required('Gender is required'),
  nationality: yup.string().required('Nationality is required'),
  religion: yup.string().required('Religion is required'),
  city: yup.string().required('City is required'),
  street: yup.string().required('Address is required')
})

async function onSubmit() {
  isLoading.value = true
  try {
    await store.update(id, { ...state })
    success('Student edited successfully')
  } catch (err: any) {
    error(err?.message || 'Failed to edit student')
  } finally {
    isLoading.value = false
  }
}

async function fetchRecord() {
  try {
    if (!id) return navigateTo('/students')

    const res = await store.fetchStudent(id)
    if (!res) return

    state.admissionNumber = res.admissionNumber
    state.givenNames = res.givenNames
    state.familyName = res.familyName
    state.dateOfBirth = res.dateOfBirth ? new Date(res.dateOfBirth).toISOString().split('T')[0]! : ''
    state.gender = res.gender
    state.nationality = res.nationality
    state.religion = res.religion
    state.city = res.city
    state.street = res.street
  } catch (err: any) {
    useNotify().error(err?.message || err)
    navigateTo('/students')
  }
}

onMounted(async () => {
  useAppStore().setTitle('Edit Student')
  useAppStore().setBack(`/students/${id}`)
  document.title = 'Edit Student | Students | Skultem'

  await fetchRecord()
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
