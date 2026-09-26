<template>
  <USlideover :open="open" side="left" :ui="{
    body: 'p-0',
    content:
      'w-full max-w-sm   border-r border-gray-200 dark:border-gray-800',
  }" @update:open="open = $event">
    <!-- Trigger -->
    <UButton class="md:hidden" color="neutral" variant="link" icon="lucide:menu" :aria-expanded="open"
      aria-controls="account-menu-panel" aria-label="Open account menu" @click="open = true" />

    <template #header>
      <div class="w-full">
        <div class="flex items-center justify-between gap-3">
          <div class="relative shrink-0">
            <UAvatar :src="user?.photo || undefined" :alt="name" size="lg" class="ring-2 ring-white dark:ring-gray-900" />
            <span
              class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-950 bg-emerald-500"
              aria-hidden="true" />
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {{ name }}
            </h3>
            <p class="truncate text-xs text-gray-500 dark:text-gray-400">
              {{ user?.email }}
            </p>
          </div>

          <UButton icon="lucide:x" variant="ghost" color="gray" size="xs" class="rounded-xl"
            aria-label="Close account menu" @click="open = false" />
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <div id="account-menu-panel"
        class="flex h-full flex-col overflow-y-auto px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <!-- ROLE SWITCHER -->
        <div v-if="userRoles.length" class="pt-2">
          <div class="space-y-2 pb-5">
            <div class="mb-3 flex items-center justify-between">
              <p id="role-switch-label" class="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Switch Role
              </p>
              <div
                class="rounded-full border border-gray-200 dark:border-white/10 px-2 py-1 text-[10px] text-gray-500 dark:text-gray-400">
                {{ userRoles.length }} roles
              </div>
            </div>

            <div role="radiogroup" aria-labelledby="role-switch-label" class="space-y-2">
              <button v-for="role in userRoles" :key="role.value" type="button" role="radio"
                :aria-checked="role.value === activeRole"
                class="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border p-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                :class="role.value === activeRole
                  ? 'border-primary-500/30 bg-primary-50 dark:border-primary-500/20 dark:bg-primary-500/10'
                  : 'border-gray-200/70 dark:border-white/5 bg-gray-100 dark:bg-white/5 hover:border-primary-500/20 hover:bg-white dark:hover:bg-white/10'
                  " @click="switchRole(role.value)">
                <div v-if="role.value === activeRole" class="absolute inset-y-0 left-0 w-1 rounded-r-full bg-primary"
                  aria-hidden="true" />

                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all" :class="role.value === activeRole
                  ? 'bg-primary text-white shadow-lg shadow-primary-500/20'
                  : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5'
                  ">
                  <UIcon :name="role.icon" class="text-base" aria-hidden="true" />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {{ role.label }}
                  </p>
                  <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                    {{ role.desc }}
                  </p>
                </div>

                <Transition enter-active-class="transition duration-200" enter-from-class="scale-75 opacity-0"
                  enter-to-class="scale-100 opacity-100">
                  <div v-if="role.value === activeRole"
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <UIcon name="lucide:check" class="size-3.5" aria-hidden="true" />
                  </div>
                </Transition>
              </button>
            </div>
          </div>
        </div>
        <!-- ACADEMIC YEAR -->
        <div v-if="canSwitchYear" class="md:hidden border-t border-gray-200/60 dark:border-white/10 pt-4 mt-3">
          <div class="mb-3 px-1">
            <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
              Academic Year
            </p>
          </div>

          <div
            class="flex items-center justify-between rounded-2xl border border-gray-200/70 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-4 py-3">
            <AccountSwitch />
          </div>
        </div>
        <div v-if="canSwitchSection" class="border-t border-gray-200/60 dark:border-white/10 pt-4 mt-3">
          <div class="mb-3 px-1">
            <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Viewing
            </p>
          </div>
          <div
            class="flex items-center justify-between rounded-2xl border border-gray-200/70 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-4 py-3">
            <SectionSwitch />
          </div>
        </div>
        <!-- APPEARANCE — disabled — app is locked to light mode. Restore this block to bring back dark mode.
        <div class="border-t border-gray-200/60 dark:border-white/10 pt-4 mt-3">
          <div class="mb-3 px-1">
            <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
              Appearance
            </p>
          </div>

          <div
            class="flex items-center justify-between rounded-2xl border border-gray-200/70 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-4 py-3">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 dark:bg-primary-500/15">
                <UIcon :name="colorMode.value === 'dark' ? 'lucide:moon' : 'lucide:sun'" class="text-primary text-lg"
                  aria-hidden="true" />
              </div>
              <div>
                <label for="theme-toggle" class="text-sm font-semibold text-gray-900 dark:text-white">Theme</label>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ colorMode.value === "dark" ? "Dark mode" : "Light mode" }}
                </p>
              </div>
            </div>

            <USwitch id="theme-toggle" :model-value="colorMode.value === 'dark'" aria-label="Toggle dark mode"
              @update:model-value="colorMode.preference = $event ? 'dark' : 'light'" />
          </div>
        </div>
        -->
        <!-- MENU - same portal-aware, module-grouped structure as the desktop sidebar (see composables/useMenu.ts) -->
        <nav :aria-label="`${portalLabel} menu`" class="mt-3 pb-2">
          <p class="mb-4 px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            {{ portalLabel }} Menu
          </p>

          <div v-for="section in menuSections" :key="section.id" class="mb-5 last:mb-0">
            <p v-if="section.tier" class="mb-3 px-1 text-xs font-bold uppercase tracking-[0.18em] text-highlighted">
              {{ section.tier }}
            </p>

            <p v-if="section.label"
              class="mb-2 flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {{ section.label }}
              <span class="h-px flex-1 bg-default" />
            </p>

            <ul class="space-y-2">
              <li v-for="item in section.items" :key="item.label + (item.to ?? '')"
                class="rounded-3xl border border-gray-200/80 bg-white/80 dark:border-white/10 dark:bg-white/[0.03]">
                <!-- Group with sub-pages: an accordion -->
                <template v-if="item.subNavs">
                  <button type="button"
                    class="flex w-full items-center justify-between rounded-3xl px-5 py-4 text-gray-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                    :aria-expanded="isExpanded(item)" :aria-controls="`menu-panel-${panelId(item)}`"
                    @click="toggleItem(item)">
                    <span class="flex min-w-0 items-center gap-4">
                      <UIcon :name="item.icon" class="size-6 shrink-0 text-gray-700 dark:text-gray-300"
                        aria-hidden="true" />
                      <span class="truncate text-[16px] font-medium">{{ item.label }}</span>
                    </span>
                    <UIcon name="lucide:chevron-down"
                      class="size-5 shrink-0 text-gray-500 dark:text-gray-400 transition-transform duration-200"
                      :class="isExpanded(item) ? 'rotate-180' : ''" aria-hidden="true" />
                  </button>

                  <div v-show="isExpanded(item)" :id="`menu-panel-${panelId(item)}`" class="space-y-2 px-4 pb-4">
                    <NuxtLink v-for="nav in visibleSubNavs(item)" :key="nav.to" :to="nav.to"
                      :aria-current="nav.to === activeSubTo(item) ? 'page' : undefined"
                      class="group flex items-center gap-3 rounded-2xl px-4 py-3.5 ring-1 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                      :class="nav.to === activeSubTo(item)
                        ? 'bg-primary-100 text-primary-700 ring-primary-200 shadow-sm dark:bg-primary-500/20 dark:text-primary-300 dark:ring-primary-500/40'
                        : 'bg-gray-100 text-gray-700 ring-gray-200 hover:bg-primary-50 hover:text-primary-600 hover:ring-primary-300 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10 dark:hover:bg-primary-500/10 dark:hover:text-primary-200 dark:hover:ring-primary-500/30'"
                      @click="close">
                      <UIcon v-if="nav.icon" :name="nav.icon"
                        class="size-5 shrink-0 text-current transition-transform duration-200 group-hover:scale-110"
                        aria-hidden="true" />
                      <span class="font-medium">{{ nav.label }}</span>
                      <UIcon v-if="nav.to === activeSubTo(item)" name="lucide:chevron-right"
                        class="ml-auto size-4 text-current opacity-80" />
                    </NuxtLink>
                  </div>
                </template>

                <!-- Single page: a direct link -->
                <NuxtLink v-else-if="item.to" :to="item.to" :aria-current="isItemActive(item) ? 'page' : undefined"
                  class="flex items-center gap-4 rounded-3xl px-5 py-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                  :class="isItemActive(item)
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-200'
                    : 'text-gray-900 hover:bg-primary-50 dark:text-white dark:hover:bg-primary-500/10'"
                  @click="close">
                  <UIcon :name="item.icon" class="size-6 shrink-0" aria-hidden="true" />
                  <span class="truncate text-[16px] font-medium">{{ item.label }}</span>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </template>

    <template #footer>
      <div class="w-full px-4 pb-4">
        <UButton to="/logout" color="error" class="flex w-full justify-center">
          Log out
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import type { NavItem, SubNavItem } from '~/composables/useMenu'

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const { activeRole, can, setActiveRole } = useAuth();
const { canInstall, install } = usePwaInstall();
const { ensureLoaded: ensureClassMasterLoaded } = useClassMaster();
const { menuSections, onAdminPortal } = useMenu();
const { canSwitch: canSwitchSection } = useSectionView();

const route = useRoute();
const open = ref(false);
// Which groups are open, keyed by panelId(). Seeded with the group holding the current page.
const expanded = ref<string[]>([]);
// const colorMode = useColorMode(); // theme toggle disabled — see commented "APPEARANCE" block above

onMounted(() => {
  ensureClassMasterLoaded();
});

const name = computed(() =>
  user.value ? `${user.value.givenNames} ${user.value.familyName}` : ""
);

// "Teacher", "Admin", ... - which portal the menu below is built for.
const portalLabel = computed(() => (onAdminPortal ? "System Admin" : clean(activeRole.value)));

const roleDesc: Record<string, string> = {
  PROPRIETOR: "School owner & oversight",
  ADMIN: "Full system access",
  TEACHER: "Classes & students",
  PARENT: "Child progress",
  ACCOUNTANT: "Finance & fees",
  SYSTEM_ADMIN: "Platform-wide control",
};

const roleIcons: Record<string, string> = {
  PROPRIETOR: "lucide:crown",
  ADMIN: "lucide:shield-check",
  TEACHER: "lucide:graduation-cap",
  PARENT: "lucide:users",
  ACCOUNTANT: "lucide:calculator",
  SYSTEM_ADMIN: "lucide:shield-check",
};

const userRoles = computed(() =>
  (user.value?.roles ?? []).map((role: string) => ({
    value: role,
    label: clean(role),
    desc: roleDesc[role] ?? "Access level",
    icon: roleIcons[role] ?? "lucide:user",
  }))
);

// A system admin isn't scoped to any one school's academic calendar - same gate as me.vue.
const canSwitchYear = computed(() =>
  !onAdminPortal && can([Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT]),
);

// --- Active page -----------------------------------------------------------------------------------
function trimSlash(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

function matchesRoute(nav: { to: string; exact?: boolean }) {
  const to = trimSlash(nav.to);
  return route.path === to || (!nav.exact && to !== "/" && route.path.startsWith(`${to}/`));
}

function visibleSubNavs(item: NavItem): SubNavItem[] {
  return (item.subNavs ?? []).filter((nav) => !nav.roles || can(nav.roles));
}

// The most specific matching sub-page wins, so "/classes/sections" doesn't also light up "/classes".
function activeSubTo(item: NavItem): string | undefined {
  const candidates = visibleSubNavs(item).filter(matchesRoute);
  if (!candidates.length) return undefined;
  return candidates.reduce((a, b) => (b.to.length > a.to.length ? b : a)).to;
}

function isItemActive(item: NavItem) {
  return !!item.to && matchesRoute({ to: item.to, exact: item.exact });
}

// --- Accordions ------------------------------------------------------------------------------------
// Two groups can share a label (e.g. an "Analytics" per role), so key on label + first page.
function panelId(item: NavItem) {
  return `${item.label}-${item.subNavs?.[0]?.to ?? item.to ?? ""}`.replace(/[^a-zA-Z0-9-]/g, "_");
}

function isExpanded(item: NavItem) {
  return expanded.value.includes(panelId(item));
}

function toggleItem(item: NavItem) {
  const id = panelId(item);
  expanded.value = expanded.value.includes(id)
    ? expanded.value.filter((v) => v !== id)
    : [...expanded.value, id];
}

// Open whichever group holds the current page, so the drawer opens on it.
function expandActiveGroup() {
  const active = menuSections.value
    .flatMap((section) => section.items)
    .filter((item) => item.subNavs && activeSubTo(item))
    .map(panelId);
  expanded.value = [...new Set([...expanded.value, ...active])];
}

watch(open, (isOpen) => {
  if (isOpen) expandActiveGroup();
});

function close() {
  open.value = false;
}

function switchRole(role: string) {
  setActiveRole(role);
  close();
}

async function installApp() {
  const installResult = await install();
  if (installResult !== "unavailable") close();
}

watch(
  () => route.fullPath,
  () => {
    open.value = false;
  }
);
</script>
