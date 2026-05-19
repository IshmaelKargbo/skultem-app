<template>
  <USlideover
    :dismissible="false"
    :open="open"
    @update:open="open = $event"
  >
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <p class="text-lg font-semibold">Assign Role</p>

        <UButton
          :icon="CLOSE_ICON"
          variant="ghost"
          @click="close"
        />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <UForm
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <!-- User -->
        <UFormField
          label="User"
          name="user"
          required
        >
          <USelectMenu
            v-model="state.user"
            :items="users"
            value-key="value"
            class="w-full"
            disabled
          />
        </UFormField>

        <!-- Role -->
        <UFormField
          label="Role"
          name="role"
          required
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
  </USlideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const props = defineProps<{
  modelValue: boolean
  userId: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const { success: toastSuccess, error: toastError } = useNotify()

const store = useUserStore()
const { records } = storeToRefs(store)

const formRef = ref()
const isLoading = ref(false)

const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const state = reactive({
  user: props.userId,
  role: ''
})

const users = computed(() =>
  records.value.map((user) => ({
    label: `${user.givenNames} ${user.familyName} - ${user.email}`,
    value: user.id
  }))
)

const schema = yup.object({
  user: yup.string().required(),
  role: yup.string().required('Role is required')
})

watch(
  () => props.userId,
  (value) => {
    state.user = value
  },
  { immediate: true }
)

function close() {
  open.value = false

  Object.assign(state, {
    user: props.userId,
    role: ''
  })
}

async function onSubmit() {
  try {
    isLoading.value = true

    await store.assignRole({
      userId: state.user,
      role: state.role
    })

    toastSuccess('Role assigned successfully')

    emit('success')

    close()
  } catch (error: any) {
    toastError(error?.message || 'Failed to assign role')
  } finally {
    isLoading.value = false
  }
}

async function fetchUsers() {
  await store.fetchAll(1, 100)
}

onMounted(fetchUsers)
</script>