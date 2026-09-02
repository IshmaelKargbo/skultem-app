<template>
  <div class="flex items-center">
    <ClientOnly>
      <USlideover side="right" v-model:open="drawerOpen" :dismissible="true" :ui="{
        content:
          'w-full max-w-sm bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl border-l border-gray-200/70 dark:border-white/10',
      }">
        <!-- Compact trigger: avatar only, for use in the header -->

        <div class="flex group cursor-pointer space-x-3" v-if="compact && user && user.email && !loading">
          <div class="relative" :aria-label="`Account menu for ${name}`">
            <UAvatar :src="user?.photo || undefined" :alt="name" size="md" class="ring-2 ring-default transition group-hover:ring-primary-300" />

            <div
              class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-neutral-950 bg-emerald-500" />
          </div>
          <div v-if="user.givenNames && user.familyName" class="hidden md:block">
            <p class="text-sm font-medium text-highlighted truncate max-w-40">{{ user.givenNames }} </p>
            <p class="text-xs text-muted">{{ userRoleLabel }}</p>
          </div>
        </div>

        <!-- Full trigger: avatar + name/role, for use in the sidebar footer -->
        <div v-else-if="user && user.email && !loading" color="neutral"
          class="group w-full rounded-xl border border-default px-4 py-2 hover:border-primary-300 cursor-pointer transition-all duration-300">
          <div class="flex items-center gap-3 w-full">
            <div class="relative">
              <UAvatar :src="user?.photo || undefined" :alt="name" size="xl" />

              <div
                class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-neutral-950 bg-emerald-500" />
            </div>

            <div class="flex-1 text-left">
              <h4 class="font-semibold text-sm text-highlighted truncate">
                {{ name }}
              </h4>

              <p class="text-xs text-muted mt-0.5">
                {{ parseRole[activeRole] || "No Role" }}
              </p>
            </div>

            <UIcon name="i-lucide-settings-2" class="text-muted text-lg opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>

        <!-- Loading -->
        <template #fallback>
          <div class="flex items-center gap-3">
            <div v-if="!compact" class="space-y-2 flex flex-col items-end">
              <USkeleton class="h-3 w-24 rounded-full" />
              <USkeleton class="h-2 w-16 rounded-full" />
            </div>

            <USkeleton :class="compact ? 'h-9 w-9 rounded-full' : 'h-10 w-10 rounded-full'" />
          </div>
        </template>

        <!-- Header -->
        <template #header>
          <div class="relative overflow-hidden w-full">
            <div class="flex justify-between items-center gap-3">
              <div class="relative shrink-0">
                <UAvatar :src="user?.photo || undefined" :alt="name" size="lg" class="ring-2 ring-white dark:ring-neutral-900 shadow-lg" />

                <span
                  class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-neutral-950 bg-emerald-500" />
              </div>

              <div class="min-w-0 flex-1">
                <h3 class="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                  {{ name }}
                </h3>

                <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {{ user?.email }}
                </p>
              </div>

              <UButton icon="lucide:x" variant="ghost" color="neutral" size="xs" class="rounded-xl"
                @click="drawerOpen = false" />
            </div>
          </div>
        </template>

        <!-- Body -->
        <template #body>
          <div v-if="user" class="space-y-6 py-2">
            <!-- Roles -->
            <div>
              <div class="mb-3 px-1">
                <div class="mb-3 flex items-center justify-between">
                  <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Switch Role
                  </p>
                  <div
                    class="rounded-full border border-neutral-200 dark:border-white/10 px-2 py-1 text-[10px] text-neutral-500">
                    {{ userRoles.length }} roles
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <button v-for="role in userRoles" :key="role.value"
                  class="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border p-3 transition-all duration-200"
                  :class="activeRole === role.value
                      ? 'border-primary-500/20 bg-primary-500/8'
                      : 'border-neutral-200/70 dark:border-white/5 bg-gray-100 dark:bg-white/2 hover:border-primary-500/20 hover:bg-white dark:hover:bg-white/5'
                    " @click="switchRole(role.value)">
                  <!-- glow -->
                  <div v-if="activeRole === role.value"
                    class="absolute inset-y-0 left-0 w-1 rounded-r-full bg-primary" />

                  <div class="flex h-11 w-11 items-center justify-center rounded-2xl transition-all" :class="activeRole === role.value
                      ? 'bg-primary text-white shadow-lg shadow-primary-500/20'
                      : 'bg-white dark:bg-white/4 text-neutral-500 border border-neutral-200 dark:border-white/5'
                    ">
                    <UIcon :name="role.icon" class="text-base" />
                  </div>

                  <div class="min-w-0 flex-1 text-left">
                    <p class="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                      {{ role.label }}
                    </p>

                    <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {{ role.desc }}
                    </p>
                  </div>

                  <Transition enter-active-class="transition duration-200" enter-from-class="scale-75 opacity-0"
                    enter-to-class="scale-100 opacity-100">
                    <div v-if="activeRole === role.value"
                      class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
                      <UIcon name="lucide:check" class="size-3.5" />
                    </div>
                  </Transition>
                </button>
              </div>
            </div>

            <!-- Menu -->
            <div class="space-y-1.5 border-t border-gray-200/60 dark:border-white/10 pt-4">
              <UButton icon="lucide:user" variant="ghost" color="neutral" size="md"
                class="group w-full justify-start rounded-xl px-3 py-2.5 md:hover:bg-primary-100 dark:md:hover:bg-primary-900/60 md:hover:ring-primary-300 hover:text-primary-600 dark:hover:text-primary-200 border-transparent cursor-pointer"
                to="/profile" @click="drawerOpen = false">
                <span class="flex-1 text-left text-sm font-medium">My Profile</span>
              </UButton>

              <UButton v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])" icon="lucide:settings" variant="ghost"
                color="neutral" size="md"
                class="group w-full justify-start rounded-xl px-3 py-2.5 md:hover:bg-primary-100 dark:md:hover:bg-primary-900/60 md:hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-200 border-transparent cursor-pointer   "
                to="/settings/school" @click="drawerOpen = false">
                <span class="flex-1 text-left text-sm font-medium">Settings</span>
              </UButton>

              <UButton v-if="can([Role.ACCOUNTANT])" icon="lucide:settings" variant="ghost" color="neutral" size="md"
                class="group w-full justify-start rounded-xl px-3 py-2.5 md:hover:bg-primary-100 dark:md:hover:bg-primary-900/60 md:hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-200 border-transparent cursor-pointer   "
                to="/settings/fee-categories" @click="drawerOpen = false">
                <span class="flex-1 text-left text-sm font-medium">Fee Categories</span>
              </UButton>

              <UButton icon="lucide:bell" variant="ghost" color="neutral" size="md"
                class="group w-full justify-start rounded-xl px-3 py-2.5 md:hover:bg-primary-100 dark:md:hover:bg-primary-900/60 md:hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-200 border-transparent cursor-pointer"
                to="/communicate/notifications" @click="drawerOpen = false">
                <span class="flex-1 text-left text-sm font-medium">Notifications</span>
              </UButton>

              <UButton icon="lucide:life-buoy" variant="ghost" color="neutral" size="md"
                class="group w-full justify-start rounded-xl px-3 py-2.5 md:hover:bg-primary-100 dark:md:hover:bg-primary-900/60 md:hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-200 border-transparent cursor-pointer"
                to="/support" @click="drawerOpen = false">
                <span class="flex-1 text-left text-sm font-medium">Help & Support</span>
              </UButton>

              <UButton v-if="canInstall" icon="lucide:download" variant="ghost" color="neutral" size="md"
                class="group w-full justify-start rounded-xl px-3 py-2.5 md:hover:bg-primary-100 dark:md:hover:bg-primary-900/60 md:hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-200 border-transparent cursor-pointer"
                @click="installApp">
                <span class="flex-1 text-left text-sm font-medium">Install App</span>
              </UButton>
              <div class="border-t border-gray-200/60 dark:border-white/10 pt-4 mt-2">
                <div class="mb-3 px-1">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    Appearance
                  </p>
                </div>

                <div
                  class="flex items-center justify-between rounded-2xl border border-gray-200/70 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10">
                      <UIcon :name="colorMode.value === 'dark' ? 'lucide:moon' : 'lucide:sun'"
                        class="text-primary text-lg" />
                    </div>

                    <div>
                      <p class="text-sm font-semibold">Theme</p>

                      <p class="text-xs text-neutral-500 dark:text-neutral-400">
                        {{ colorMode.value === "dark" ? "Dark mode" : "Light mode" }}
                      </p>
                    </div>
                  </div>

                  <USwitch :model-value="colorMode.value === 'dark'"
                    @update:model-value="colorMode.preference = $event ? 'dark' : 'light'" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Footer -->
        <template #footer>
          <div class="pt-3 w-full">
            <UButton to="/logout" icon="lucide:log-out" variant="soft" color="error" size="md"
              class="w-full justify-center flex items-center">
              <span class="text-sm font-semibold">Sign out</span>
            </UButton>
          </div>
        </template>
      </USlideover>

      <template #fallback>
        <div class="flex items-center gap-3">
          <div class="space-y-2 flex flex-col items-end">
            <USkeleton class="h-3 w-24 rounded-full" />
            <USkeleton class="h-2 w-16 rounded-full" />
          </div>

          <USkeleton class="h-10 w-10 rounded-full" />
        </div>
      </template>
    </ClientOnly>

    <div v-if="loading" class="flex items-center gap-3">
      <div v-if="!compact" class="space-y-2 flex flex-col items-end">
        <USkeleton class="h-3 w-24 rounded-full" />
        <USkeleton class="h-2 w-16 rounded-full" />
      </div>

      <USkeleton :class="compact ? 'h-9 w-9 rounded-full' : 'h-10 w-10 rounded-full'" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });

const userStore = useUserStore();
const { user, meLoading: loading } = storeToRefs(userStore);

const { activeRole, can, setActiveRole } = useAuth();
const { show, hide } = useGlobalLoader();
const { canInstall, install } = usePwaInstall();

const drawerOpen = ref(false);

const userRoleLabel = computed(() => parseRole[activeRole.value] || 'No Role')
const name = computed(() =>
  user.value ? `${user.value.givenNames} ${user.value.familyName}` : ""
);

const roleDesc: Record<string, string> = {
  PROPRIETOR: "School owner & oversight",
  OWNER: "Organization owner & full control",
  ADMIN: "Full system access",
  TEACHER: "Classes & students",
  PARENT: "Child progress",
  ACCOUNTANT: "Finance & fees",
};

const roleIcons: Record<string, string> = {
  PROPRIETOR: "lucide:crown",
  OWNER: "lucide:award",
  ADMIN: "lucide:shield",
  TEACHER: "lucide:book-open",
  PARENT: "lucide:users",
  ACCOUNTANT: "lucide:calculator",
};
const colorMode = useColorMode();

const userRoles = computed(() =>
  (user.value?.roles ?? []).map((r: string) => ({
    value: r,
    label: r.charAt(0).toUpperCase() + r.slice(1),
    desc: roleDesc[r] ?? "Access level",
    icon: roleIcons[r] ?? "lucide:user",
  }))
);

async function switchRole(role: string) {
  drawerOpen.value = false;

  show({
    title: `Switching to ${role}`,
    subtitle: "Updating your workspace",
  });

  try {
    setActiveRole(role);
    await navigateTo("/");
  } finally {
    hide();
  }
}

async function installApp() {
  const installResult = await install();

  if (installResult !== "unavailable") {
    drawerOpen.value = false;
  }
}
</script>
