<script setup lang="ts">
// A plain, document-style "insights" section for a $generatePdf preview div - one bordered box
// with a bulleted list, not one UCard per finding (which read as a stack of app notifications,
// not part of the report itself). Plain elements + inline colors only, same reason every other
// piece of a preview div avoids UBadge/UIcon: html2canvas doesn't render Nuxt UI's mask-based
// icons, so nothing here can depend on one.
defineProps<{
  title?: string
  items: { text: string; color?: string }[]
}>()

const DOT_COLOR: Record<string, string> = {
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  primary: '#2563eb',
  neutral: '#6b7280',
}
function dotColor(color?: string) {
  return DOT_COLOR[color || 'neutral'] || DOT_COLOR.neutral
}
</script>

<template>
  <div v-if="items.length" class="mb-6">
    <p class="mb-2 text-sm font-semibold text-gray-700">{{ title || 'Key Insights' }}</p>
    <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <ul class="space-y-2">
        <li v-for="(item, i) in items" :key="i" class="flex items-start gap-2.5 text-sm text-gray-700">
          <span class="mt-1.5 inline-block size-1.5 shrink-0 rounded-full"
            :style="{ backgroundColor: dotColor(item.color) }" />
          <span>{{ item.text }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
