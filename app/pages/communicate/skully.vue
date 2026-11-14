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

      <UCard v-if="insights?.enabled && insights.configured && insights.allowed">
        <template #header>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="font-display font-semibold">Insights for leadership</p>
              <p class="text-xs-base text-muted">
                Skully reads your attendance, academic and fee reports and suggests what to act on.
                <template v-if="insights.generatedAt">
                  Written {{ new Date(insights.generatedAt).toLocaleString() }}<template v-if="insights.generatedBy"> for {{ insights.generatedBy }}</template>.
                </template>
              </p>
            </div>
            <UButton icon="i-lucide-sparkles" :label="insights.brief ? 'Refresh' : 'Write brief'" variant="soft"
              :loading="refreshing" @click="refreshInsights" />
          </div>
        </template>
        <p v-if="!insights.brief" class="text-sm text-muted">No brief yet. It takes about half a minute to write.</p>
        <div v-else class="space-y-1 text-sm">
          <template v-for="(line, i) in briefLines" :key="i">
            <p v-if="line.heading" class="pt-2 font-display font-semibold text-highlighted first:pt-0">{{ line.text }}</p>
            <p v-else-if="line.bullet" class="flex gap-2 text-default"><span class="text-primary">•</span><span>{{ line.text }}</span></p>
            <p v-else-if="line.text" class="text-default">{{ line.text }}</p>
          </template>
          <p class="pt-3 text-xs text-muted">Written by AI from your school's data. Check the reports before acting on it.</p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <p class="font-display font-semibold">Reminders to parents</p>
          <p class="text-xs-base text-muted">Sent on WhatsApp every hour from 8am to 4pm, school days and weekends alike.</p>
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

      <UCard v-if="welcome">
        <template #header>
          <p class="font-display font-semibold">Welcome messages</p>
          <p class="text-xs-base text-muted">
            Every parent with a phone who has never signed in gets one WhatsApp message with how to sign in.
            {{ welcome.sent }} sent so far.
          </p>
        </template>
        <p v-if="!welcome.waiting" class="text-sm text-muted">Every parent who hasn't signed in yet has had their welcome.</p>
        <template v-else>
          <p class="mb-2 text-sm text-highlighted">{{ welcome.waiting }} {{ welcome.waiting === 1 ? 'parent hasn\'t' : 'parents haven\'t' }} had it yet</p>
          <div class="max-h-96 divide-y divide-default overflow-y-auto">
            <div v-for="p in welcome.parents" :key="p.parentId" class="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-2">
              <div class="min-w-0">
                <p class="text-sm font-medium text-highlighted">{{ p.name }}</p>
                <p class="text-xs text-muted">{{ p.phone }} · {{ p.children }}</p>
              </div>
              <p class="text-xs text-muted sm:max-w-xs sm:text-right">{{ p.reason }}</p>
            </div>
          </div>
        </template>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { SkullyApi, type SkullyInsights, type SkullyReminderSettings, type SkullySettingsView, type SkullyWelcomeTracking } from '~/api/skully.api'

const { error: toastError } = useNotify()
const view = ref<SkullySettingsView>()
const welcome = ref<SkullyWelcomeTracking>()
const insights = ref<SkullyInsights>()
const refreshing = ref(false)

const HEADINGS = ['At a glance', 'What\'s going well', 'Needs attention', 'Suggested actions this week']
const briefLines = computed(() => (insights.value?.brief ?? '').split('\n').map((raw) => {
  const line = raw.trim()
  if (HEADINGS.some(h => line.replace(/:$/, '').toLowerCase() === h.toLowerCase())) return { heading: true, bullet: false, text: line.replace(/:$/, '') }
  if (/^[-•*]\s+/.test(line)) return { heading: false, bullet: true, text: line.replace(/^[-•*]\s+/, '') }
  return { heading: false, bullet: false, text: line }
}))

async function refreshInsights() {
  refreshing.value = true
  try {
    insights.value = await SkullyApi().refreshInsights()
  } catch (err: any) {
    toastError(err?.data?.message || err?.message || 'Skully could not write the brief')
  } finally {
    refreshing.value = false
  }
}
const loading = ref(true)
const saving = ref(false)
const form = reactive<SkullyReminderSettings>({ examReminders: true, eventReminders: true, feeReminders: true, weeklySummary: true })

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
  },
  {
    key: 'weeklySummary', label: 'Weekly summary', icon: 'i-lucide-calendar-check',
    description: 'On Friday afternoon, one message per child: marks approved this week (subjects, average, highest), days present and absent, and the teacher\'s remarks. Skipped when nothing was recorded.'
  }
]

const changed = computed(() => !!view.value && options.some(o => form[o.key] !== view.value!.settings[o.key]))

function take(next: SkullySettingsView) {
  view.value = next
  Object.assign(form, next.settings)
}

async function load() {
  loading.value = true
  const [res, welcomeRes, insightsRes] = await Promise.all([SkullyApi().settings(), SkullyApi().welcome(), SkullyApi().insights()])
  if (res) take(res)
  welcome.value = welcomeRes
  insights.value = insightsRes
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
