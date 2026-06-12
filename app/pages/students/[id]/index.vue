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
                <div class="rounded-2xl border border-default p-4 space-y-1 bg-gray-50 dark:bg-neutral-800">
                    <p class="text-xs uppercase tracking-wide text-muted">
                        Given Names
                    </p>
                    <p class="font-semibold">
                        {{ record?.givenNames || '-' }}
                    </p>
                </div>

                <div class="rounded-2xl border border-default p-4 space-y-1 bg-gray-50 dark:bg-neutral-800">
                    <p class="text-xs uppercase tracking-wide text-muted">
                        Family Name
                    </p>
                    <p class="font-semibold">
                        {{ record?.familyName || '-' }}
                    </p>
                </div>

                <div class="rounded-2xl border border-default p-4 space-y-1 bg-gray-50 dark:bg-neutral-800">
                    <p class="text-xs uppercase tracking-wide text-muted">
                        Date of Birth
                    </p>
                    <p class="font-semibold">
                        {{ record?.dateOfBirth || '-' }}
                    </p>
                </div>

                <div class="rounded-2xl border border-default p-4 space-y-1 bg-gray-50 dark:bg-neutral-800">
                    <p class="text-xs uppercase tracking-wide text-muted">
                        Gender
                    </p>
                    <p class="font-semibold">
                        {{ clean(record?.gender || '') || '-' }}
                    </p>
                </div>

                <div class="rounded-2xl border border-default p-4 space-y-1 bg-gray-50 dark:bg-neutral-800">
                    <p class="text-xs uppercase tracking-wide text-muted">
                        City
                    </p>
                    <p class="font-semibold">
                        {{ record?.city || '-' }}
                    </p>
                </div>

                <div class="rounded-2xl border border-default p-4 space-y-1 bg-gray-50 dark:bg-neutral-800">
                    <p class="text-xs uppercase tracking-wide text-muted">
                        Address
                    </p>
                    <p class="font-semibold">
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
                <div class="rounded-xl border border-default p-4 bg-gray-50 dark:bg-neutral-800">
                    <p class="text-xs uppercase tracking-wide text-muted">
                        Guardian Name
                    </p>

                    <p class="font-semibold">
                        {{ record?.guardian?.givenNames || '-' }}
                        {{ record?.guardian?.familyName || '' }}
                    </p>
                </div>

                <div class="rounded-xl border border-default p-4 bg-gray-50 dark:bg-neutral-800">
                    <p class="text-xs uppercase tracking-wide text-muted">
                        Relationship
                    </p>

                    <p class="font-semibold">
                        {{ clean(record?.relationship || '') || '-' }}
                    </p>
                </div>

                <div class="rounded-xl border border-default p-4 bg-gray-50 dark:bg-neutral-800">
                    <p class="text-xs uppercase tracking-wide text-muted">
                        Phone Number
                    </p>

                    <p class="font-semibold">
                        {{ record?.guardian?.phone || '-' }}
                    </p>
                </div>

                <div class="rounded-xl border border-default p-4 bg-gray-50 dark:bg-neutral-800">
                    <p class="text-xs uppercase tracking-wide text-muted">
                        Email
                    </p>

                    <p class="font-semibold break-all">
                        {{ record?.guardian?.email || '-' }}
                    </p>
                </div>

                <div class="rounded-xl border border-default p-4 bg-gray-50 dark:bg-neutral-800">
                    <p class="text-xs uppercase tracking-wide text-muted">
                        City
                    </p>

                    <p class="font-semibold">
                        {{ record?.guardian?.city || '-' }}
                    </p>
                </div>

                <div class="rounded-xl border border-default p-4 bg-gray-50 dark:bg-neutral-800">
                    <p class="text-xs uppercase tracking-wide text-muted">
                        Address
                    </p>

                    <p class="font-semibold">
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
