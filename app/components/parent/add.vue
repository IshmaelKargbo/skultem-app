<template>
  <u-slideover :dismissible="false" title="Add Parent" :open="open" @update:open="open = $event">
    <!-- Trigger button -->
    <UButton color="primary" label="Add Parent" :icon="ADD_ICON" @click="open = true" />

    <!-- Header -->
    <template #header>
      <div class="flex justify-between w-full items-center">
        <p class="text-lg font-semibold">Add Parent</p>
        <u-button :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <!-- Body / Form -->
    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit.prevent="onSubmit">

        <UFormField required label="Guardian Given Names" name="givenNames">
          <UInput v-model="state.givenNames" placeholder="e.g. Ishmael, Aruna, Rahim" :disabled="isLoading" />
          <template #help>
            <p class="text-xs text-muted">Enter the given names of the guardian.</p>
          </template>
        </UFormField>

        <UFormField required label="Guardian Family Name" name="familyName">
          <UInput v-model="state.familyName" placeholder="e.g. Kargbo, Kamara, Johnson" :disabled="isLoading" />
          <template #help>
            <p class="text-xs text-muted">Enter the family name of the guardian.</p>
          </template>
        </UFormField>

        <UFormField required label="Father Name" name="fatherName">
          <UInput v-model="state.fatherName" placeholder="e.g. Mohamed Kargbo" :disabled="isLoading" />
          <template #help>
            <p class="text-xs text-muted">Enter the father's name of the guardian.</p>
          </template>
        </UFormField>

        <UFormField required label="Mother Name" name="motherName">
          <UInput v-model="state.motherName" placeholder="e.g. Kadiatu Kargbo" :disabled="isLoading" />
          <template #help>
            <p class="text-xs text-muted">Enter the mother's name of the guardian.</p>
          </template>
        </UFormField>

        <UFormField required label="Email" name="email">
          <UInput v-model="state.email" placeholder="e.g. ishmael.kargbo@example.com" :disabled="isLoading" />
          <template #help>
            <p class="text-xs text-muted">Enter a valid email address (optional).</p>
          </template>
        </UFormField>

        <UFormField required label="Phone" name="phone">
          <UInput v-model="state.phone" placeholder="e.g. +1234567890" :disabled="isLoading" />
          <template #help>
            <p class="text-xs text-muted">Enter a valid phone number with country code (optional).</p>
          </template>
        </UFormField>

        <UFormField required label="City" name="city">
          <UInput v-model="state.city" placeholder="Enter city" :disabled="isLoading" />
          <template #help>
            <p class="text-xs text-muted">Enter the city where the guardian resides.</p>
          </template>
        </UFormField>

        <UFormField required label="Street" name="street">
          <UInput v-model="state.street" placeholder="Enter street address" :disabled="isLoading" />
          <template #help>
            <p class="text-xs text-muted">Enter the street address of the guardian.</p>
          </template>
        </UFormField>
      </UForm>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex space-x-3">
        <u-button :icon="SAVE_ICON" :loading="isLoading" label="Save" @click="formRef?.submit()" />
        <u-button label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
      </div>
    </template>
  </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const store = useParentStore()
const toast = useToast()
const isLoading = ref(false)

type ParentForm = {
  givenNames: string
  familyName: string
  fatherName: string
  motherName: string
  email: string
  phone: string
  city: string
  street: string
}

const state = reactive<ParentForm>({
  givenNames: '',
  familyName: '',
  fatherName: '',
  motherName: '',
  email: '',
  phone: '',
  city: '',
  street: ''
})

const schema = yup.object({
  givenNames: yup.string().required('Given names are required'),
  familyName: yup.string().required('Family name is required'),
  fatherName: yup.string().required('Father name is required'),
  motherName: yup.string().required('Mother name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').required('Phone is required'),
  city: yup.string().required('City is required'),
  street: yup.string().required('Street is required')
})

const formRef = ref<any>(null)
const open = ref(false)

const close = () => {
  open.value = false
  Object.keys(state).forEach((key) => (state[key as keyof ParentForm] = ''))
}

const onSubmit = async (event: FormSubmitEvent<ParentForm>) => {
  event.preventDefault()
  isLoading.value = true

  try {
    await schema.validate(state, { abortEarly: false })
    await store.create({ ...state })
    toast.add({ description: 'Parent added successfully', color: 'success' })
    store.fetchAll(0, runtimeConf().limit)
    close()
  } catch (err: any) {
    toast.add({ description: err.message, color: 'error' })
  } finally {
    isLoading.value = false
  }
}
</script>