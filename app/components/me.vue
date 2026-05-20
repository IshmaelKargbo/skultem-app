<template>
    <div class="flex items-center">
        <ClientOnly>
            <USlideover v-model:open="drawerOpen" :dismissible="true" :ui="{
                content:
                    'w-full max-w-sm bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl border-l border-gray-200/70 dark:border-white/10'
            }">
                <!-- Trigger -->
                <UButton v-if="user && user.email && !loading" color="neutral" variant="ghost"
                    class="group rounded-2xl px-3 py-2.5 transition-all duration-200 hover:bg-primary-100 dark:hover:bg-white/5 border border-transparent hover:border-primary-200 dark:hover:border-primary-800">
                    <div class="text-right pr-0.5">
                        <p class="text-xs font-semibold text-neutral-900 dark:text-white">
                            {{ name }}
                        </p>

                        <p class="text-[10px] text-neutral-500 dark:text-neutral-400">
                            {{ parseRole[activeRole] || 'No Role' }}
                        </p>
                    </div>

                    <div class="relative shrink-0">
                        <UAvatar :alt="name" size="md"  />

                        <span
                            class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-neutral-950 bg-emerald-500" />
                    </div>
                </UButton>

                <!-- Loading -->
                <template #fallback>
                    <div class="flex items-center gap-3">
                        <div class="space-y-2 flex flex-col items-end">
                            <USkeleton class="h-3 w-24 rounded-full" />
                            <USkeleton class="h-2 w-16 rounded-full" />
                        </div>

                        <USkeleton class="h-10 w-10 rounded-full" />
                    </div>
                </template>

                <!-- Header -->
                <template #header>
                    <div
                        class="relative overflow-hidden w-full ">
                        <div class="flex justify-between items-center gap-3">
                            <div class="relative shrink-0">
                                <UAvatar :alt="name" size="lg"
                                    class="ring-2 ring-white dark:ring-neutral-900 shadow-lg" />

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
                        <!-- Active Role -->
                        <div
                            class="flex  items-center gap-2 rounded-2xl border border-gray-200/60 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 px-3 py-3">
                            <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10">
                                <UIcon name="lucide:shield-check" class="text-sm text-emerald-500" />
                            </div>

                            <div>
                                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                                    Active Workspace
                                </p>

                                <p class="text-sm font-semibold text-neutral-900 dark:text-white">
                                    {{ parseRole[activeRole] }}
                                </p>
                            </div>
                        </div>

                        <!-- Roles -->
                        <div>
                            <div class="mb-3 px-1">
                                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                                    Switch Role
                                </p>
                            </div>

                            <div class="space-y-2">
                                <button v-for="role in userRoles" :key="role.value"
                                    class="group relative overflow-hidden flex items-center gap-3 w-full rounded-2xl p-3 transition-all duration-200"
                                    :class="activeRole === role.value
                                            ? 'bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400'
                                            : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                                        " @click="switchRole(role.value)">
                                    <div class="flex h-10 w-10 items-center justify-center rounded-xl transition-all"
                                        :class="activeRole === role.value
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-gray-100 dark:bg-white/5 text-neutral-500'
                                            ">
                                        <UIcon :name="role.icon" class="text-base" />
                                    </div>

                                    <div class="min-w-0 flex-1 text-left">
                                        <p class="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                            {{ parseRole[role.label] }}
                                        </p>

                                        <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">
                                            {{ role.desc }}
                                        </p>
                                    </div>

                                    <div v-if="activeRole === role.value"
                                        class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                                        <UIcon name="lucide:check" class="size-3" />
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- Menu -->
                        <div class="space-y-1.5 border-t border-gray-200/60 dark:border-white/10 pt-4">
                            <UButton icon="lucide:user" variant="ghost" color="neutral" size="md"
                                class="group w-full justify-start rounded-xl px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5"
                                to="/profile" @click="drawerOpen = false">
                                <span class="flex-1 text-left text-sm font-medium">My Profile</span>
                            </UButton>

                            <UButton v-if="can([Role.ADMIN, Role.PROPRIETOR])" icon="lucide:settings" variant="ghost"
                                color="neutral" size="md"
                                class="group w-full justify-start rounded-xl px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5"
                                to="/settings" @click="drawerOpen = false">
                                <span class="flex-1 text-left text-sm font-medium">Settings</span>
                            </UButton>

                            <UButton v-if="can([Role.ACCOUNTANT])" icon="lucide:settings" variant="ghost"
                                color="neutral" size="md"
                                class="group w-full justify-start rounded-xl px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5"
                                to="/settings/fee-categories" @click="drawerOpen = false">
                                <span class="flex-1 text-left text-sm font-medium">Fee Categories</span>
                            </UButton>

                            <UButton icon="lucide:bell" variant="ghost" color="neutral" size="md"
                                class="group w-full justify-start rounded-xl px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5"
                                to="/notifications" @click="drawerOpen = false">
                                <span class="flex-1 text-left text-sm font-medium">Notifications</span>
                            </UButton>

                            <UButton icon="lucide:life-buoy" variant="ghost" color="neutral" size="md"
                                class="group w-full justify-start rounded-xl px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5"
                                to="/support" @click="drawerOpen = false">
                                <span class="flex-1 text-left text-sm font-medium">Help & Support</span>
                            </UButton>

                            <UButton v-if="canInstall" icon="lucide:download" variant="ghost" color="neutral" size="md"
                                class="group w-full justify-start rounded-xl px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5"
                                @click="installApp">
                                <span class="flex-1 text-left text-sm font-medium">Install App</span>
                            </UButton>
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
            <div class="space-y-2 flex flex-col items-end">
                <USkeleton class="h-3 w-24 rounded-full" />
                <USkeleton class="h-2 w-16 rounded-full" />
            </div>

            <USkeleton class="h-10 w-10 rounded-full" />
        </div>
    </div>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const { user, meLoading: loading } = storeToRefs(userStore)

const { activeRole, can, setActiveRole } = useAuth()
const { show, hide } = useGlobalLoader()
const { canInstall, install } = usePwaInstall()

const drawerOpen = ref(false)

const name = computed(() =>
    user.value
        ? `${user.value.givenNames} ${user.value.familyName}`
        : ''
)

const roleDesc: Record<string, string> = {
    PROPRIETOR: 'School owner & oversight',
    OWNER: 'Organization owner & full control',
    ADMIN: 'Full system access',
    TEACHER: 'Classes & students',
    PARENT: 'Child progress',
    ACCOUNTANT: 'Finance & fees'
}

const roleIcons: Record<string, string> = {
    PROPRIETOR: 'lucide:crown',
    OWNER: 'lucide:award',
    ADMIN: 'lucide:shield',
    TEACHER: 'lucide:book-open',
    PARENT: 'lucide:users',
    ACCOUNTANT: 'lucide:calculator'
}

const userRoles = computed(() =>
    (user.value?.roles ?? []).map((r: string) => ({
        value: r,
        label: r.charAt(0).toUpperCase() + r.slice(1),
        desc: roleDesc[r] ?? 'Access level',
        icon: roleIcons[r] ?? 'lucide:user'
    }))
)

async function switchRole(role: string) {
    drawerOpen.value = false

    show({
        title: `Switching to ${role}`,
        subtitle: 'Updating your workspace'
    })

    try {
        setActiveRole(role)
        await navigateTo('/')
    } finally {
        hide()
    }
}

async function installApp() {
    const installed = await install()

    if (installed) {
        drawerOpen.value = false
    }
}
</script>
