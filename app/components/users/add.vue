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

const initialState = {
  givenNames: '',
  familyName: '',
  email: '',
  role: ''
}

const state = reactive({ ...initialState })

const schema = yup.object({
  givenNames: yup.string().required('Given names are required'),
  familyName: yup.string().required('Family name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.string().required('Role is required')
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

    await store.create(state)

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