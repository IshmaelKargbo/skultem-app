<script setup lang="ts">
// Shared "view full record" modal for every report-builder table (student/fee/payment/teacher/
// subject/clazz/grade/attendance). Desktop tables only show 4-5 columns to avoid horizontal
// scroll, and mobile shows a compact single-line row - this is where the fields trimmed from
// both of those live, so no data is actually lost, just moved behind a tap/click.
const { open, title, subtitle, fields, badge } = defineProps<{
  open: boolean
  title: string
  subtitle?: string
  icon?: string
  photo?: string
  badge?: { label: string; color?: 'success' | 'error' | 'warning' | 'info' | 'neutral' }
  fields: ReportDetailField[]
}>()

const emit = defineEmits<{ 'update:open': [boolean] }>()

const isOpen = computed({
  get: () => open,
  set: (v: boolean) => emit('update:open', v)
})

// Tailwind can't see `text-${color}` at build time, so the colored (non-badge) values map
// through a static lookup instead of a template literal.
const TEXT_COLOR_CLASS: Record<string, string> = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-info',
  neutral: 'text-highlighted'
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard :ui="{ body: 'max-h-[70vh] overflow-y-auto' }">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <UAvatar size="lg" :src="photo || undefined" :icon="icon || 'i-lucide-file-text'" :alt="title" />
              <div class="min-w-0">
                <h3 class="truncate text-base font-bold text-highlighted">{{ title }}</h3>
                <p v-if="subtitle" class="truncate text-xs text-muted">{{ subtitle }}</p>
              </div>
            </div>
            <UBadge v-if="badge" :label="badge.label" :color="badge.color" variant="soft" />
          </div>
        </template>

        <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div v-for="field in fields" :key="field.label" class="min-w-0 space-y-1">
            <dt class="text-[11px] font-medium uppercase tracking-wide text-muted">{{ field.label }}</dt>
            <dd class="text-sm font-medium text-highlighted">
              <UBadge v-if="field.badge" :label="String(field.value ?? 'N/A')" variant="soft" :color="field.color" />
              <span v-else :class="field.color ? TEXT_COLOR_CLASS[field.color] : ''">{{ field.value ?? 'N/A' }}</span>
            </dd>
          </div>
        </dl>

        <template #footer>
          <div class="flex justify-end">
            <UButton label="Close" color="neutral" variant="soft" @click="isOpen = false" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
