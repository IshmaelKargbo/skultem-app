<script setup lang="ts">
import * as yup from 'yup'

// Edit a guardian's name, phone, address and - when they already have one - the email they log in
// with. A parent with no email gets one through "Add Email" (it also sends their login details).
const props = defineProps<{
  open: boolean
  parent: Parent
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  saved: []
}>()

const open = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})

const store = useParentStore()
const { success: toastSuccess, error: toastError } = useNotify()
const loading = ref(false)
const formRef = ref()

const state = reactive({ givenNames: '', familyName: '', phone: '', street: '', city: '', email: '' })
const hasEmail = computed(() => !!props.parent.email)

watch(() => props.open, (isOpen) => {
  if (!isOpen) return
  Object.assign(state, {
    givenNames: props.parent.givenNames ?? '',
    familyName: props.parent.familyName ?? '',
    phone: props.parent.phone ?? '',
    street: props.parent.street ?? '',
    city: props.parent.city ?? '',
    email: props.parent.email ?? ''
  })
}, { immediate: true })

const schema = yup.object({
  givenNames: yup.string().trim().min(2, 'At least 2 characters').max(100).required('Given names are required'),
  familyName: yup.string().trim().min(2, 'At least 2 characters').max(100).required('Family name is required'),
  phone: yup.string().trim().matches(/^[0-9+ ]{7,20}$/, 'Digits, spaces or + only, 7 to 20 characters').required('Phone is required'),
  street: yup.string().trim().min(5, 'At least 5 characters').max(255).required('Street is required'),
  city: yup.string().trim().min(2, 'At least 2 characters').max(100).required('City is required'),
  email: yup.string().trim().email('Enter a valid email address').max(150)
})

async function onSubmit() {
  loading.value = true
  try {
    await store.edit(props.parent.id, {
      givenNames: state.givenNames.trim(),
      familyName: state.familyName.trim(),
      phone: state.phone.trim(),
      street: state.street.trim(),
      city: state.city.trim(),
      // Only sent for a parent who already has one, and only when it actually changed.
      email: hasEmail.value && state.email.trim() !== props.parent.email ? state.email.trim() : undefined
    })
    toastSuccess('Parent updated')
    emit('saved')
    open.value = false
  } catch (err: any) {
    toastError(err?.message || 'Failed to update the parent')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <USlideover v-model:open="open" :dismissible="false" title="Edit Parent">
    <template #header>
      <div class="flex w-full items-center justify-between">
        <p class="text-lg font-semibold">Edit Parent</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" :disabled="loading" @click="open = false" />
      </div>
    </template>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="w-full space-y-4" @submit.prevent="onSubmit">
        <UFormField required label="Given Names" name="givenNames">
          <UInput v-model="state.givenNames" class="w-full" :disabled="loading" />
        </UFormField>

        <UFormField required label="Family Name" name="familyName">
          <UInput v-model="state.familyName" class="w-full" :disabled="loading" />
        </UFormField>

        <UFormField required label="Phone" name="phone" help="Also what they can sign in with. Must be unique in the school.">
          <UInput v-model="state.phone" class="w-full" :disabled="loading" />
        </UFormField>

        <UFormField v-if="hasEmail" label="Email" name="email"
          help="This is their login - changing it changes how they sign in.">
          <UInput v-model="state.email" type="email" class="w-full" :disabled="loading" />
        </UFormField>
        <UAlert v-else color="warning" variant="soft" icon="lucide:mail"
          description="No email on file. Use Add Email on the parents list to give them portal access." />

        <UFormField required label="Street" name="street">
          <UInput v-model="state.street" class="w-full" :disabled="loading" />
        </UFormField>

        <UFormField required label="City" name="city">
          <UInput v-model="state.city" class="w-full" :disabled="loading" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex gap-3">
        <UButton label="Save" icon="lucide:save" :loading="loading" @click="formRef?.submit()" />
        <UButton label="Cancel" variant="outline" color="neutral" :disabled="loading" @click="open = false" />
      </div>
    </template>
  </USlideover>
</template>
