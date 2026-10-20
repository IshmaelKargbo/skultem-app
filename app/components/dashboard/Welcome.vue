<template>
  <section class="rounded-2xl border border-default bg-default p-5 md:p-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex min-w-0 items-center gap-4">
        <UAvatar :src="user?.photo || undefined" :alt="user?.givenNames" size="3xl"
          class="size-14 shrink-0 ring-1 ring-default md:size-16" />

        <div class="min-w-0">
          <p class="text-xs font-medium uppercase tracking-[0.14em] text-muted">{{ greeting }}</p>
          <h2 class="truncate text-xl font-bold tracking-tight text-highlighted md:text-3xl">
            Welcome, {{ user?.givenNames || 'there' }} <span aria-hidden="true">👋</span>
          </h2>
          <!-- Anything role specific (clock status, counts) goes here. -->
          <div v-if="$slots.default" class="mt-2 flex flex-wrap items-center gap-2">
            <slot />
          </div>
        </div>
      </div>

      <!-- Date tile -->
      <div class="hidden items-center gap-3 rounded-xl bg-elevated/60 px-4 py-2.5 sm:flex">
        <p class="text-3xl font-bold leading-none tabular-nums text-highlighted">{{ day }}</p>
        <div class="text-xs leading-tight text-muted">
          <p class="font-semibold text-highlighted">{{ weekday }}</p>
          <p>{{ monthYear }}</p>
        </div>
      </div>
      <p class="text-sm text-muted sm:hidden">{{ fullDate }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
const { user } = storeToRefs(useUserStore())

const now = new Date()
const hour = now.getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
const day = now.getDate()
const weekday = now.toLocaleDateString(undefined, { weekday: 'long' })
const monthYear = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
const fullDate = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
</script>
