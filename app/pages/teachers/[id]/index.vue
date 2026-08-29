<template>
    <TeacherView>
        <UCard class="overflow-hidden">
            <template #header>
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-user" class="size-5 text-primary" />
                        <h3 class="text-lg font-semibold">
                            Personal Information
                        </h3>
                    </div>

                    <p class="text-sm text-muted">
                        Contact and biodata for this teacher.
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

                    <p class="mt-2 break-words font-semibold">
                        {{ item.value || '-' }}
                    </p>
                </div>
            </div>
        </UCard>
    </TeacherView>
</template>

<script setup lang="ts">
const store = useTeacherStore()
const { record, loading } = storeToRefs(store)

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})

const personalDetails = computed(() => ([
    { label: 'Given Names', icon: 'i-lucide-user-round', value: record.value?.user?.givenNames },
    { label: 'Family Name', icon: 'i-lucide-user', value: record.value?.user?.familyName },
    { label: 'Email', icon: 'i-lucide-mail', value: record.value?.user?.email },
    { label: 'Phone Number', icon: 'i-lucide-phone', value: record.value?.phone },
      { label: 'Address', icon: 'i-lucide-house', value: record.value?.street },
    { label: 'City', icon: 'i-lucide-map-pinned', value: record.value?.city },
  
]))

onMounted(() => {
    useAppStore().setTitle('View Teacher')
    useAppStore().setBack('/teachers')

    document.title = 'View Teacher | Teachers | Skultem'
})
</script>
