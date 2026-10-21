<template>
  <UCard class="h-full flex flex-col" :ui="{
    body: 'flex-1 overflow-y-auto sm:p-0',
    footer: 'sm:p-3',
    header: 'sm:p-3'
  }">
    <!-- Header (fixed height) -->
    <template #header>
      <NuxtLink to="/" class="flex min-w-0 items-center gap-2">
        <img v-if="!onAdminPortal && school?.logo" :src="school.logo" :alt="school.name || 'School logo'"
          class="h-9 w-9 shrink-0 rounded-lg object-contain" />

        <template v-else>
          <img src="/menu-dark.svg" alt="Skultem" class="h-7 shrink-0 block dark:hidden" />
          <img src="/menu-light.svg" alt="Skultem" class="h-7 shrink-0 hidden dark:block" />
        </template>

        <div v-if="school?.logo && !onAdminPortal" class="min-w-0">
          <p class="truncate font-display text-base font-semibold leading-tight text-highlighted">
            {{ school.name }}
          </p>
          <p v-if="school?.motto && !onAdminPortal" class="truncate text-xs italic leading-tight text-muted">
            {{ school.motto }}
          </p>
        </div>
      </NuxtLink>
    </template>

    <!-- Scrollable Body -->
    <div class="h-full overflow-y-auto p-4">
      <div v-for="section in menuSections" :key="section.id" class="mb-5 last:mb-0">
        <!-- Two levels: a tier title ("Essentials", "Modules") on the first section of each tier, then
             the subgroup label. Both are left out when there's nothing to tell apart (the admin
             portal), so that stays a plain list. -->
        <p v-if="section.tier"
          class="mb-3 px-3 text-xs font-bold uppercase tracking-[0.18em] text-highlighted">
          {{ section.tier }}
        </p>

        <button v-if="section.label && section.collapsible" type="button"
          class="mb-2 flex w-full items-center gap-2 px-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted transition hover:text-highlighted"
          :title="section.hint" :aria-expanded="!isFolded(section)" @click="toggleSection(section.id)">
          {{ section.label }}
          <UBadge v-if="section.badge" size="xs" variant="subtle" color="warning" :label="section.badge"
            class="normal-case tracking-normal" />
          <span class="h-px flex-1 bg-default" />
          <UIcon name="i-lucide-chevron-down" class="size-3.5 shrink-0 transition-transform duration-200"
            :class="isFolded(section) ? '-rotate-90' : ''" />
        </button>
        <p v-else-if="section.label"
          class="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
          :title="section.hint">
          {{ section.label }}
          <UBadge v-if="section.badge" size="xs" variant="subtle" color="warning" :label="section.badge"
            class="normal-case tracking-normal" />
          <span class="h-px flex-1 bg-default" />
        </p>

      <ul v-show="!isFolded(section)" class="space-y-2">
        <li v-for="item in section.items" :key="item.label + (item.to ?? '')">
          <!-- Planned but not built yet -->
          <div v-if="item.soon" class="flex min-h-11 cursor-not-allowed items-center justify-between gap-2 rounded-xl border-2 border-transparent px-3 py-2 text-xs text-muted opacity-60 md:text-sm"
            title="Coming soon">
            <span class="flex min-w-0 items-center gap-2.5">
              <UIcon class="h-5 w-5 shrink-0" :name="item.icon" />
              <span class="truncate">{{ item.label }}</span>
            </span>
            <UBadge size="xs" variant="subtle" color="neutral" label="Soon" />
          </div>
          <MenuItem v-else :label="item.label" :to="item.to" :exact="item.exact" :subNavs="item.subNavs">
            <template #icon>
              <UIcon class="w-5 h-5" :name="item.icon" />
            </template>

            <template v-if="item.subNavs" #subNav="{ subNavs, isActiveSub }">
              <div class="flex flex-col space-y-1">
                <NuxtLink v-for="nav in subNavs.filter((n: SubNavItem) => !n.roles || can(n.roles))" :key="nav.to"
                  :to="nav.to" :exact="nav.exact"
                  class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10"
                  :class="isActiveSub(nav)
                    ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-200'
                    : 'text-gray-700 dark:text-gray-300'">
                  <UIcon v-if="nav.icon" :name="nav.icon" class="w-4 h-4 shrink-0" />
                  <span>{{ nav.label }}</span>
                </NuxtLink>
              </div>
            </template>
          </MenuItem>
        </li>
      </ul>
      </div>

      <!-- The system admin's planned pages stay out of the way until asked for -->
      <button v-if="upcomingCount" type="button"
        class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-default px-3 py-2 text-xs text-muted transition hover:border-primary-300 hover:text-primary"
        @click="showUpcoming = !showUpcoming">
        <UIcon :name="showUpcoming ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-4" />
        {{ showUpcoming ? 'Hide upcoming pages' : `Show upcoming pages (${upcomingCount})` }}
      </button>
    </div>
    <template #footer>
      <MenuNoticeBoard />
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { MenuSection, SubNavItem } from '~/composables/useMenu'

const { school, hydrateFromCache } = useSchoolInfo()
hydrateFromCache()

const { can } = useAuth()
const { ensureLoaded: ensureClassMasterLoaded } = useClassMaster()
const { menuSections, onAdminPortal, showUpcoming, upcomingCount, collapsed, toggleSection } = useMenu()
const route = useRoute()

// A folded group stays open while the page you are on belongs to it.
const holdsCurrentPage = (section: MenuSection) =>
  section.items.some((item) => item.to && (item.to === '/' ? route.path === '/' : route.path === item.to || route.path.startsWith(`${item.to}/`)))
const isFolded = (section: MenuSection) => !!section.collapsible && !!collapsed.value[section.id] && !holdsCurrentPage(section)

onMounted(() => {
  ensureClassMasterLoaded()
})
</script>
