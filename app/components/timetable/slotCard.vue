<script setup lang="ts">
// One period on one day. A single subject shows as one card. Several subjects mean the class splits
// between options at the same time (e.g. PHE or RME): each student goes to the one they take, so each
// option is shown with its own teacher and room.
const { slot, isAdmin = false, label, when, double = null } = defineProps<{
  slot: Timetable[]
  isAdmin?: boolean
  // e.g. "Monday · Period 3", shown on the phone layout
  label?: string
  // e.g. "Monday · Period 3 · 08:00 - 08:40", shown in the details popover
  when?: string
  // Half of a double period (the same lesson in the period before or after).
  double?: 'first' | 'second' | null
}>()

// Hovering a lesson shows its full details: the card cuts long names off so the grid fits without scrolling.
const popover = { side: 'top' as const, sideOffset: 6, collisionPadding: 12 }

const emit = defineEmits<{
  edit: [entry: Timetable]
  add: []
}>()

const isSplit = computed(() => slot.length > 1)
// With options, the one on show (the first until someone switches); kept in range if an option is removed.
const shown = ref(0)
watch(() => slot.length, (n) => { if (shown.value >= n) shown.value = 0 })
const current = computed(() => slot[Math.min(shown.value, slot.length - 1)]!)
const next = () => { shown.value = (shown.value + 1) % slot.length }
// A Library period takes the whole period for the class, so it never gets options beside it.
const isLibrary = computed(() => slot.length === 1 && slot[0]!.kind === 'LIBRARY')
</script>

<template>
  <!-- Free -->
  <button v-if="!slot.length && isAdmin" type="button"
    class="flex min-h-28 w-full items-center justify-center rounded-2xl border-2 border-dashed border-default text-muted transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    @click="emit('add')">
    <span class="flex flex-col items-center gap-1.5">
      <UIcon name="i-lucide-plus" class="size-5" />
      <span class="text-xs font-medium">Add Lesson</span>
    </span>
  </button>

  <div v-else-if="!slot.length"
    class="flex min-h-28 w-full items-center justify-center rounded-2xl border-2 border-dashed border-default text-muted">
    <span class="flex flex-col items-center gap-1.5">
      <UIcon name="i-lucide-ban" class="size-5" />
      <span class="text-xs font-medium">Free Period</span>
    </span>
  </div>

  <!-- One subject -->
  <div v-else-if="!isSplit" class="group relative">
    <UPopover mode="hover" :open-delay="250" :close-delay="100" :content="popover">
    <component :is="isAdmin ? 'button' : 'div'" :type="isAdmin ? 'button' : undefined"
      class="block min-h-28 w-full min-w-0 rounded-2xl border p-3 text-left shadow-sm transition-all duration-200"
      :class="[slot[0]!.color, isAdmin && 'hover:-translate-y-0.5 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary']"
      @click="isAdmin && emit('edit', slot[0]!)">
      <p v-if="label" class="truncate text-[11px] font-medium uppercase tracking-wide text-muted">{{ label }}</p>
      <p v-if="double" class="mb-1 inline-flex items-center gap-1 rounded-full bg-default/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
        <UIcon name="i-lucide-link-2" class="size-3" />
        Double · {{ double === 'first' ? '1 of 2' : '2 of 2' }}
      </p>
      <h4 class="flex min-w-0 items-center gap-1.5 pr-5 font-semibold leading-tight">
        <UIcon v-if="isLibrary" :name="LIBRARY_ICON" class="size-4 shrink-0 text-primary" />
        <span class="truncate">{{ slot[0]!.subject }}</span>
      </h4>
      <div class="mt-3 space-y-1.5 text-xs text-muted">
        <p class="flex min-w-0 items-center gap-1.5">
          <UIcon name="i-lucide-user-round" class="size-3.5 shrink-0" />
          <span class="truncate">{{ isLibrary ? 'Librarian' : slot[0]!.teacher || '—' }}</span>
        </p>
        <p class="flex min-w-0 items-center gap-1.5">
          <UIcon name="i-lucide-map-pin" class="size-3.5 shrink-0" />
          <span class="truncate">{{ slot[0]!.room || '—' }}</span>
        </p>
      </div>
      <UIcon v-if="isAdmin" name="i-lucide-pencil"
        class="absolute right-3 top-3 size-3.5 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
    </component>
      <template #content>
        <TimetableSlotDetails :entry="slot[0]!" :when="when" />
      </template>
    </UPopover>

    <!-- Split this period into options, e.g. add RME beside PHE -->
    <UButton v-if="isAdmin && !isLibrary" size="xs" color="neutral" variant="solid" icon="i-lucide-split"
      class="absolute -bottom-2 right-3 rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100"
      label="Add option" @click="emit('add')" />
  </div>

  <!-- Options: students split between subjects (e.g. PHE or RME). One is shown at a time, the size of any other
       period, with a switch to step through the rest - so a period with options doesn't stretch the grid. -->
  <div v-else class="group relative">
    <UPopover mode="hover" :open-delay="250" :close-delay="100" :content="popover">
    <component :is="isAdmin ? 'button' : 'div'" :type="isAdmin ? 'button' : undefined"
      class="block min-h-28 w-full min-w-0 rounded-2xl border p-3 pb-8 text-left shadow-sm transition-all duration-200"
      :class="[current.color, isAdmin && 'hover:-translate-y-0.5 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary']"
      @click="isAdmin && emit('edit', current)">
      <p v-if="label" class="truncate text-[11px] font-medium uppercase tracking-wide text-muted">{{ label }}</p>
      <h4 class="truncate pr-5 font-semibold leading-tight">{{ current.subject }}</h4>
      <div class="mt-3 space-y-1.5 text-xs text-muted">
        <p class="flex min-w-0 items-center gap-1.5">
          <UIcon name="i-lucide-user-round" class="size-3.5 shrink-0" />
          <span class="truncate">{{ current.teacher || '—' }}</span>
        </p>
        <p class="flex min-w-0 items-center gap-1.5">
          <UIcon name="i-lucide-map-pin" class="size-3.5 shrink-0" />
          <span class="truncate">{{ current.room || '—' }}</span>
        </p>
      </div>
      <UIcon v-if="isAdmin" name="i-lucide-pencil"
        class="absolute right-3 top-3 size-3.5 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
    </component>
      <template #content>
        <TimetableSlotDetails :entry="current" :when="when" :option="`Option ${shown + 1} of ${slot.length}`" />
      </template>
    </UPopover>

    <!-- Which option this is, and the switch to the next. -->
    <div class="absolute inset-x-2 bottom-1.5 flex items-center justify-between gap-1">
      <div class="flex items-center gap-1" role="tablist" :aria-label="`${slot.length} options`">
        <button v-for="(entry, i) in slot" :key="entry.id" type="button" role="tab" :aria-selected="i === shown"
          :aria-label="`Show ${entry.subject}`" class="flex size-4 items-center justify-center"
          @click.stop="() => { shown = i }">
          <span class="block rounded-full transition-all"
            :class="i === shown ? 'h-1.5 w-3.5 bg-primary' : 'size-1.5 bg-accented hover:bg-muted'" />
        </button>
      </div>
      <UTooltip :text="`${slot.length} options - students go to the subject they take`">
        <button type="button"
          class="flex items-center gap-1 rounded-full border border-default bg-default/90 px-2 py-0.5 text-[10px] font-semibold text-muted shadow-sm transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          :aria-label="`Option ${shown + 1} of ${slot.length}. Show the next option`" @click.stop="next">
          <UIcon name="i-lucide-split" class="size-3" />
          {{ shown + 1 }}/{{ slot.length }}
          <UIcon name="i-lucide-chevron-right" class="size-3" />
        </button>
      </UTooltip>
    </div>

    <!-- Another option beside these -->
    <UButton v-if="isAdmin" size="xs" color="neutral" variant="solid" icon="i-lucide-plus"
      class="absolute -top-2 right-3 rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100"
      label="Add option" @click="emit('add')" />
  </div>
</template>
