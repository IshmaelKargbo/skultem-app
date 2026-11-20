<template>
  <!-- The Grade Book while it loads, shaped like the real page (header card, toolbar, the sheet) so nothing jumps
       when the marks arrive. -->
  <div class="space-y-4" aria-busy="true" aria-label="Loading the grade book">
    <section v-if="!tableOnly" class="rounded-3xl border border-default bg-default p-5 md:p-6">
      <div class="flex flex-col gap-5 md:flex-row md:items-center">
        <div class="min-w-0 flex-1 space-y-2">
          <USkeleton class="h-3 w-28" />
          <USkeleton class="h-8 w-64 max-w-full" />
          <USkeleton class="h-4 w-72 max-w-full" />
          <USkeleton class="mt-1 h-8 w-52 rounded-xl" />
        </div>
        <USkeleton class="size-24 shrink-0 rounded-full" />
      </div>
      <div class="mt-5 grid grid-cols-2 gap-y-4 border-t border-default pt-4 lg:grid-cols-4 lg:divide-x lg:divide-default">
        <div v-for="i in 4" :key="i" class="space-y-1.5 lg:px-4 lg:first:pl-0">
          <USkeleton class="h-3 w-24" />
          <USkeleton class="h-6 w-16" />
        </div>
      </div>
    </section>

    <div v-if="!tableOnly" class="flex flex-col gap-2 md:flex-row md:items-center">
      <USkeleton class="h-11 w-full rounded-2xl md:w-80" />
      <div class="flex flex-1 items-center gap-2 md:justify-end">
        <USkeleton class="h-8 flex-1 rounded-md md:max-w-64" />
        <USkeleton class="size-8 rounded-md" />
        <USkeleton class="h-8 w-36 rounded-md" />
      </div>
    </div>

    <section class="overflow-hidden rounded-3xl border border-default bg-default">
      <div class="flex items-center gap-3 border-b border-default bg-elevated px-3 py-3">
        <USkeleton class="h-3 w-4" />
        <USkeleton class="h-3 w-40" />
        <div class="ml-auto hidden gap-3 sm:flex">
          <USkeleton v-for="i in 8" :key="i" class="h-3 w-8" />
        </div>
      </div>
      <div v-for="i in rows" :key="i" class="flex items-center gap-3 border-b border-default px-3 py-2.5 last:border-b-0">
        <USkeleton class="h-3 w-4" />
        <USkeleton class="size-6 shrink-0 rounded-full" />
        <div class="w-40 space-y-1">
          <USkeleton class="h-3 w-full" />
          <USkeleton class="h-2 w-16" />
        </div>
        <USkeleton class="h-4 w-8" />
        <div class="ml-auto hidden gap-3 sm:flex">
          <USkeleton v-for="j in 8" :key="j" class="h-4 w-8" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  // Only the sheet, for when the header is already on screen (switching to report cards).
  tableOnly?: boolean
  rows?: number
}>(), { tableOnly: false, rows: 8 })
</script>
