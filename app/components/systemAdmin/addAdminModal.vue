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

const state = reactive({ givenNames: '', familyName: '', email: '', password: '', role: 'OWNER' })
const roles = ref<PlatformRoleInfo[]>([])
const showPassword = ref(false)
const selectedRole = computed(() => roles.value.find(r => r.role === state.role))

// A readable one-off password: they are expected to change it after the first sign-in.
function generatePassword() {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint32Array(14))
  state.password = Array.from(bytes, b => chars[b % chars.length]).join('')
  showPassword.value = true
}
const submitting = ref(false)

const schema = yup.object({
  givenNames: yup.string().required('Given names are required'),
  familyName: yup.string().required('Family name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required')
})

watch(open, async (value) => {
  if (!value) return
  Object.assign(state, { givenNames: '', familyName: '', email: '', password: '', role: 'OWNER' })
  showPassword.value = false
  // Choosing a role needs permission to manage roles; without it the list stays empty and they are added as an owner.
  roles.value = (await PlatformApi().roles().catch(() => undefined))?.roles ?? []
})

async function submit() {
  submitting.value = true
  try {
    const res = await store.addAdmin({ ...state, role: roles.value.length ? state.role : undefined })
    if (!res) return

    toastSuccess(`${state.givenNames} ${state.familyName} is now a system admin${selectedRole.value ? ` (${selectedRole.value.label})` : ''}`)
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
  <USlideover v-model:open="open" side="right" :ui="{ content: 'max-w-lg' }">
    <template #content>
      <div class="flex h-full flex-col bg-default">
        <header class="flex items-center justify-between gap-3 border-b border-default p-4">
          <div class="flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><UIcon name="i-lucide-user-plus" class="size-5" /></span>
            <div>
              <h3 class="text-lg font-semibold">Add system admin</h3>
              <p class="text-sm text-muted">Choose what they can do on the platform.</p>
            </div>
          </div>
          <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" aria-label="Close" @click="open = false" />
        </header>

        <UForm id="add-admin-form" :schema="schema" :state="state" class="flex-1 space-y-5 overflow-y-auto p-4" @submit="submit">
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField name="givenNames" label="Given names">
              <UInput v-model="state.givenNames" size="lg" placeholder="e.g. Aminata" class="w-full" />
            </UFormField>
            <UFormField name="familyName" label="Family name">
              <UInput v-model="state.familyName" size="lg" placeholder="e.g. Kamara" class="w-full" />
            </UFormField>
          </div>
          <UFormField name="email" label="Email">
            <UInput v-model="state.email" size="lg" type="email" icon="i-lucide-mail" placeholder="name@example.com" class="w-full" />
          </UFormField>

          <!-- Role -->
          <div v-if="roles.length" class="space-y-2">
            <p class="text-sm font-medium text-highlighted">Role</p>
            <div class="space-y-2">
              <button v-for="r in roles" :key="r.role" type="button" class="w-full rounded-xl border p-3 text-left transition"
                :class="state.role === r.role ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-default hover:border-primary/50'"
                @click="state.role = r.role">
                <span class="flex items-center justify-between gap-2">
                  <span class="text-sm font-semibold" :class="state.role === r.role ? 'text-primary' : 'text-highlighted'">{{ r.label }}</span>
                  <span class="flex items-center gap-2 text-[11px] text-muted">
                    {{ r.permissions.length }} areas{{ r.custom ? ' · Custom' : '' }}
                    <UIcon v-if="state.role === r.role" name="i-lucide-circle-check" class="size-4 text-primary" />
                  </span>
                </span>
                <span class="mt-0.5 block text-xs text-muted">{{ r.description }}</span>
              </button>
            </div>
            <p v-if="selectedRole?.role === 'OWNER'" class="flex items-center gap-1.5 text-xs text-warning">
              <UIcon name="i-lucide-triangle-alert" class="size-3.5 shrink-0" />Owners can do everything, including managing other admins and roles.
            </p>
          </div>

          <UFormField name="password" label="Initial password" hint="At least 8 characters">
            <UInput v-model="state.password" size="lg" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="At least 8 characters" class="w-full"
              :ui="{ trailing: 'pe-1' }">
              <template #trailing>
                <UButton size="xs" color="neutral" variant="link" :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" aria-label="Show or hide password" @click="showPassword = !showPassword" />
              </template>
            </UInput>
            <UButton size="xs" variant="link" icon="i-lucide-wand-sparkles" label="Generate one" class="mt-1 px-0" @click="generatePassword" />
          </UFormField>
        </UForm>

        <footer class="flex justify-end gap-2 border-t border-default p-4">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="open = false" />
          <UButton type="submit" form="add-admin-form" label="Add admin" icon="i-lucide-user-plus" :loading="submitting" />
        </footer>
      </div>
    </template>
  </USlideover>
</template>
