<template>
  <div class="space-y-3 px-4 md:px-6">
    <Heading class="hidden md:block" title="Timetable Settings"
      subtitle="The school day, which timetable each class follows, and the rooms lessons use">
      <GuideBar topic="admin-timetable-settings" />
    </Heading>
    <div data-guide="tt-tabs"><TimetableSectionNav /></div>

    <!-- Three parts, in the order a school sets them up: the school day, the classes, the rooms. A list on the left
         (wide screens) jumps between them; on a phone they simply follow each other. -->
    <div class="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <nav class="hidden lg:block" aria-label="Settings sections">
        <ul class="sticky top-3 space-y-1">
          <li v-for="s in SECTIONS" :key="s.id">
            <button type="button"
              class="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
              :class="active === s.id ? 'bg-elevated text-highlighted' : 'text-muted hover:bg-elevated/60 hover:text-highlighted'"
              :aria-current="active === s.id ? 'true' : undefined" @click="go(s.id)">
              <UIcon :name="s.icon" class="mt-0.5 size-4 shrink-0" :class="active === s.id ? 'text-primary' : ''" />
              <span class="min-w-0">
                <span class="block text-sm font-medium">{{ s.title }}</span>
                <span class="block text-xs text-muted">{{ s.hint }}</span>
              </span>
            </button>
          </li>
        </ul>
      </nav>

      <div class="min-w-0 space-y-10">
        <section id="school-day" class="scroll-mt-4 space-y-4">
          <TimetableSettingsTitle :section="SECTIONS[0]!" />
          <div data-guide="tts-timing"><TimetableTiming /></div>
          <div class="grid gap-4 xl:grid-cols-2">
            <TimetableTimingLevels />
            <div data-guide="tts-days"><TimetableWorkingDay /></div>
          </div>
        </section>

        <section id="classes" class="scroll-mt-4 space-y-4">
          <TimetableSettingsTitle :section="SECTIONS[1]!" />
          <div data-guide="tts-class-types"><TimetableClassTypes /></div>
        </section>

        <section id="rooms" class="scroll-mt-4 space-y-4">
          <TimetableSettingsTitle :section="SECTIONS[2]!" />
          <div data-guide="tts-rooms"><TimetableRoom /></div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Section = { id: string, title: string, hint: string, icon: string, description: string }

const SECTIONS: Section[] = [
  {
    id: 'school-day', title: 'School day', hint: 'Times and days', icon: 'i-lucide-clock-3',
    description: 'When the day starts and ends, how long periods and breaks are, which levels follow which times, and the days classes are held.',
  },
  {
    id: 'classes', title: 'Classes', hint: 'Timetable or weekly plan', icon: 'i-lucide-school',
    description: 'Each class follows the normal timetable (periods every day) or a weekly plan (a subject in each session) - one or the other.',
  },
  {
    id: 'rooms', title: 'Rooms', hint: 'Where lessons happen', icon: 'i-lucide-door-open',
    description: 'Classrooms, labs and other spaces, so each lesson on the timetable can be given a room.',
  },
]

// The section in view, for the list on the left.
const active = ref(SECTIONS[0]!.id)
function go(id: string) {
  active.value = id
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

let observer: IntersectionObserver | null = null
onMounted(() => {
  useAppStore().setTitle('Timetable')
  document.title = 'Timetable Settings | Skultem'
  observer = new IntersectionObserver((entries) => {
    const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
    if (top) active.value = top.target.id
  }, { rootMargin: '0px 0px -60% 0px' })
  for (const s of SECTIONS) {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  }
})
onBeforeUnmount(() => observer?.disconnect())

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
