<script setup lang="ts">
// Download button + the printable timetable it exports. Shared by the admin, teacher and parent
// timetable views, so every role gets the same PDF of whichever class is selected. The sheet itself
// (TimetableDocument) is designed on Timetable > Design; the printable copy sits off-screen and only
// exists to be captured by $generatePdf.
const props = defineProps<{
  title: string
  subtitle?: string
}>()

const store = useTimetableStore()
const settingStore = useTimetableSettingStore()
const { periods, days } = storeToRefs(store)
const { settings } = storeToRefs(settingStore)
const { school } = useSchoolInfo()
const { logoSrc, loadLogo, ready: logoReady } = useReportLogo()
const { success, error: toastError } = useNotify()

const downloading = ref(false)
const hasTimetable = computed(() => periods.value.length > 0 && days.value.length > 0)

async function download() {
  downloading.value = true
  try {
    await settingStore.fetch()
    await nextTick() // the off-screen sheet re-renders with the fetched design before it's captured
    await logoReady()
    const { $generatePdf } = useNuxtApp()
    await $generatePdf('#timetable-print', `timetable-${props.title.replace(/[^a-z0-9-_]/gi, '-')}`, {
      landscape: settings.value.orientation !== 'PORTRAIT'
    })
    success('Timetable downloaded')
  } catch (err: any) {
    toastError(err?.message || 'Failed to download timetable')
  } finally {
    downloading.value = false
  }
}

onMounted(() => {
  loadLogo()
  settingStore.fetch()
})
</script>

<template>
  <div>
    <UButton icon="i-lucide-download" color="primary" class="w-full justify-center md:w-auto"
      :loading="downloading" :disabled="!hasTimetable" @click="download">
      Download PDF
    </UButton>

    <div v-if="hasTimetable" class="pointer-events-none fixed -left-[9999px] top-0" aria-hidden="true">
      <TimetableDocument id="timetable-print" :settings="settings" :periods="periods" :days="days"
        :school-name="school?.name || 'Skultem'" :subtitle="[title, subtitle].filter(Boolean).join(' · ')"
        :logo="logoSrc" :brand-color="school?.primaryColor" />
    </div>
  </div>
</template>
