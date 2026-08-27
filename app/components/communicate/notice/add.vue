<script setup lang="ts">
import * as yup from 'yup'

const { notice } = defineProps<{ notice?: Notice }>()

const store = useCommunicateStore()
const { success: toastSuccess, error: toastError } = useNotify()

const isEdit = computed(() => !!notice)
const open = ref(false)
const isLoading = ref(false)
const formRef = ref()

const categoryOptions = [
  { label: 'General', value: 'GENERAL' },
  { label: 'Academic', value: 'ACADEMIC' },
  { label: 'Fee', value: 'FEE' },
  { label: 'Urgent', value: 'URGENT' }
]

function defaultState() {
  return {
    title: notice?.title || '',
    content: notice?.content || '',
    category: notice?.category || 'GENERAL',
    audience: notice?.audience || 'ALL',
    expiresAt: notice?.expiresAt ? notice.expiresAt.slice(0, 10) : ''
  }
}

const state = reactive(defaultState())

const schema = yup.object({
  title: yup.string().required('Title is required'),
  content: yup.string().required('Content is required'),
  category: yup.string().required(),
  audience: yup.string().required(),
  expiresAt: yup.string().optional()
})

function close() {
  open.value = false
  Object.assign(state, defaultState())
}

async function onSubmit() {
  isLoading.value = true

  try {
    const payload = {
      title: state.title,
      content: state.content,
      category: state.category as NoticeCategory,
      audience: state.audience as Audience,
      expiresAt: state.expiresAt ? new Date(state.expiresAt).toISOString() : null
    }

    if (isEdit.value && notice) {
      await store.updateNotice({ id: notice.id, ...payload })
      toastSuccess('Notice updated successfully')
    } else {
      await store.createNotice(payload)
      toastSuccess('Notice posted successfully')
    }
    close()
  } catch (err: any) {
    toastError(err?.message || 'Something went wrong')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <USlideover :dismissible="false" v-model:open="open">
    <UButton
      v-if="isEdit"
      :icon="EDIT_ICON"
      size="xs"
      color="neutral"
      variant="ghost"
      @click="open = true"
    />
    <UButton v-else color="primary" label="Post Notice" :icon="ADD_ICON" @click="open = true" />

    <template #header>
      <div class="flex w-full items-center justify-between">
        <p class="text-lg font-semibold">{{ isEdit ? 'Edit Notice' : 'Post Notice' }}</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
<UForm
  ref="formRef"
  :schema="schema"
  :state="state"
  class="space-y-5"
  @submit="onSubmit"
>
  <!-- Title -->
  <UFormField
    label="Title"
    name="title"
    required
  >
    <UInput
      v-model="state.title"
      icon="i-lucide-megaphone"
      placeholder="e.g. PTA Meeting — Term 2"
      :disabled="isLoading"
      class="w-full"
    />
  </UFormField>

  <!-- Content -->
  <UFormField
    label="Content"
    name="content"
    required
  >
    <UTextarea
      v-model="state.content"
      :rows="5"
      placeholder="Write the notice details..."
      :disabled="isLoading"
      class="w-full"
    />
  </UFormField>

  <!-- Category -->
  <UFormField
    label="Category"
    name="category"
    required
  >
    <USelectMenu
      v-model="state.category"
      value-key="value"
      :items="categoryOptions"
      icon="i-lucide-tag"
      :disabled="isLoading"
      class="w-full"
    />
  </UFormField>

  <!-- Audience -->
  <UFormField
    label="Audience"
    name="audience"
    required
  >
    <USelectMenu
      v-model="state.audience"
      value-key="value"
      :items="audiences"
      icon="i-lucide-users"
      :disabled="isLoading"
      class="w-full"
    />
  </UFormField>

  <!-- Expiry -->
  <UFormField
    label="Expires On"
    name="expiresAt"
    hint="Optional"
  >
    <UInput
      v-model="state.expiresAt"
      type="date"
      icon="i-lucide-calendar-days"
      :disabled="isLoading"
      class="w-full"
    />
  </UFormField>
</UForm>
    </template>

    <template #footer>
      <div class="flex space-x-3">
        <UButton :icon="SAVE_ICON" :loading="isLoading" label="Save" @click="formRef?.submit()" />
        <UButton label="Cancel" variant="outline" color="neutral" :disabled="isLoading" @click="close" />
      </div>
    </template>
  </USlideover>
</template>
