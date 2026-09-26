<script setup lang="ts">
import * as yup from 'yup'

// hideTrigger: the caller opens it itself through v-model:open (e.g. from a mobile actions menu) instead of
// this component drawing its own Post / Edit button.
const { notice, hideTrigger = false } = defineProps<{ notice?: Notice, hideTrigger?: boolean }>()

const store = useCommunicateStore()
const { success: toastSuccess, error: toastError } = useNotify()

const isEdit = computed(() => !!notice)
const open = defineModel<boolean>('open', { default: false })
const isLoading = ref(false)
const formRef = ref()

const categoryOptions = [
  { label: 'General', value: 'GENERAL' },
  { label: 'Academic', value: 'ACADEMIC' },
  { label: 'Fee', value: 'FEE' },
  { label: 'Urgent', value: 'URGENT' },
  { label: 'Event', value: 'EVENT' }
]

function defaultState() {
  return {
    title: notice?.title || '',
    content: notice?.content || '',
    category: notice?.category || 'GENERAL',
    audience: notice?.audience || 'ALL',
    expiresAt: notice?.expiresAt ? notice.expiresAt.slice(0, 10) : '',
    // Something that happens on a date (PTA meeting, sports day): when, until, where, and whether it
    // is also put on the school calendar.
    hasEvent: !!notice?.eventAt || notice?.category === 'EVENT',
    eventAt: notice?.eventAt ? isoToSchoolLocal(notice.eventAt) : '',
    eventEndsAt: notice?.eventEndsAt ? isoToSchoolLocal(notice.eventEndsAt) : '',
    eventLocation: notice?.eventLocation || '',
    addToCalendar: notice ? notice.onCalendar : true,
    managementSectionId: notice?.managementSectionId || ''
  }
}

const state = reactive(defaultState())

const schema = yup.object({
  title: yup.string().required('Title is required'),
  content: yup.string().required('Content is required'),
  category: yup.string().required(),
  audience: yup.string().required(),
  expiresAt: yup.string().optional(),
  eventAt: yup.string().when('hasEvent', {
    is: true,
    then: s => s.required('Pick when the event takes place'),
    otherwise: s => s.optional()
  }),
  eventEndsAt: yup.string().optional().test('after-start', 'The event can\'t end before it starts', function (value) {
    if (!value || !this.parent.eventAt) return true
    return value >= this.parent.eventAt
  })
})

// Choosing the Event category turns the event details on; an Event notice can't be saved without a date.
watch(() => state.category, (c) => { if (c === 'EVENT') state.hasEvent = true })

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
      expiresAt: state.expiresAt ? new Date(state.expiresAt).toISOString() : null,
      eventAt: state.hasEvent && state.eventAt ? schoolLocalToIso(state.eventAt) : null,
      eventEndsAt: state.hasEvent && state.eventAt && state.eventEndsAt ? schoolLocalToIso(state.eventEndsAt) : null,
      eventLocation: state.hasEvent ? state.eventLocation.trim() || null : null,
      addToCalendar: state.hasEvent && state.addToCalendar,
      managementSectionId: state.managementSectionId || null
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
    <template v-if="!hideTrigger">
      <UButton
        v-if="isEdit"
        :icon="EDIT_ICON"
        size="xs"
        color="neutral"
        variant="ghost"
        @click="open = true"
      />
      <UButton v-else class="flex justify-center" color="primary" label="Post Notice" :icon="ADD_ICON" @click="open = true" />
    </template>

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

  <!-- Who: the whole school or one management section -->
  <CommunicateSectionPicker v-model="state.managementSectionId" :locked="isEdit" :disabled="isLoading" />

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

  <!-- Event: something that happens on a date, e.g. a PTA meeting or sports day -->
  <div class="space-y-4 rounded-xl border border-default p-4">
    <USwitch
      v-model="state.hasEvent"
      label="This notice is about an event"
      description="A PTA meeting, sports day, exam or trip - readers see the date, time and place."
      :disabled="isLoading || state.category === 'EVENT'"
    />

    <template v-if="state.hasEvent">
      <UFormField label="Date & time" name="eventAt" required>
        <UInput v-model="state.eventAt" type="datetime-local" icon="i-lucide-calendar-clock"
          :disabled="isLoading" class="w-full" />
      </UFormField>

      <UFormField label="Ends" name="eventEndsAt" hint="Optional">
        <UInput v-model="state.eventEndsAt" type="datetime-local" icon="i-lucide-calendar-check"
          :min="state.eventAt || undefined" :disabled="isLoading" class="w-full" />
      </UFormField>

      <UFormField label="Location" name="eventLocation" hint="Optional">
        <UInput v-model="state.eventLocation" icon="i-lucide-map-pin" placeholder="e.g. School hall"
          :disabled="isLoading" class="w-full" />
      </UFormField>

      <USwitch
        v-model="state.addToCalendar"
        label="Also add to the school calendar"
        description="Shows under Events & Holidays and stays in step if you edit or delete this notice."
        :disabled="isLoading"
      />
    </template>
  </div>

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
