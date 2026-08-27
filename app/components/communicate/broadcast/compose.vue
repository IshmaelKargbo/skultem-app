<script setup lang="ts">
import * as yup from 'yup'

const store = useCommunicateStore()
const { success: toastSuccess, error: toastError } = useNotify()

const isLoading = ref(false)
const formRef = ref()
const lastSent = ref<Broadcast>()

const sendOptions = [
  { label: 'Send Now', value: 'NOW' },
  { label: 'Schedule', value: 'SCHEDULE' }
]

function defaultState() {
  return {
    title: '',
    message: '',
    audience: 'ALL' as Audience,
    channels: ['SMS'] as BroadcastChannel[],
    sendOption: 'NOW' as 'NOW' | 'SCHEDULE',
    scheduledAt: ''
  }
}

const state = reactive(defaultState())

const recipientsPreview = ref(0)
const recipientsLoading = ref(false)

async function refreshRecipientsPreview() {
  recipientsLoading.value = true
  try {
    recipientsPreview.value = await BroadcastApi().getAudienceSize(state.audience) || 0
  } finally {
    recipientsLoading.value = false
  }
}

watch(() => state.audience, refreshRecipientsPreview, { immediate: true })

const schema = yup.object({
  title: yup.string().required('Title is required'),
  message: yup.string().required('Message is required').max(480, 'Keep messages under 480 characters'),
  audience: yup.string().required(),
  channels: yup.array().min(1, 'Select at least one channel').required(),
  sendOption: yup.string().required(),
  scheduledAt: yup.string().when('sendOption', {
    is: 'SCHEDULE',
    then: s => s.required('Choose a date and time to schedule')
  })
})

function toggleChannel(value: BroadcastChannel) {
  const index = state.channels.indexOf(value)
  if (index === -1) {
    state.channels.push(value)
  } else {
    state.channels.splice(index, 1)
  }
}

function reset() {
  Object.assign(state, defaultState())
  formRef.value?.clear?.()
}

async function onSubmit() {
  isLoading.value = true

  try {
    const broadcast = await store.composeBroadcast({
      title: state.title,
      message: state.message,
      audience: state.audience,
      channels: state.channels,
      sendOption: state.sendOption,
      scheduledAt: state.sendOption === 'SCHEDULE' ? new Date(state.scheduledAt).toISOString() : null
    })

    lastSent.value = broadcast
    toastSuccess(state.sendOption === 'NOW' ? 'Broadcast sent successfully' : 'Broadcast scheduled successfully')
    reset()
  } catch (err: any) {
    toastError(err?.message || 'Something went wrong')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
    <!-- Composer -->
    <UCard class="overflow-hidden border-default/70 shadow-sm" :ui="{ body: 'sm:p-0 p-0' }">
      <!-- Header -->
      <div class="border-b border-default px-5 py-4 sm:px-6">
        <div class="flex items-center justify-between gap-4">
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <UIcon :name="BROADCAST_ICON" class="size-5 text-primary" />
            </div>

            <div class="min-w-0">
              <h2 class="font-semibold text-highlighted">
                Compose Broadcast
              </h2>

              <p class="mt-0.5 text-xs text-muted">
                Send an announcement to your school community.
              </p>
            </div>
          </div>

          <UBadge color="neutral" variant="subtle" class="hidden sm:flex">
            {{ state.sendOption === 'NOW' ? 'Send now' : 'Scheduled' }}
          </UBadge>
        </div>
      </div>

      <div class="">
        <UForm ref="formRef" :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">

          <div class="p-5 space-y-4">
            <!-- Title -->
            <UFormField label="Title" name="title" required>
              <UInput v-model="state.title" icon="i-lucide-heading" placeholder="e.g. Term 2 Resumption Notice"
                :disabled="isLoading" class="w-full" size="lg" />
            </UFormField>

            <!-- Message -->
            <UFormField label="Message" name="message" required>
              <UTextarea v-model="state.message" :rows="7" placeholder="Write your broadcast message..."
                :disabled="isLoading" class="w-full" />

              <template #hint>
                <span class="text-xs" :class="state.message.length > 450
                  ? 'text-warning'
                  : 'text-muted'">
                  {{ state.message.length }} / 480
                </span>
              </template>
            </UFormField>

            <!-- Audience -->
            <UFormField label="Audience" name="audience" required>
              <USelectMenu v-model="state.audience" value-key="value" :items="audiences" icon="i-lucide-users"
                :disabled="isLoading" class="w-full" size="lg" />
            </UFormField>

            <!-- Channels -->
            <UFormField label="Delivery Channels" name="channels" required>
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button v-for="channel in broadcastChannels" :key="channel.value" type="button" :disabled="isLoading"
                  class="group relative flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition-all duration-200"
                  :class="state.channels.includes(channel.value as BroadcastChannel)
                      ? 'border-primary bg-primary/5 text-primary shadow-sm'
                      : 'border-default bg-default hover:border-primary/30 hover:bg-muted/30'
                    " @click="toggleChannel(channel.value as BroadcastChannel)">
                  <UCheckbox :model-value="state.channels.includes(channel.value as BroadcastChannel)
                    " class="pointer-events-none absolute right-2 top-2" />

                  <UIcon :name="channel.icon || 'i-lucide-send'"
                    class="size-5 transition-transform group-hover:scale-110" />

                  <span class="text-xs font-medium">
                    {{ channel.label }}
                  </span>
                </button>
              </div>
            </UFormField>

            <!-- Delivery -->
            <UFormField label="Delivery" name="sendOption" required>
              <URadioGroup v-model="state.sendOption" :items="sendOptions" variant="card" orientation="horizontal"
                :disabled="isLoading" class="w-full" />
            </UFormField>

            <!-- Schedule -->
            <UFormField v-if="state.sendOption === 'SCHEDULE'" label="Schedule For" name="scheduledAt" required>
              <UInput v-model="state.scheduledAt" type="datetime-local" icon="i-lucide-calendar-clock"
                :disabled="isLoading" class="w-full" size="lg" />
            </UFormField>
          </div>
          <!-- Actions -->
          <div
            class="flex flex-col-reverse gap-3 border-t border-default p-4 sm:flex-row sm:items-center sm:justify-between">
            <UButton label="Reset" variant="ghost" color="neutral" :disabled="isLoading" @click="reset" />

            <UButton :icon="state.sendOption === 'NOW'
                ? BROADCAST_ICON
                : 'i-lucide-clock'
              " :label="state.sendOption === 'NOW'
                ? 'Send Broadcast'
                : 'Schedule Broadcast'
              " :loading="isLoading" size="lg" class="justify-center sm:min-w-48" @click="formRef?.submit()" />
          </div>
        </UForm>
      </div>
    </UCard>

    <!-- Sidebar -->
    <div class="space-y-5">

      <!-- Reach -->
      <UCard class="overflow-hidden border-primary/20" :ui="{ body: 'p-0' }">
        <div class="p-5 sm:p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-muted">
                Estimated Reach
              </p>

              <p class="mt-2 text-4xl font-bold tracking-tight text-highlighted">
                <USkeleton v-if="recipientsLoading" class="h-9 w-16" />
                <template v-else>{{ recipientsPreview }}</template>
              </p>

              <p class="mt-1 text-sm text-muted">
                potential recipients
              </p>
            </div>

            <div class="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
              <UIcon name="i-lucide-users" class="size-6 text-primary" />
            </div>
          </div>

          <div class="mt-5 rounded-xl bg-muted px-3 py-2.5">
            <div class="flex items-center justify-between gap-3">
              <span class="text-xs text-muted">
                Audience
              </span>

              <span class="truncate text-xs font-medium text-highlighted">
                {{ audienceLabel(state.audience) }}
              </span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Delivery summary -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-send" class="size-4 text-primary" />

            <h3 class="font-semibold">
              Delivery Summary
            </h3>
          </div>
        </template>

        <div class="space-y-4">

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">
              Channels
            </span>

            <span class="text-sm font-medium">
              {{ state.channels.length }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">
              Delivery
            </span>

            <UBadge :color="state.sendOption === 'NOW' ? 'success' : 'primary'" variant="soft">
              {{ state.sendOption === 'NOW' ? 'Immediately' : 'Scheduled' }}
            </UBadge>
          </div>

          <div v-if="state.sendOption === 'SCHEDULE' && state.scheduledAt"
            class="flex items-center justify-between gap-3">
            <span class="text-sm text-muted">
              Scheduled
            </span>

            <span class="text-right text-sm font-medium">
              {{ state.scheduledAt }}
            </span>
          </div>

        </div>
      </UCard>

      <!-- Last Broadcast -->
      <UCard v-if="lastSent">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <div class="flex size-8 items-center justify-center rounded-lg bg-success/10">
                <UIcon name="i-lucide-check" class="size-4 text-success" />
              </div>

              <h3 class="font-semibold">
                Last Broadcast
              </h3>
            </div>

            <UBadge :color="broadcastStatusStyle[lastSent.status].color" variant="soft" size="xs">
              {{ broadcastStatusStyle[lastSent.status].label }}
            </UBadge>
          </div>
        </template>

        <div>
          <p class="font-medium text-highlighted">
            {{ lastSent.title }}
          </p>

          <p class="mt-1.5 text-sm leading-5 text-muted line-clamp-2">
            {{ lastSent.message }}
          </p>

          <div class="mt-4 flex items-center gap-2">
            <div class="flex items-center gap-1.5 text-xs text-muted">
              <UIcon name="i-lucide-users" class="size-3.5" />

              {{ lastSent.recipientsCount }} recipients
            </div>
          </div>

          <UButton to="/communicate/broadcast/history" label="View History" variant="link" size="sm" class="mt-3 px-0"
            trailing-icon="i-lucide-arrow-right" />
        </div>
      </UCard>

    </div>
  </div>
</template>
