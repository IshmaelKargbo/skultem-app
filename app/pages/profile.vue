<template>
    <div class="space-y-4 px-4 md:px-6">
        <Heading title="My Profile" subtitle="Your account details and photo." />

        <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
            <div
                class="h-20 bg-linear-to-br from-primary/15 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 md:h-24" />

            <div class="px-5 pb-5">
                <div class="-mt-12 flex flex-col gap-5 md:-mt-14 md:flex-row md:items-end md:justify-between">
                    <div class="flex min-w-0 items-end gap-4">
                        <!-- Avatar -->
                        <div
                            class="relative shrink-0 rounded-2xl bg-default p-1.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                            <USkeleton v-if="loading" class="h-20 w-20 rounded-xl md:h-24 md:w-24" />

                            <template v-else>
                                <UAvatar :src="user?.photo || undefined" :alt="name" size="3xl"
                                    class="h-20 w-20 rounded-xl md:h-24 md:w-24" :class="{ 'opacity-50': uploadingPhoto }" />

                                <div v-if="uploadingPhoto" class="absolute inset-1.5 flex items-center justify-center rounded-xl">
                                    <UIcon name="i-lucide-loader-circle" class="animate-spin text-lg text-primary" />
                                </div>

                                <UTooltip v-else :delay-duration="0" arrow text="Upload photo">
                                    <label
                                        class="absolute -bottom-1 -right-1 flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-default bg-primary text-white shadow-md hover:bg-primary-600">
                                        <UIcon name="i-lucide-camera" class="size-3.5" />
                                        <input class="hidden" type="file" accept="image/png,image/jpeg,image/jpg"
                                            @change="onPhotoChange">
                                    </label>
                                </UTooltip>
                            </template>
                        </div>

                        <!-- Identity -->
                        <div class="min-w-0 pb-0.5 md:pb-1">
                            <USkeleton v-if="loading" class="h-6 w-48 md:h-7 md:w-60" />

                            <h2 v-else class="max-w-[calc(100vw-150px)] truncate text-xl font-bold tracking-tight text-highlighted md:max-w-md md:text-2xl">
                                {{ name }}
                            </h2>

                            <div v-if="loading" class="mt-2 flex items-center gap-2">
                                <USkeleton class="h-4 w-28" />
                            </div>

                            <div v-else class="mt-2 flex flex-wrap items-center gap-2">
                                <UBadge v-for="role in user?.roles" :key="role" :label="parseRole[role] || role"
                                    :color="parseRoleColor[role]" variant="subtle" size="xs" class="rounded-full" />
                            </div>

                            <div v-if="!loading" class="mt-1.5 flex items-center gap-1.5 text-xs text-dimmed">
                                <UIcon name="i-lucide-mail" class="size-3.5" />
                                <span class="font-medium text-muted">{{ user?.email || 'No email' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UCard>

        <UCard>
            <template #header>
                <div>
                    <h3 class="font-semibold text-lg">Account Details</h3>
                    <p class="text-sm text-muted">Read-only - contact an admin to change these.</p>
                </div>
            </template>

            <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-xl border border-default bg-elevated/40 p-3">
                    <p class="text-xs text-muted">Given Names</p>
                    <p class="mt-1 text-sm font-semibold text-highlighted">{{ user?.givenNames || '—' }}</p>
                </div>

                <div class="rounded-xl border border-default bg-elevated/40 p-3">
                    <p class="text-xs text-muted">Family Name</p>
                    <p class="mt-1 text-sm font-semibold text-highlighted">{{ user?.familyName || '—' }}</p>
                </div>

                <div class="rounded-xl border border-default bg-elevated/40 p-3">
                    <p class="text-xs text-muted">Email</p>
                    <p class="mt-1 truncate text-sm font-semibold text-highlighted">{{ user?.email || '—' }}</p>
                </div>

                <div class="rounded-xl border border-default bg-elevated/40 p-3">
                    <p class="text-xs text-muted">Status</p>
                    <p class="mt-1 text-sm font-semibold text-highlighted">{{ clean(user?.status || '') || '—' }}</p>
                </div>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const store = useUserStore()
const { user, meLoading: loading } = storeToRefs(store)

const uploadingPhoto = ref(false)

const name = computed(() => {
    if (!user.value) return ''
    return `${user.value.givenNames || ''} ${user.value.familyName || ''}`.trim()
})

async function onPhotoChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''

    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
        useNotify().error('Photo must be 2MB or less')
        return
    }

    uploadingPhoto.value = true

    try {
        await store.updateMyPhoto(file)
        useNotify().success('Photo updated')
    } catch (err: any) {
        useNotify().error(err?.message || 'Failed to upload photo')
    } finally {
        uploadingPhoto.value = false
    }
}

onMounted(async () => {
    useAppStore().setTitle('My Profile')
    document.title = 'My Profile | Skultem'

    if (!user.value?.id) await store.me()
})
</script>
