<template>
  <div class="space-y-4 px-4 md:px-6">
    <div class="grid items-start gap-4 lg:grid-cols-3">
      <!-- Left: summary, filters and every module -->
      <div class="min-w-0 space-y-4 lg:col-span-2">

        <!-- Redirected here from a link to an uninstalled feature -->
        <UAlert v-if="requestedModule && !requestedModule.installed" color="info" variant="soft" icon="i-lucide-info"
          :title="`${requestedModule.label} isn't installed yet`"
          :description="`Install it below to use ${requestedModule.label}.`" />

        <!-- Search + filter -->
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search modules..." class="w-full sm:max-w-sm" />

          <div class="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
              class="inline-flex min-w-max gap-1 rounded-3xl border border-gray-200 bg-white p-1.5 dark:border-gray-800 dark:bg-gray-900">
              <button v-for="option in filterOptions" :key="option.value" type="button"
                class="flex items-center gap-1.5 rounded-3xl px-3 py-2 text-[12px] whitespace-nowrap transition-all duration-200 sm:text-sm"
                :class="filter === option.value
                  ? 'bg-secondary-100 text-secondary-600 font-semibold dark:bg-secondary-800 dark:text-secondary-200'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'"
                @click="filter = option.value">
                {{ option.label }}
                <span class="text-xs opacity-70">{{ option.count }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="!ready" class="grid gap-4 md:grid-cols-2">
          <UCard v-for="i in 6" :key="i">
            <div class="animate-pulse space-y-3">
              <div class="flex items-center gap-3">
                <USkeleton class="size-10 rounded-xl" />
                <USkeleton class="h-4 w-32" />
              </div>
              <USkeleton class="h-3 w-full" />
              <USkeleton class="h-3 w-2/3" />
            </div>
          </UCard>
        </div>

        <!-- Nothing matches -->
        <UCard v-else-if="!groups.length">
          <div class="flex flex-col items-center gap-2 py-10 text-center">
            <UIcon name="i-lucide-search-x" class="text-4xl text-gray-400" />
            <p class="font-medium text-highlighted">No modules match</p>
            <p class="text-sm text-muted">Try a different search or filter.</p>
            <UButton label="Clear filters" color="neutral" variant="outline" size="sm" class="mt-2"
              @click="clearFilters" />
          </div>
        </UCard>

        <!-- Modules, by category -->
        <section v-for="group in groups" :key="group.category" class="space-y-3">
          <SectionHeader :icon="CATEGORY_ICON[group.category] ?? 'i-lucide-blocks'" :label="group.label" />

          <div class="grid gap-4 md:grid-cols-2">
            <UCard v-for="module in group.modules" :id="`module-${module.key}`" :key="module.key"
              class="h-full overflow-hidden border-t-2 transition-shadow hover:shadow-md"
              :class="module.key === requestedKey ? 'ring-2! ring-primary!' : ''"
              :ui="{
                body: 'p-0 sm:p-0'
              }"
              :style="{ borderTopColor: module.installed ? 'var(--ui-success)' : 'var(--ui-border-accented)' }">
              <template #header>
                <div class="flex items-start gap-3">
                  <div
                    class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                    <UIcon :name="MODULE_ICON[module.key] ?? 'i-lucide-blocks'" class="size-5 text-primary" />
                  </div>

                  <div class="min-w-0 flex-1 space-y-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <p class="font-display font-semibold leading-tight">{{ module.label }}</p>
                      <UBadge v-if="module.installed" color="success" variant="subtle" size="sm" label="Installed" />
                      <UBadge v-else-if="module.starter" color="primary" variant="subtle" size="sm" label="Starter" />
                    </div>
                    <p class="text-xs-base text-muted">{{ module.description }}</p>
                  </div>
                </div>
              </template>
              <div class="flex h-full flex-col gap-4">
                <p v-if="module.requires.length"
                  class="flex flex-wrap items-center gap-x-1.5 gap-y-1 p-3 text-xs text-muted">
                  <UIcon name="i-lucide-link" class="size-3.5" />
                  Needs
                  <UBadge v-for="key in module.requires" :key="key" variant="subtle" size="sm"
                    :color="isInstalled(key) ? 'success' : 'neutral'" :label="labelFor(key)" />
                </p>
              </div>
              <template #footer>
                <div class="mt-auto flex items-center justify-between gap-3">
                  <p v-if="module.installed && blockedBy(module).length" class="text-xs text-muted">
                    Needed by {{ blockedBy(module).join(', ') }}
                  </p>
                  <span v-else />

                  <UButton v-if="module.installed" label="Disable" color="neutral" variant="outline" size="sm"
                    :loading="busyKey === module.key" :disabled="!!busyKey || blockedBy(module).length > 0"
                    @click="askToDisable(module)" />
                  <UButton v-else label="Install" icon="i-lucide-plus" size="sm" :loading="busyKey === module.key"
                    :disabled="!!busyKey" @click="install(module)" />
                </div>
              </template>
            </UCard>
          </div>
        </section>
      </div>

      <aside class="lg:sticky lg:top-4 space-y-4 lg:col-span-1">
        <!-- Right: always included - stays in view while the modules scroll -->
        <div class="grid grid-cols-1 gap-4">
          <Metric :record="{
            color: 'success',
            icon: 'i-lucide-circle-check',
            label: 'Installed',
            value: installedCount,
            subtle: `of ${modules.length} modules`,
            isReady: ready,
          }" />
          <Metric :record="{
            color: 'primary',
            icon: 'i-lucide-blocks',
            label: 'Available to install',
            value: modules.length - installedCount,
            subtle: 'Add them any time',
            isReady: ready,
          }" />
        </div>
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-badge-check" class="text-primary text-2xl" />
              <div>
                <p class="font-semibold">Always included</p>
                <p class="text-sm text-muted hidden md:block">The essentials every school has. These can't be removed.
                </p>
              </div>
            </div>
          </template>

          <div class="space-y-3">
            <div v-for="feature in CORE_FEATURES" :key="feature.label" class="flex items-center gap-2.5 text-sm">
              <UIcon :name="feature.icon" class="size-4 shrink-0 text-primary" />
              <span>{{ feature.label }}</span>
            </div>
          </div>
        </UCard>
      </aside>
    </div>

    <!-- Disable confirmation -->
    <UModal v-model:open="confirmOpen">
      <template #content>
        <UCard v-if="toDisable">
          <template #header>
            <h3 class="text-lg font-semibold">Disable {{ toDisable.label }}?</h3>
          </template>

          <p class="text-sm text-muted">
            {{ toDisable.label }} will be hidden from the menu and switched off for everyone in your school.
            All of its data is kept, and installing it again brings everything back exactly as it was.
          </p>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton label="Cancel" color="neutral" variant="outline" @click="confirmOpen = false" />
              <UButton label="Disable" color="error" :loading="busyKey === toDisable.key" @click="disable" />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const store = useModuleStore();
const { modules, loading } = storeToRefs(store);
const { success: toastSuccess, error: toastError } = useNotify();

const busyKey = ref("");
const confirmOpen = ref(false);
const toDisable = ref<SchoolModule>();

// Skeletons only until the first list has arrived - a refresh after install/disable keeps the cards.
const ready = computed(() => !loading.value || modules.value.length > 0);

// --- Search and filter ---------------------------------------------------------------------------
type ModuleFilter = "all" | "installed" | "available";

const search = ref("");
const filter = ref<ModuleFilter>("all");

const installedCount = computed(() => modules.value.filter((m) => m.installed).length);

const filterOptions = computed<{ value: ModuleFilter; label: string; count: number }[]>(() => [
  { value: "all", label: "All", count: modules.value.length },
  { value: "installed", label: "Installed", count: installedCount.value },
  { value: "available", label: "Available", count: modules.value.length - installedCount.value },
]);

// The catalog grouped by category, narrowed by the search text and the installed/available filter;
// a category with nothing left in it is dropped.
const groups = computed(() => {
  const text = search.value.trim().toLowerCase();

  return store.byCategory
    .map((group) => ({
      ...group,
      modules: group.modules.filter((m) => {
        if (filter.value === "installed" && !m.installed) return false;
        if (filter.value === "available" && m.installed) return false;
        return !text || m.label.toLowerCase().includes(text) || m.description.toLowerCase().includes(text);
      }),
    }))
    .filter((group) => group.modules.length);
});

function clearFilters() {
  search.value = "";
  filter.value = "all";
}

// --- Redirected here from a link to an uninstalled feature (see auth.global.ts) -------------------
// Highlight that module and - once it's installed - take the user back to where they were headed.
const requestedKey = computed(() => String(route.query.install ?? ""));
const requestedModule = computed(() => modules.value.find((m) => m.key === requestedKey.value));
const redirectTo = computed(() => String(route.query.redirect ?? ""));

function isInstalled(key: string) {
  return modules.value.find((m) => m.key === key)?.installed ?? false;
}

function labelFor(key: string) {
  return modules.value.find((m) => m.key === key)?.label ?? key;
}

// Installed modules that still need this one - the backend refuses to disable it while they do.
function blockedBy(module: SchoolModule) {
  return module.requiredBy.filter(isInstalled).map(labelFor);
}

async function install(module: SchoolModule) {
  const before = new Set(modules.value.filter((m) => m.installed).map((m) => m.key));

  try {
    busyKey.value = module.key;
    const updated = await store.install(module.key);
    if (!updated) return;

    // Anything that came along because this module needs it.
    const alsoInstalled = updated
      .filter((m) => m.installed && !before.has(m.key) && m.key !== module.key)
      .map((m) => m.label);

    toastSuccess(
      alsoInstalled.length
        ? `${module.label} installed, along with ${alsoInstalled.join(", ")}`
        : `${module.label} installed`,
    );

    if (module.key === requestedKey.value && redirectTo.value.startsWith("/")) {
      await navigateTo(redirectTo.value);
    }
  } catch (err: any) {
    toastError(err?.errors?.[0] || err?.message || "Could not install the module");
  } finally {
    busyKey.value = "";
  }
}

function askToDisable(module: SchoolModule) {
  toDisable.value = module;
  confirmOpen.value = true;
}

async function disable() {
  const module = toDisable.value;
  if (!module) return;

  try {
    busyKey.value = module.key;
    const updated = await store.disable(module.key);
    if (!updated) return;

    toastSuccess(`${module.label} disabled - its data is kept`);
    confirmOpen.value = false;
  } catch (err: any) {
    toastError(err?.errors?.[0] || err?.message || "Could not disable the module");
  } finally {
    busyKey.value = "";
  }
}

onMounted(async () => {
  useAppStore().setTitle("Modules");
  useAppStore().setBack(false);
  document.title = "Modules | Skultem";

  await store.fetch();

  // Bring the requested module into view once the cards have rendered.
  if (requestedKey.value) {
    await nextTick();
    document.getElementById(`module-${requestedKey.value}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR],
});
</script>
