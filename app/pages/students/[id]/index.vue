<template>
    <StudentView>
        <UCard>
            <template #header>
                <div>
                    <h3 class="font-semibold text-lg">
                        Personal & Parent Information
                    </h3>
                    <p class="text-sm text-muted">
                        View the student’s personal details alongside parent or guardian information and contact
                        records.
                    </p>
                </div>
            </template>

            <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div v-for="item in 6" :key="item" class="space-y-2">
                    <USkeleton class="h-3 w-24 bg-gray-200 dark:bg-gray-800" />
                    <USkeleton class="h-4 w-36 bg-gray-200 dark:bg-gray-800" />
                </div>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div class="space-y-1">
                    <p class="text-sm text-muted">Given Names</p>
                    <p class="font-medium">{{ record?.givenNames || '-' }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">Family Name</p>
                    <p class="font-medium">{{ record?.familyName || '-' }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">Date of Birth</p>
                    <p class="font-medium">{{ record?.dateOfBirth || '-' }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted">Gender</p>
                    <p class="font-medium">{{ clean(record?.gender || '') || '-' }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">City</p>
                    <p class="font-medium">{{ record?.city || '-' }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">Address</p>
                    <p class="font-medium">{{ record?.street || '-' }}</p>
                </div>
            </div>
        </UCard>
        <!-- Parent / Guardian -->
        <UCard>
            <template #header>
                <h3 class="font-semibold text-lg">
                    Parent / Guardian Information
                </h3>
            </template>

            <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div v-for="item in 6" :key="item" class="space-y-2">
                    <USkeleton class="h-3 w-24 bg-gray-200 dark:bg-gray-800" />
                    <USkeleton class="h-4 w-36 bg-gray-200 dark:bg-gray-800" />
                </div>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div class="space-y-1">
                    <p class="text-sm text-muted">Guardian Name</p>
                    <p class="font-medium">{{ record?.guardian?.givenNames || '-' }} {{ record?.guardian?.familyName || '' }}
                    </p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">Relationship</p>
                    <p class="font-medium">{{ clean(record?.relationship || '') || '-' }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">Phone Number</p>
                    <p class="font-medium">{{ record?.guardian?.phone || '-' }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">Email</p>
                    <p class="font-medium">{{ record?.guardian?.email || '-' }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">City</p>
                    <p class="font-medium">{{ record?.guardian?.city || '-' }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">Address</p>
                    <p class="font-medium">{{ record?.guardian?.street || '-' }}</p>
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
