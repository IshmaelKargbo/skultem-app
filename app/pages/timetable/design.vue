<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Timetable Design" subtitle="Customise the timetable PDF that admins, teachers and parents download.">
      <div class="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
        <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="outline" class="justify-center" @click="reset">
          Reset
        </UButton>
        <UButton icon="i-lucide-save" color="primary" :loading="saving" class="justify-center" @click="save">
          Save Settings
        </UButton>
      </div>
    </Heading>

    <TimetableSectionNav />

    <div class="grid gap-6 lg:grid-cols-5">
      <!-- Controls -->
      <div class="space-y-6 lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-palette" class="size-5 text-primary" />
              <h3 class="font-semibold">Style</h3>
            </div>
          </template>

          <div class="space-y-4">
            <UFormField label="Title">
              <UInput v-model="settings.title" placeholder="SCHOOL TIMETABLE" maxlength="80" class="w-full" />
            </UFormField>

            <UFormField label="Accent Color">
              <div class="flex items-center gap-3">
                <UInput :model-value="accentValue" type="color" class="h-10 w-14 shrink-0 p-1"
                  @update:model-value="(v: string) => (settings.accentColor = v)" />
                <UInput :model-value="settings.accentColor || ''" placeholder="School brand color"
                  class="w-full font-mono text-sm" @update:model-value="(v: string) => (settings.accentColor = v || null)" />
                <UButton v-if="settings.accentColor" icon="i-lucide-x" color="neutral" variant="ghost" size="sm"
                  title="Use school color" @click="settings.accentColor = null" />
              </div>
              <template #help>
                Title, headings, lines and subject names. Leave blank to use your school's brand color.
              </template>
            </UFormField>

            <UFormField label="Page Orientation">
              <div class="grid grid-cols-2 gap-2">
                <UButton v-for="o in orientations" :key="o.value" :icon="o.icon" :label="o.label"
                  :variant="settings.orientation === o.value ? 'solid' : 'outline'"
                  :color="settings.orientation === o.value ? 'primary' : 'neutral'" class="justify-center"
                  @click="settings.orientation = o.value" />
              </div>
              <template #help>Landscape suits 5-6 working days; portrait suits fewer days or many periods.</template>
            </UFormField>

            <UFormField label="Footer Note">
              <UInput v-model="settings.footerNote" maxlength="255" class="w-full"
                placeholder="e.g. Pupils must be seated before the bell rings." />
              <template #help>Optional line shown under the table.</template>
            </UFormField>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-layout-list" class="size-5 text-primary" />
              <h3 class="font-semibold">What to show</h3>
            </div>
          </template>

          <div class="grid gap-3">
            <label v-for="o in toggles" :key="o.key"
              class="flex cursor-pointer items-start gap-3 rounded-xl border border-default p-3.5 transition-colors hover:bg-muted/40">
              <UCheckbox :model-value="settings[o.key]" class="mt-0.5"
                @update:model-value="(v) => (settings[o.key] = !!v)" />
              <div class="flex items-start gap-2.5">
                <UIcon :name="o.icon" class="mt-0.5 size-4 shrink-0 text-muted" />
                <div>
                  <p class="text-sm font-medium">{{ o.label }}</p>
                  <p class="text-xs text-muted">{{ o.hint }}</p>
                </div>
              </div>
            </label>
          </div>
        </UCard>
      </div>

      <!-- Preview -->
      <div class="lg:sticky lg:top-6 lg:col-span-3 lg:self-start">
        <UCard :ui="{ body: 'p-0' }">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-eye" class="size-5 text-primary" />
              <h3 class="font-semibold">Live Preview</h3>
              <span class="text-xs text-muted">(sample data)</span>
            </div>
          </template>

          <div ref="viewportRef" class="preview-viewport">
            <div class="preview-frame"
              :style="{ width: `${frameWidth}px`, height: `${frameHeight}px`, margin: '0 auto' }">
              <div class="preview-scale" :style="{ width: `${docWidth}px`, transform: `scale(${scale})` }">
                <TimetableDocument id="timetable-design-preview" :settings="settings" :periods="mockPeriods"
                  :days="mockDays" :school-name="school?.name || 'Your School'" subtitle="SSS 1 (A)"
                  :logo="school?.logo || ''" :brand-color="school?.primaryColor" />
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { success, error: notifyError } = useNotify()
const store = useTimetableSettingStore()
const { settings } = storeToRefs(store)
const { school } = useSchoolInfo()

const saving = ref(false)

const orientations = [
  { value: 'LANDSCAPE', label: 'Landscape', icon: 'i-lucide-rectangle-horizontal' },
  { value: 'PORTRAIT', label: 'Portrait', icon: 'i-lucide-rectangle-vertical' }
] as const

const toggles: { key: 'showLogo' | 'showIcons' | 'showPeriodTimes' | 'showTeacher' | 'showRoom', label: string, hint: string, icon: string }[] = [
  { key: 'showLogo', label: 'School logo', hint: 'Your logo in the top-left corner', icon: 'i-lucide-image' },
  { key: 'showIcons', label: 'Decorative icons', hint: 'Clock and pencil-cup artwork in the header', icon: 'i-lucide-shapes' },
  { key: 'showPeriodTimes', label: 'Period times', hint: 'Start and end time under each period name', icon: 'i-lucide-clock' },
  { key: 'showTeacher', label: 'Teacher names', hint: 'Teacher under each subject', icon: 'i-lucide-user-round' },
  { key: 'showRoom', label: 'Rooms', hint: 'Room under each subject', icon: 'i-lucide-map-pin' }
]

// The native colour input needs a concrete #rrggbb; show the school colour (or a default) when none is set.
const accentValue = computed(() =>
  /^#[0-9a-f]{6}$/i.test(settings.value.accentColor || '')
    ? settings.value.accentColor!
    : (/^#[0-9a-f]{6}$/i.test(school.value?.primaryColor || '') ? school.value!.primaryColor! : '#2f5f96'))

// --- sample timetable for the preview ---
const mockDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
const subject = (s: string, teacher: string, room: string) => ({ subject: s, teacher, room })
const mockPeriods = [
  { id: 'p1', name: 'Period 1', startTime: '08:00', endTime: '08:40', isBreak: false, isLunch: false,
    subjects: [subject('Mathematics', 'Mr Kamara', 'Room 1'), subject('English', 'Mrs Sesay', 'Room 1'), subject('Physics', 'Mr Bangura', 'Lab'), subject('Mathematics', 'Mr Kamara', 'Room 1'), subject('Civic Education', 'Ms Conteh', 'Room 1')] },
  { id: 'p2', name: 'Period 2', startTime: '08:40', endTime: '09:20', isBreak: false, isLunch: false,
    subjects: [subject('English', 'Mrs Sesay', 'Room 1'), subject('Chemistry', 'Mr Bangura', 'Lab'), subject('Mathematics', 'Mr Kamara', 'Room 1'), subject('Biology', 'Ms Turay', 'Lab'), subject('English', 'Mrs Sesay', 'Room 1')] },
  { id: 'p3', name: 'Break', startTime: '09:20', endTime: '09:50', isBreak: true, isLunch: false, subjects: [] },
  { id: 'p4', name: 'Period 3', startTime: '09:50', endTime: '10:30', isBreak: false, isLunch: false,
    subjects: [subject('Biology', 'Ms Turay', 'Lab'), subject('Geography', 'Mr Jalloh', 'Room 1'), subject('English', 'Mrs Sesay', 'Room 1'), subject('Physics', 'Mr Bangura', 'Lab'), subject('Geography', 'Mr Jalloh', 'Room 1')] }
] as unknown as Period[]

// --- scaled preview ---
const viewportRef = ref<HTMLElement | null>(null)
const available = ref(600)
const docWidth = computed(() => (settings.value.orientation === 'PORTRAIT' ? 794 : 1123))
const scale = computed(() => Math.min(1, available.value / docWidth.value))
const docHeight = ref(800)
const frameWidth = computed(() => Math.round(docWidth.value * scale.value))
const frameHeight = computed(() => Math.round(docHeight.value * scale.value))

let observer: ResizeObserver | undefined
let raf = 0

function measure() {
  available.value = Math.max(240, (viewportRef.value?.clientWidth || 600) - 32) // minus the viewport's own padding
  const doc = document.getElementById('timetable-design-preview')
  if (doc) docHeight.value = doc.scrollHeight
}

function scheduleMeasure() {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(measure)
}

watch(settings, () => nextTick().then(scheduleMeasure), { deep: true })

async function save() {
  saving.value = true
  try {
    await store.save()
    success('Timetable design saved')
  } catch (err: any) {
    notifyError(err?.message || 'Unable to save timetable design')
  } finally {
    saving.value = false
  }
}

// Back to the defaults in the form only - nothing changes for users until Save.
function reset() {
  Object.assign(settings.value, DEFAULT_TIMETABLE_SETTING)
}

onMounted(async () => {
  useAppStore().setTitle('Timetable Design')
  document.title = 'Timetable Design | Skultem'

  observer = new ResizeObserver(scheduleMeasure)
  if (viewportRef.value) observer.observe(viewportRef.value)
  measure()

  await store.fetch(true)
  await nextTick()
  scheduleMeasure()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(raf)
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>

<style scoped>
.preview-viewport {
  overflow: hidden;
  padding: 1rem;
}

.preview-frame {
  overflow: hidden;
}

.preview-scale {
  transform-origin: top left;
}
</style>
