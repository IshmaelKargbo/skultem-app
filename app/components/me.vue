<template>
    <div class="relative flex items-center" ref="dropdownRef">

        <ClientOnly>
            <!-- Trigger -->
            <button
                v-if="user && user.email && !loading"
                @click="dropdownOpen = !dropdownOpen"
                class="flex items-center gap-2 px-2 py-1.5 rounded-md border border-transparent hover:bg-gray-100 hover:border-gray-200 dark:hover:bg-gray-800 dark:hover:border-gray-700 transition-all duration-150"
                :class="{ 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700': dropdownOpen }"
            >
                <div class="text-left">
                    <p class="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight">{{ name }}</p>
                    <p class="text-[10px] text-gray-400 leading-tight capitalize">
                        Role: {{ parseRole[activeRole] || 'No Role' }}
                    </p>
                </div>
                <div class="relative">
                    <UAvatar :alt="name" size="sm" />
                    <span class="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                </div>
                <UIcon
                    name="lucide:chevron-down"
                    class="text-gray-400 text-sm transition-transform duration-200"
                    :class="{ 'rotate-180': dropdownOpen }"
                />
            </button>

            <!-- Skeleton (also used as SSR fallback) -->
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

        <!-- Skeleton shown while loading on client -->
        <div v-if="loading" class="flex items-center gap-2.5">
            <div class="space-y-1.5 flex flex-col items-end">
                <USkeleton class="h-2.5 w-20" />
                <USkeleton class="h-2 w-14" />
            </div>
            <USkeleton class="h-8 w-8 rounded-full" />
        </div>

        <!-- Dropdown Panel -->
        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
            <div
                v-if="dropdownOpen && user"
                class="absolute top-[calc(100%+8px)] right-0 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl shadow-black/10 z-50 overflow-hidden"
            >
                <!-- Header -->
                <div class="flex items-center gap-3 px-4 py-3.5">
                    <div class="relative shrink-0">
                        <UAvatar :alt="name" size="md" />
                        <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-indigo-500 rounded-full" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold truncate">{{ name }}</p>
                        <p class="text-[12px] text-gray-400 truncate">{{ user.email }}</p>
                    </div>
                    <UButton
                        icon="lucide:x"
                        variant="ghost"
                        size="xs"
                        @click="dropdownOpen = false"
                    />
                </div>

                <!-- Active role -->
                <div class="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                    <UIcon name="lucide:shield-check" class="text-green-500 text-xs" />
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                        Active as
                        <strong class="text-primary capitalize">{{ parseRole[activeRole] }}</strong>
                    </span>
                </div>

                <!-- Role switcher -->
                <div class="p-2 pb-0">
                    <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 px-2 pb-1.5">
                        Switch Role
                    </p>
                    <div class="space-y-0.5 border-y py-2 border-gray-100 dark:border-gray-700">
                        <button
                            v-for="role in userRoles"
                            :key="role.value"
                            class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl border transition-all text-left"
                            :class="activeRole === role.value
                                ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800'
                                : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'"
                            @click="switchRole(role.value)"
                        >
                            <span
                                class="w-7 h-7 flex items-center justify-center rounded-lg shrink-0"
                                :class="activeRole === role.value
                                    ? 'bg-indigo-100 dark:bg-indigo-900'
                                    : 'bg-gray-100 dark:bg-gray-800'"
                            >
                                <UIcon
                                    :name="role.icon"
                                    class="text-sm"
                                    :class="activeRole === role.value
                                        ? 'text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-500'"
                                />
                            </span>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    {{ parseRole[role.label] }}
                                </p>
                                <p class="text-xs text-gray-400 truncate">{{ role.desc }}</p>
                            </div>
                            <UIcon
                                v-if="activeRole === role.value"
                                name="lucide:check"
                                class="text-indigo-500 text-xs shrink-0"
                            />
                        </button>
                    </div>
                </div>

                <!-- Quick links -->
                <div class="p-2 border-b border-gray-100 dark:border-gray-700">
                    <UButton
                        icon="lucide:user"
                        variant="ghost"
                        color="neutral"
                        size="sm"
                        class="w-full justify-start"
                        to="/profile"
                        @click="dropdownOpen = false"
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
                        @click="dropdownOpen = false"
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
                        @click="dropdownOpen = false"
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
                        @click="dropdownOpen = false"
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
                        @click="dropdownOpen = false"
                    >
                        <span class="flex-1 text-left">Help & Support</span>
                    </UButton>
                </div>

                <!-- Logout -->
                <div class="p-2">
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
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const { user, meLoading: loading } = storeToRefs(userStore)
const { activeRole, can, setActiveRole } = useAuth()
const { show, hide } = useGlobalLoader()

const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const name = computed(() =>
    user.value ? `${user.value.givenNames} ${user.value.familyName}` : ''
)

const parseRole: Record<string, string> = {
    Proprietor: 'Proprietor',
    proprietor: 'Proprietor',
    Admin: 'Admin',
    admin: 'Admin',
    Teacher: 'Teacher',
    teacher: 'Teacher',
    Student: 'Student',
    student: 'Student',
    Parent: 'Parent',
    parent: 'Parent',
    Accountant: 'Accountant',
    accountant: 'Accountant',
}

const roleDesc: Record<string, string> = {
    proprietor: 'School owner & oversight',
    admin: 'Full system access',
    teacher: 'Classes & students',
    student: 'Courses & grades',
    parent: 'Child progress',
    accountant: 'Finance & fees',
}

const roleIcons: Record<string, string> = {
    proprietor: 'lucide:crown',
    admin: 'lucide:shield',
    teacher: 'lucide:book-open',
    student: 'lucide:graduation-cap',
    parent: 'lucide:users',
    accountant: 'lucide:calculator',
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
    dropdownOpen.value = false
    show({ title: `Switching to ${role}`, subtitle: 'Updating your workspace' })
    try {
        setActiveRole(role)
        await navigateTo('/')
    } finally {
        hide()
    }
}

function handleOutsideClick(e: MouseEvent) {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
        dropdownOpen.value = false
    }
}

onMounted(async () => {
    await userStore.me()
    document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick)
})
</script>