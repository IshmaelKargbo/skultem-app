<template>
    <StudentView>
        <UCard class="overflow-hidden">
            <template #header>
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-user" class="size-5 text-primary" />
                        <h3 class="text-lg font-semibold">
                            Student Information
                        </h3>
                    </div>

                    <p class="text-sm text-muted">
                        Personal details and contact information.
                    </p>
                </div>
            </template>

            <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div v-for="i in 6" :key="i" class="rounded-2xl border border-default p-4 space-y-3">
                    <USkeleton class="h-3 w-20" />
                    <USkeleton class="h-5 w-32" />
                </div>
            </div>
            <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                <div
                    class="rounded-2xl border border-default bg-gray-50 p-4 transition hover:border-primary/40 dark:bg-neutral-800">
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon name="i-lucide-user-round" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            Given Names
                        </p>
                    </div>

                    <p class="mt-2 font-semibold">
                        {{ record?.givenNames || '-' }}
                    </p>
                </div>

                <div
                    class="rounded-2xl border border-default bg-gray-50 p-4 transition hover:border-primary/40 dark:bg-neutral-800">
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon name="i-lucide-user" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            Family Name
                        </p>
                    </div>

                    <p class="mt-2 font-semibold">
                        {{ record?.familyName || '-' }}
                    </p>
                </div>

                <div
                    class="rounded-2xl border border-default bg-gray-50 p-4 transition hover:border-primary/40 dark:bg-neutral-800">
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon name="i-lucide-calendar-days" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            Date of Birth
                        </p>
                    </div>

                    <p class="mt-2 font-semibold">
                        {{ record?.dateOfBirth || '-' }}
                    </p>
                </div>

                <div
                    class="rounded-2xl border border-default bg-gray-50 p-4 transition hover:border-primary/40 dark:bg-neutral-800">
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon name="i-lucide-users" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            Gender
                        </p>
                    </div>

                    <p class="mt-2 font-semibold">
                        {{ clean(record?.gender || '') || '-' }}
                    </p>
                </div>

                <div
                    class="rounded-2xl border border-default bg-gray-50 p-4 transition hover:border-primary/40 dark:bg-neutral-800">
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon name="i-lucide-map-pinned" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            City
                        </p>
                    </div>

                    <p class="mt-2 font-semibold">
                        {{ record?.city || '-' }}
                    </p>
                </div>

                <div
                    class="rounded-2xl border border-default bg-gray-50 p-4 transition hover:border-primary/40 dark:bg-neutral-800">
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon name="i-lucide-house" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            Address
                        </p>
                    </div>

                    <p class="mt-2 font-semibold">
                        {{ record?.street || '-' }}
                    </p>
                </div>

            </div>
        </UCard>
        <UCard class="overflow-hidden">
            <template #header>
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-users" class="size-5 text-primary" />
                    <h3 class="text-lg font-semibold">
                        Parent / Guardian Information
                    </h3>
                </div>
            </template>

            <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div v-for="i in 6" :key="i" class="rounded-2xl border border-default p-4 space-y-3">
                    <USkeleton class="h-3 w-20" />
                    <USkeleton class="h-5 w-32" />
                </div>
            </div>
            <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                <div
                    class="rounded-2xl border border-default bg-gray-50 p-4 transition hover:border-primary/40 dark:bg-neutral-800">
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon name="i-lucide-user-round-check" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            Guardian Name
                        </p>
                    </div>

                    <p class="mt-2 font-semibold">
                        {{ record?.guardian?.givenNames || '-' }}
                        {{ record?.guardian?.familyName || '' }}
                    </p>
                </div>

                <div
                    class="rounded-2xl border border-default bg-gray-50 p-4 transition hover:border-primary/40 dark:bg-neutral-800">
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon name="i-lucide-users-round" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            Relationship
                        </p>
                    </div>

                    <p class="mt-2 font-semibold">
                        {{ clean(record?.relationship || '') || '-' }}
                    </p>
                </div>

                <div
                    class="rounded-2xl border border-default bg-gray-50 p-4 transition hover:border-primary/40 dark:bg-neutral-800">
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon name="i-lucide-phone" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            Phone Number
                        </p>
                    </div>

                    <p class="mt-2 font-semibold">
                        {{ record?.guardian?.phone || '-' }}
                    </p>
                </div>

                <div
                    class="rounded-2xl border border-default bg-gray-50 p-4 transition hover:border-primary/40 dark:bg-neutral-800">
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon name="i-lucide-mail" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            Email
                        </p>
                    </div>

                    <p class="mt-2 font-semibold break-all">
                        {{ record?.guardian?.email || '-' }}
                    </p>
                </div>

                <div
                    class="rounded-2xl border border-default bg-gray-50 p-4 transition hover:border-primary/40 dark:bg-neutral-800">
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon name="i-lucide-map-pinned" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            City
                        </p>
                    </div>

                    <p class="mt-2 font-semibold">
                        {{ record?.guardian?.city || '-' }}
                    </p>
                </div>

                <div
                    class="rounded-2xl border border-default bg-gray-50 p-4 transition hover:border-primary/40 dark:bg-neutral-800">
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon name="i-lucide-house" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            Address
                        </p>
                    </div>

                    <p class="mt-2 font-semibold">
                        {{ record?.guardian?.street || '-' }}
                    </p>
                </div>

            </div>
        </UCard>
    </StudentView>
</template>

<script setup lang="ts">
const store = useStudentStore()
const { record, loading } = storeToRefs(store)

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})

onMounted(() => {
    useAppStore().setTitle('View Student')
    useAppStore().setBack(true)

    document.title = 'View Student | Students | Skultem'
})
</script>
