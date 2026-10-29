<script setup lang="ts">
// One period on one day. A single subject shows as one card. Several subjects mean the class splits
// between options at the same time (e.g. PHE or RME): each student goes to the one they take, so each
// option is shown with its own teacher and room.
const { slot, isAdmin = false, label } = defineProps<{
  slot: Timetable[]
  isAdmin?: boolean
  // e.g. "Monday · Period 3", shown on the phone layout
  label?: string
}>()

const emit = defineEmits<{
  edit: [entry: Timetable]
  add: []
}>()

const isSplit = computed(() => slot.length > 1)
</script>

<template>
  <!-- Free -->
  <button v-if="!slot.length && isAdmin" type="button"
    class="flex min-h-28 w-full items-center justify-center rounded-2xl border-2 border-dashed border-default text-muted transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    @click="emit('add')">
    <span class="flex flex-col items-center gap-1.5">
      <UIcon name="i-lucide-plus" class="size-5" />
      <span class="text-xs font-medium">Add Subject</span>
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
    <component :is="isAdmin ? 'button' : 'div'" :type="isAdmin ? 'button' : undefined"
      class="block min-h-28 w-full rounded-2xl border p-4 text-left shadow-sm transition-all duration-200"
      :class="[slot[0]!.color, isAdmin && 'hover:-translate-y-0.5 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary']"
      :title="`${slot[0]!.subject} · ${slot[0]!.teacher || 'No teacher'} · ${slot[0]!.room || 'No room'}`"
      @click="isAdmin && emit('edit', slot[0]!)">
      <p v-if="label" class="text-[11px] font-medium uppercase tracking-wide text-muted">{{ label }}</p>
      <h4 class="truncate pr-5 font-semibold leading-tight">{{ slot[0]!.subject }}</h4>
      <div class="mt-3 space-y-1.5 text-xs text-muted">
        <p class="flex min-w-0 items-center gap-1.5">
          <UIcon name="i-lucide-user-round" class="size-3.5 shrink-0" />
          <span class="truncate">{{ slot[0]!.teacher || '—' }}</span>
        </p>
        <p class="flex min-w-0 items-center gap-1.5">
          <UIcon name="i-lucide-map-pin" class="size-3.5 shrink-0" />
          <span class="truncate">{{ slot[0]!.room || '—' }}</span>
        </p>
      </div>
      <UIcon v-if="isAdmin" name="i-lucide-pencil"
        class="absolute right-3 top-3 size-3.5 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
    </component>

    <!-- Split this period into options, e.g. add RME beside PHE -->
    <UButton v-if="isAdmin" size="xs" color="neutral" variant="solid" icon="i-lucide-split"
      class="absolute -bottom-2 right-3 rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100"
      label="Add option" @click="emit('add')" />
  </div>

  <!-- Options: students split between subjects -->
  <!-- Each option is drawn like a normal period card, joined by an "or" marker -->
  <div v-else class="min-h-28 space-y-1.5">
    <div class="flex items-center justify-between gap-2 px-1">
      <p class="flex min-w-0 items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
        <UIcon name="i-lucide-split" class="size-3.5 shrink-0 text-primary" />
        <span class="truncate">{{ label ? `${label} · ` : '' }}{{ slot.length }} options</span>
      </p>
      <UTooltip text="Students go to the subject they take">
        <UIcon name="i-lucide-info" class="size-3.5 shrink-0 text-muted" />
      </UTooltip>
    </div>

    <template v-for="(entry, i) in slot" :key="entry.id">
      <div v-if="i > 0" class="flex items-center gap-2 px-2" aria-hidden="true">
        <span class="h-px flex-1 bg-accented" />
        <span class="rounded-full border border-default bg-default px-2 text-[10px] font-semibold uppercase tracking-wide text-muted">or</span>
        <span class="h-px flex-1 bg-accented" />
      </div>

      <component :is="isAdmin ? 'button' : 'div'" :type="isAdmin ? 'button' : undefined"
        class="group/opt relative block w-full rounded-2xl border p-3 text-left shadow-sm transition-all duration-200"
        :class="[entry.color, isAdmin && 'hover:-translate-y-0.5 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary']"
        :title="`${entry.subject} · ${entry.teacher || 'No teacher'} · ${entry.room || 'No room'}`"
        @click="isAdmin && emit('edit', entry)">
        <h4 class="truncate pr-5 font-semibold leading-tight">{{ entry.subject }}</h4>
        <div class="mt-2 space-y-1 text-xs text-muted">
          <p class="flex min-w-0 items-center gap-1.5">
            <UIcon name="i-lucide-user-round" class="size-3.5 shrink-0" />
            <span class="truncate">{{ entry.teacher || '—' }}</span>
          </p>
          <p class="flex min-w-0 items-center gap-1.5">
            <UIcon name="i-lucide-map-pin" class="size-3.5 shrink-0" />
            <span class="truncate">{{ entry.room || '—' }}</span>
          </p>
        </div>
        <UIcon v-if="isAdmin" name="i-lucide-pencil"
          class="absolute right-3 top-3 size-3.5 text-muted opacity-0 transition-opacity group-hover/opt:opacity-100" />
      </component>
    </template>

    <button v-if="isAdmin" type="button"
      class="flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-default py-2 text-xs font-medium text-muted transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      @click="emit('add')">
      <UIcon name="i-lucide-plus" class="size-3.5" />
      Add option
    </button>
  </div>
</template>
