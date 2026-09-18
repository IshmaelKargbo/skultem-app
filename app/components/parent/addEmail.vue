<script setup lang="ts">
import * as yup from 'yup'

const props = defineProps<{
  open: boolean
  parentId: string
  parentName: string
}>()

const emit = defineEmits<{
  'update:open': [boolean]
}>()

const store = useParentStore()
const { success: toastSuccess, error: toastError } = useNotify()

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

const email = ref('')
const loading = ref(false)

const schema = yup.object({
  email: yup.string().email('Enter a valid email address').required('Email is required')
})

function close() {
  open.value = false
  email.value = ''
}

async function submit() {
  try {
    await schema.validate({ email: email.value })
  } catch (err: any) {
    toastError(err.message)
    return
  }

  try {
    loading.value = true
    await store.addEmail(props.parentId, email.value)
    toastSuccess('Email added - the parent now has portal access')
    close()
  } catch (err: any) {
    toastError(err.message || 'Failed to add email')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Add Email</h3>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-muted">
            {{ parentName }} was enrolled without an email. Add one to grant them access to the parent portal - a
            welcome email with their login details will be sent right away.
          </p>

          <UFormField required label="Email" name="email">
            <UInput v-model="email" type="email" placeholder="e.g. parent@example.com" class="w-full"
              :disabled="loading" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Cancel" variant="soft" color="neutral" :disabled="loading" @click="close" />
            <UButton label="Add Email" :loading="loading" @click="submit" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
