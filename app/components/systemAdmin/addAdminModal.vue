<script setup lang="ts">
// Adds another system admin. The password is set here and passed on to them, as with the very
// first admin (see /setup) - there's no school to send a welcome email from.
import * as yup from 'yup'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean], created: [] }>()

const store = useSystemStore()
const { error: toastError, success: toastSuccess } = useNotify()

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

const state = reactive({ givenNames: '', familyName: '', email: '', password: '' })
const submitting = ref(false)

const schema = yup.object({
  givenNames: yup.string().required('Given names are required'),
  familyName: yup.string().required('Family name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required')
})

watch(open, (value) => {
  if (value) Object.assign(state, { givenNames: '', familyName: '', email: '', password: '' })
})

async function submit() {
  submitting.value = true
  try {
    const res = await store.addAdmin({ ...state })
    if (!res) return

    toastSuccess(`${state.givenNames} ${state.familyName} is now a system admin`)
    open.value = false
    emit('created')
  } catch (err: any) {
    toastError(err?.message || 'Failed to add system admin')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold">Add system admin</h3>
              <p class="text-sm text-muted">Full access across every school. Share the password with them securely.</p>
            </div>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" aria-label="Close"
              @click="open = false" />
          </div>
        </template>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="submit">
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField name="givenNames" label="Given names">
              <UInput v-model="state.givenNames" class="w-full" />
            </UFormField>
            <UFormField name="familyName" label="Family name">
              <UInput v-model="state.familyName" class="w-full" />
            </UFormField>
          </div>
          <UFormField name="email" label="Email">
            <UInput v-model="state.email" type="email" class="w-full" />
          </UFormField>
          <UFormField name="password" label="Initial password" hint="At least 8 characters">
            <UInput v-model="state.password" type="password" autocomplete="new-password" class="w-full" />
          </UFormField>

          <div class="flex justify-end gap-2">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="open = false" />
            <UButton type="submit" label="Add admin" icon="i-lucide-user-plus" :loading="submitting" />
          </div>
        </UForm>
      </UCard>
    </template>
  </UModal>
</template>
