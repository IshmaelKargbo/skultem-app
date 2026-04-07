<template>
    <div class="flex items-center">
        <ClientOnly>
            <USlideover
                v-model:open="drawerOpen"
                :dismissible="true"
                :ui="{ content: 'w-full max-w-sm' }"
            >
                <UButton
                    v-if="user && user.email && !loading"
                    color="neutral"
                    variant="ghost"
                    class="gap-2 px-2 py-1.5 rounded-md"
                    :ui="{ base: 'border border-transparent hover:bg-app-50 hover:border-app-100' }"
                >
                    <div class="text-left">
                        <p class="text-xs font-semibold text-neutral-800 leading-tight">{{ name }}</p>
                        <p class="text-[10px] text-mute leading-tight capitalize">
                            Role: {{ parseRole[activeRole] || 'No Role' }}
                        </p>
                    </div>
                    <div class="relative">
                        <UAvatar :alt="name" size="sm" />
                        <span class="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-white rounded-full" />
                    </div>
                </UButton>

                <template #fallback>
                    <div class="flex items-center gap-2.5">
                        <div class="space-y-1.5 flex flex-col items-end">
                            <USkeleton class="h-2.5 w-20" />
                            <USkeleton class="h-2 w-14" />
                        </div>
                        <USkeleton class="h-8 w-8 rounded-full" />
                    </div>
                </template>

                <template #header>
                    <div class="flex items-center gap-3 w-full">
                        <div class="relative shrink-0">
                            <UAvatar :alt="name" size="md" />
                            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-indigo-500 rounded-full" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold truncate">{{ name }}</p>
                            <p class="text-[12px] text-mute truncate">{{ user?.email }}</p>
                        </div>
                        <UButton
                            icon="lucide:x"
                            variant="ghost"
                            size="xs"
                            @click="drawerOpen = false"
                        />
                    </div>
                </template>

                <template #body>
                    <div v-if="user" class="space-y-4">
                        <div class="flex items-center gap-2 px-1 py-2 rounded-lg bg-app-50/70 border border-app-100/70">
                            <UIcon name="lucide:shield-check" class="text-green-500 text-xs" />
                            <span class="text-xs text-mute">
                                Active as
                                <strong class="text-primary capitalize">{{ parseRole[activeRole] }}</strong>
                            </span>
                        </div>

                        <div>
                            <p class="text-xs font-semibold uppercase tracking-widest text-mute px-1 pb-1.5">
                                Switch Role
                            </p>
                            <div class="space-y-1 border-y py-2 border-app-100/70">
                                <button
                                    v-for="role in userRoles"
                                    :key="role.value"
                                    class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl border transition-all text-left"
                                    :class="activeRole === role.value
                                        ? 'bg-app-50 border-app-200'
                                        : 'border-transparent hover:bg-app-50/70'"
                                    @click="switchRole(role.value)"
                                >
                                    <span
                                        class="w-7 h-7 flex items-center justify-center rounded-lg shrink-0"
                                        :class="activeRole === role.value ? 'bg-app-100' : 'bg-app-50'"
                                    >
                                        <UIcon
                                            :name="role.icon"
                                            class="text-sm"
                                            :class="activeRole === role.value ? 'text-app-700' : 'text-mute'"
                                        />
                                    </span>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-xs font-semibold text-neutral-800">
                                            {{ parseRole[role.label] }}
                                        </p>
                                        <p class="text-xs text-mute truncate">{{ role.desc }}</p>
                                    </div>
                                    <UIcon
                                        v-if="activeRole === role.value"
                                        name="lucide:check"
                                        class="text-app-600 text-xs shrink-0"
                                    />
                                </button>
                            </div>
                        </div>

                        <div class="space-y-1 border-b border-app-100/70 pb-3">
                            <UButton
                                icon="lucide:user"
                                variant="ghost"
                                color="neutral"
                                size="sm"
                                class="w-full justify-start"
                                to="/profile"
                                @click="drawerOpen = false"
                            >
                                <span class="flex-1 text-left">My Profile</span>
                            </UButton>
                            <UButton
                                v-if="can([Role.ADMIN, Role.PROPRIETOR])"
                                icon="lucide:settings"
                                variant="ghost"
                                color="neutral"
                                size="sm"
                                class="w-full justify-start"
                                to="/settings"
                                @click="drawerOpen = false"
                            >
                                <span class="flex-1 text-left">Settings</span>
                            </UButton>
                            <UButton
                                v-if="can([Role.ACCOUNTANT])"
                                icon="lucide:settings"
                                variant="ghost"
                                color="neutral"
                                size="sm"
                                class="w-full justify-start"
                                to="/settings/fee-categories"
                                @click="drawerOpen = false"
                            >
                                <span class="flex-1 text-left">Settings</span>
                            </UButton>
                            <UButton
                                icon="lucide:bell"
                                variant="ghost"
                                color="neutral"
                                size="sm"
                                class="w-full justify-start"
                                to="/notifications"
                                @click="drawerOpen = false"
                            >
                                <span class="flex-1 text-left">Notifications</span>
                            </UButton>
                            <UButton
                                icon="lucide:life-buoy"
                                variant="ghost"
                                color="neutral"
                                size="sm"
                                class="w-full justify-start"
                                to="/support"
                                @click="drawerOpen = false"
                            >
                                <span class="flex-1 text-left">Help & Support</span>
                            </UButton>
                            <UButton
                                v-if="canInstall"
                                icon="lucide:download"
                                variant="ghost"
                                color="neutral"
                                size="sm"
                                class="w-full justify-start"
                                @click="installApp"
                            >
                                <span class="flex-1 text-left">Install App</span>
                            </UButton>
                        </div>
                    </div>
                </template>

                <template #footer>
                    <UButton
                        to="/logout"
                        icon="lucide:log-out"
                        variant="ghost"
                        color="error"
                        size="sm"
                        class="w-full justify-start"
                    >
                        Sign out
                    </UButton>
                </template>
            </USlideover>

            <template #fallback>
                <div class="flex items-center gap-2.5">
                    <div class="space-y-1.5 flex flex-col items-end">
                        <USkeleton class="h-2.5 w-20" />
                        <USkeleton class="h-2 w-14" />
                    </div>
                    <USkeleton class="h-8 w-8 rounded-full" />
                </div>
            </template>
        </ClientOnly>

        <div v-if="loading" class="flex items-center gap-2.5">
            <div class="space-y-1.5 flex flex-col items-end">
                <USkeleton class="h-2.5 w-20" />
                <USkeleton class="h-2 w-14" />
            </div>
            <USkeleton class="h-8 w-8 rounded-full" />
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
    user.value ? `${user.value.givenNames} ${user.value.familyName}` : ''
)

const parseRole: Record<string, string> = {
    PROPRIETOR: 'Proprietor',
    ADMIN: 'Admin',
    TEACHER: 'Teacher',
    PARENT: 'Parent',
    ACCOUNTANT: 'Accountant'
}

const roleDesc: Record<string, string> = {
    PROPRIETOR: 'School owner & oversight',
    ADMIN: 'Full system access',
    TEACHER: 'Classes & students',
    PARENT: 'Child progress',
    ACCOUNTANT: 'Finance & fees',
}

const roleIcons: Record<string, string> = {
    PROPRIETOR: 'lucide:crown',
    ADMIN: 'lucide:shield',
    TEACHER: 'lucide:book-open',
    PARENT: 'lucide:users',
    ACCOUNTANT: 'lucide:calculator',
}

const userRoles = computed(() =>
    (user.value?.roles ?? []).map((r: string) => ({
        value: r,
        label: r.charAt(0).toUpperCase() + r.slice(1),
        desc: roleDesc[r] ?? 'Access level',
        icon: roleIcons[r] ?? 'lucide:user',
    }))
)

async function switchRole(role: string) {
    drawerOpen.value = false
    show({ title: `Switching to ${role}`, subtitle: 'Updating your workspace' })
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
