<template>
  <!-- Placeholder for the week cards on the scheme-of-work pages: title + topic, then objectives -->
  <div class="grid gap-4">
    <UCard v-for="i in 3" :key="i">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="space-y-2">
            <USkeleton class="h-5 w-24" />
            <USkeleton class="h-3.5 w-48" />
          </div>
          <USkeleton class="size-8 rounded-md" />
        </div>
      </template>

      <div class="space-y-2.5">
        <USkeleton class="h-3.5 w-28" />
        <div v-for="row in 3" :key="row" class="flex items-center gap-2">
          <USkeleton class="size-4 rounded-full" />
          <USkeleton class="h-3.5" :class="row === 2 ? 'w-2/3' : 'w-5/6'" />
        </div>
      </div>
    </UCard>
  </div>
</template>
