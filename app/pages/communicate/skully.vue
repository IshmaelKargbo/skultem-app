<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Skully (WhatsApp)"
      subtitle="Skully answers your parents on WhatsApp and reminds them about what's coming up." />

    <div v-if="loading" class="grid gap-3 sm:grid-cols-2">
      <USkeleton v-for="i in 2" :key="i" class="h-40 w-full rounded-lg" />
    </div>

    <template v-else-if="view">
      <div class="grid gap-3 sm:grid-cols-2">
        <UCard>
          <p class="text-sm text-muted">Reminder messages sent this month</p>
          <p class="mt-1 font-display text-3xl font-semibold text-highlighted">{{ view.sentThisMonth }}</p>
          <p class="mt-1 text-xs text-muted">One message a day at most per parent, with all their reminders in it.</p>
        </UCard>
        <UCard>
          <p class="text-sm text-muted">Parents who turned reminders off</p>
          <p class="mt-1 font-display text-3xl font-semibold text-highlighted">{{ view.optedOut }}</p>
          <p class="mt-1 text-xs text-muted">Parents reply STOP to Skully to turn reminders off, and START to turn them back on.</p>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <p class="font-display font-semibold">Reminders to parents</p>
          <p class="text-xs-base text-muted">Sent on WhatsApp in the morning and early afternoon, school days and weekends alike.</p>
        </template>
        <div class="divide-y divide-default">
          <div v-for="option in options" :key="option.key" class="flex items-start justify-between gap-4 py-3">
            <div class="flex items-start gap-3">
              <UIcon :name="option.icon" class="mt-0.5 size-5 text-primary" />
              <div>
                <p class="text-sm font-medium text-highlighted">{{ option.label }}</p>
                <p class="text-xs text-muted">{{ option.description }}</p>
              </div>
            </div>
            <USwitch v-model="form[option.key]" :aria-label="option.label" />
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <UButton icon="i-lucide-check" label="Save" :loading="saving" :disabled="!changed" @click="save" />
          </div>
        </template>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { SkullyApi, type SkullyReminderSettings, type SkullySettingsView } from '~/api/skully.api'

const { error: toastError } = useNotify()
const view = ref<SkullySettingsView>()
const loading = ref(true)
const saving = ref(false)
const form = reactive<SkullyReminderSettings>({ examReminders: true, eventReminders: true, feeReminders: true })

const options: { key: keyof SkullyReminderSettings, label: string, description: string, icon: string }[] = [
  {
    key: 'examReminders', label: 'Exams', icon: 'i-lucide-pencil-line',
    description: 'In the week before a child\'s first exam paper, and again the day before, with the first subjects. Needs a published exam timetable.'
  },
  {
    key: 'eventReminders', label: 'Events & holidays', icon: 'i-lucide-calendar-days',
    description: 'The day before a whole-school event or a holiday on the school calendar.'
  },
  {
    key: 'feeReminders', label: 'Fees', icon: 'i-lucide-banknote',
    description: 'In the 3 days before a fee is due, and once in the week after if it is still unpaid. Only what is still owed is mentioned.'
  }
]

const changed = computed(() => !!view.value && options.some(o => form[o.key] !== view.value!.settings[o.key]))

function take(next: SkullySettingsView) {
  view.value = next
  Object.assign(form, next.settings)
}

async function load() {
  loading.value = true
  const res = await SkullyApi().settings()
  if (res) take(res)
  loading.value = false
}

async function save() {
  saving.value = true
  try {
    take(await SkullyApi().save({ ...form }))
  } catch (err: any) {
    toastError(err?.data?.message || err?.message || 'The settings could not be saved')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  useAppStore().setTitle('Communicate · Skully')
  document.title = 'Skully | Communicate | Skultem'
  load()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
