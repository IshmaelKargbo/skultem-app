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
                <div v-for="i in 8" :key="i" class="rounded-2xl border border-default p-4 space-y-3 bg-gray-100 dark:bg-neutral-800">
                    <USkeleton class="h-3 w-20" />
                    <USkeleton class="h-5 w-32" />
                </div>
            </div>

            <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div
                    v-for="item in personalDetails"
                    :key="item.label"
                    class="rounded-2xl border border-default bg-gray-100 p-4 transition hover:border-primary/40 dark:bg-neutral-800"
                >
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon :name="item.icon" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            {{ item.label }}
                        </p>
                    </div>

                    <p class="mt-2 font-semibold">
                        {{ item.value || '-' }}
                    </p>
                </div>
            </div>
        </UCard>

        <UCard class="overflow-hidden mt-6">
            <template #header>
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-users" class="size-5 text-primary" />
                        <h3 class="text-lg font-semibold">
                            Parent / Guardian Information
                        </h3>
                    </div>

                    <p class="text-sm text-muted">
                        Contact and family details for the student’s parent or guardian.
                    </p>
                </div>
            </template>

            <!-- Guardian contact -->
            <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div v-for="i in 6" :key="i" class="rounded-2xl border border-default bg-gray-100 p-4 space-y-3 dark:bg-neutral-800">
                    <USkeleton class="h-3 w-20" />
                    <USkeleton class="h-5 w-32" />
                </div>
            </div>

            <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div
                    v-for="item in guardianContact"
                    :key="item.label"
                    class="rounded-2xl border border-default bg-gray-100 p-4 transition hover:border-primary/40 dark:bg-neutral-800"
                >
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon :name="item.icon" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            {{ item.label }}
                        </p>
                    </div>

                    <p class="mt-2 break-words font-semibold">
                        {{ item.value || '-' }}
                    </p>
                </div>
            </div>

            <!-- Father / Mother -->
            <div class="mt-6 grid gap-4 md:grid-cols-2">
                <div class="overflow-hidden rounded-2xl border border-default">
                    <div class="flex items-center gap-2 border-b border-default bg-gray-100 px-4 py-2.5 dark:bg-neutral-800">
                        <UIcon name="i-lucide-user-round" class="size-4 text-primary" />
                        <h4 class="text-sm font-semibold">
                            Father Details
                        </h4>
                    </div>

                    <div v-if="loading" class="space-y-3 p-4">
                        <USkeleton v-for="i in 3" :key="i" class="h-4 w-full" />
                    </div>

                    <div v-else class="divide-y divide-default">
                        <div v-for="item in fatherDetails" :key="item.label" class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                            <span class="text-muted">{{ item.label }}</span>
                            <span class="font-medium">{{ item.value || '-' }}</span>
                        </div>
                    </div>
                </div>

                <div class="overflow-hidden rounded-2xl border border-default">
                    <div class="flex items-center gap-2 border-b border-default bg-gray-100 px-4 py-2.5 dark:bg-neutral-800">
                        <UIcon name="i-lucide-user-round" class="size-4 text-primary" />
                        <h4 class="text-sm font-semibold">
                            Mother Details
                        </h4>
                    </div>

                    <div v-if="loading" class="space-y-3 p-4">
                        <USkeleton v-for="i in 3" :key="i" class="h-4 w-full" />
                    </div>

                    <div v-else class="divide-y divide-default">
                        <div v-for="item in motherDetails" :key="item.label" class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                            <span class="text-muted">{{ item.label }}</span>
                            <span class="font-medium">{{ item.value || '-' }}</span>
                        </div>
                    </div>
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

const personalDetails = computed(() => ([
    { label: 'Given Names', icon: 'i-lucide-user-round', value: record.value?.givenNames },
    { label: 'Family Name', icon: 'i-lucide-user', value: record.value?.familyName },
    { label: 'Date of Birth', icon: 'i-lucide-calendar-days', value: record.value?.dateOfBirth ? formatDate(record.value.dateOfBirth) : '' },
    { label: 'Religion', icon: 'i-lucide-heart', value: clean(record.value?.religion || '') },
    { label: 'City', icon: 'i-lucide-map-pinned', value: record.value?.city },
    { label: 'Address', icon: 'i-lucide-house', value: record.value?.street }
]))

const guardianContact = computed(() => ([
    { label: 'Guardian Name', icon: 'i-lucide-user-round-check', value: `${record.value?.guardian?.givenNames || ''} ${record.value?.guardian?.familyName || ''}`.trim() },
    { label: 'Relationship', icon: 'i-lucide-users-round', value: clean(record.value?.relationship || '') },
    { label: 'Phone Number', icon: 'i-lucide-phone', value: record.value?.guardian?.phone },
    { label: 'Email', icon: 'i-lucide-mail', value: record.value?.guardian?.email },
    { label: 'City', icon: 'i-lucide-map-pinned', value: record.value?.guardian?.city },
    { label: 'Address', icon: 'i-lucide-house', value: record.value?.guardian?.street }
]))

const fatherDetails = computed(() => ([
    { label: 'Name', value: record.value?.family?.fatherName },
    { label: 'Occupation', value: record.value?.family?.fatherOccupation },
    { label: 'Contact', value: record.value?.family?.fatherContact }
]))

const motherDetails = computed(() => ([
    { label: 'Name', value: record.value?.family?.motherName },
    { label: 'Occupation', value: record.value?.family?.motherOccupation },
    { label: 'Contact', value: record.value?.family?.motherContact }
]))

onMounted(() => {
    useAppStore().setTitle('View Student')
    useAppStore().setBack('/students')

    document.title = 'View Student | Students | Skultem'
})
</script>
