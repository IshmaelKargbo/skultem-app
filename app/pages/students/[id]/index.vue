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

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div class="space-y-1">
                    <p class="text-sm text-muted">Given Names</p>
                    <USkeleton class="w-32 h-3 bg-gray-200 dark:bg-gray-800" v-if="loading" />
                    <p class="font-medium" v-else>{{ record?.givenNames }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">Family Name</p>
                    <USkeleton class="w-32 h-3 bg-gray-200 dark:bg-gray-800" v-if="loading" />
                    <p class="font-medium" v-else>{{ record?.familyName }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">Date of Birth</p>
                    <USkeleton class="w-32 h-3 bg-gray-200 dark:bg-gray-800" v-if="loading" />
                    <p class="font-medium" v-else>{{ record?.dateOfBirth }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted">Gender</p>
                    <USkeleton class="w-32 h-3 bg-gray-200 dark:bg-gray-800" v-if="loading" />
                    <p class="font-medium" v-else>{{ clean(record?.gender || '') }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">City</p>
                    <USkeleton class="w-32 h-3 bg-gray-200 dark:bg-gray-800" v-if="loading" />
                    <p class="font-medium" v-else>{{ record?.city }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">Address</p>
                    <USkeleton class="w-32 h-3 bg-gray-200 dark:bg-gray-800" v-if="loading" />
                    <p class="font-medium" v-else>{{ record?.street }}</p>
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

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div class="space-y-1">
                    <p class="text-sm text-muted">Guardian Name</p>
                    <USkeleton class="w-32 h-3 bg-gray-200 dark:bg-gray-800" v-if="loading" />
                    <p class="font-medium" v-else>{{ record?.guardian.givenNames }} {{ record?.guardian.familyName }}
                    </p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">Relationship</p>
                    <USkeleton class="w-32 h-3 bg-gray-200 dark:bg-gray-800" v-if="loading" />
                    <p class="font-medium" v-else>{{ clean(record?.relationship || '') }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">Phone Number</p>
                    <USkeleton class="w-32 h-3 bg-gray-200 dark:bg-gray-800" v-if="loading" />
                    <p class="font-medium" v-else>{{ record?.guardian.phone }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">Email</p>
                    <USkeleton class="w-32 h-3 bg-gray-200 dark:bg-gray-800" v-if="loading" />
                    <p class="font-medium" v-else>{{ record?.guardian.email }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">City</p>
                    <USkeleton class="w-32 h-3 bg-gray-200 dark:bg-gray-800" v-if="loading" />
                    <p class="font-medium" v-else>{{ record?.guardian.city }}</p>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-muted">Address</p>
                    <USkeleton class="w-32 h-3 bg-gray-200 dark:bg-gray-800" v-if="loading" />
                    <p class="font-medium" v-else>{{ record?.guardian.street }}</p>
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