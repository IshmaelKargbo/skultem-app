<!-- Download an exam timetable as a PDF in the school's design (Exam Office > Timetable > Design): a page per
     class, or the full timetable. The printable copy sits off-screen and only exists to be captured. -->
<template>
  <div>
    <UDropdownMenu v-if="!single" :items="items" :disabled="downloading || !timetable.papers.length">
      <UButton icon="i-lucide-download" :loading="downloading" :disabled="!timetable.papers.length"
        :variant="variant" color="neutral" label="Download PDF" trailing-icon="i-lucide-chevron-down" />
    </UDropdownMenu>
    <UButton v-else icon="i-lucide-download" :loading="downloading" :disabled="!timetable.papers.length"
      :variant="variant" color="neutral" label="Download PDF" @click="download('classes')" />

    <div class="pointer-events-none fixed -left-[9999px] top-0" aria-hidden="true">
      <ExamOfficeTimetableDocument :id="docId" :timetable="timetable" :design="design" :mode="mode"
        :class-ids="classIds" :school-name="school?.name || 'Skultem'" :logo="logoSrc"
        :brand-color="school?.primaryColor" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { timetable, classIds = [], single = false, variant = 'soft' } = defineProps<{
  timetable: ExamTimetable
  // Only these classes' pages (e.g. the class filter, or a parent's child); empty = every class.
  classIds?: string[]
  // One button for a class's own sheet (the parent view) instead of the page-per-class / full menu.
  single?: boolean
  variant?: 'soft' | 'outline' | 'solid'
}>()

const { design, load } = useExamTimetableDesign()
const { school } = useSchoolInfo()
const { logoSrc, loadLogo, ready: logoReady } = useReportLogo()
const { success, error: toastError } = useNotify()

const docId = `exam-timetable-print-${Math.random().toString(36).slice(2, 8)}`
const mode = ref<'classes' | 'full'>('classes')
const downloading = ref(false)

const items = computed(() => [[
  { label: classIds.length === 1 ? 'Class timetable' : 'Class timetables (a page per class)', icon: 'i-lucide-file-stack', onSelect: () => download('classes') },
  { label: 'Full timetable', icon: 'i-lucide-file-text', onSelect: () => download('full') },
]])

async function download(which: 'classes' | 'full') {
  downloading.value = true
  try {
    mode.value = which
    await load(true)
    await nextTick() // the off-screen copy re-renders with the latest design before it's captured
    await logoReady()
    const { $generatePdfPages } = useNuxtApp()
    const name = `${timetable.title}${which === 'full' ? '' : ' - classes'}`.replace(/[^a-z0-9-_ ]/gi, '').trim().replace(/\s+/g, '-')
    await $generatePdfPages(`#${docId}`, '.exam-pdf-page', name || 'exam-timetable', {
      landscape: design.value.orientation === 'LANDSCAPE',
    })
    success('Exam timetable downloaded')
  } catch (err: any) {
    toastError(err?.message || 'Failed to download the exam timetable')
  } finally {
    downloading.value = false
  }
}

onMounted(() => {
  loadLogo()
  load()
})
</script>
