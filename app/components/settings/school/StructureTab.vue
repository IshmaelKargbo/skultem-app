<script setup lang="ts">
// Settings > School Structure. Anyone on the settings page can see it; only the owner/proprietor
// (or a super admin) can change it - it decides management scope, so a plain admin can't redraw it
// (PUT /school/structure is gated the same way on the backend).
const { success, error: toastError } = useNotify()
const { hasRole } = useAuth()
const { load, set } = useSchoolStructure()

const canEdit = computed(() => hasRole([Role.OWNER, Role.PROPRIETOR]))

const loading = ref(true)
const saving = ref(false)
const showErrors = ref(false)
const saved = ref<SchoolStructure | null>(null)
const draft = ref<SchoolStructureDraft>({ managementModel: 'UNIFIED', levels: [], sections: [] })

const classCounts = computed(() => Object.fromEntries(
    (saved.value?.levels ?? []).map(l => [l.level, l.classCount])
) as Partial<Record<LevelCode, number>>)

const dirty = computed(() => !!saved.value
    && JSON.stringify(draftToPayload(draft.value)) !== JSON.stringify(draftToPayload(structureToDraft(saved.value))))

function reset() {
    if (saved.value) draft.value = structureToDraft(saved.value)
    showErrors.value = false
}

async function save() {
    if (validateSchoolStructure(draft.value).length) {
        showErrors.value = true
        return
    }
    saving.value = true
    try {
        const res = await SchoolApi().updateStructure(draftToPayload(draft.value))
        if (!res) return
        saved.value = res
        set(res)
        reset()
        success('School structure saved')
    } catch (err: any) {
        toastError(err?.message || 'Failed to save school structure')
    } finally {
        saving.value = false
    }
}

onMounted(async () => {
    try {
        saved.value = await load(true)
        reset()
    } catch (err: any) {
        toastError(err?.message || 'Failed to load school structure')
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="space-y-4">
        <div v-if="loading" class="space-y-4">
            <UCard v-for="i in 2" :key="i">
                <USkeleton class="mb-4 h-4 w-40" />
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <USkeleton v-for="j in 3" :key="j" class="h-16 w-full rounded-xl" />
                </div>
            </UCard>
        </div>

        <template v-else-if="saved">
            <!-- Current structure at a glance -->
            <UCard :ui="{ body: 'p-4' }">
                <div class="flex flex-wrap items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="text-xs font-medium uppercase tracking-wide text-muted">Current structure</p>
                        <p class="mt-1 font-semibold text-highlighted">
                            {{ saved.managementModel === 'UNIFIED' ? 'One management for the entire school'
                                : `${saved.sections.length} management ${saved.sections.length === 1 ? 'section' : 'sections'}` }}
                        </p>
                    </div>
                    <UBadge v-if="!canEdit" variant="subtle" color="neutral" icon="i-lucide-lock"
                        label="Only the owner or proprietor can change this" />
                </div>

                <ul v-if="saved.managementModel === 'SECTION_BASED'" class="mt-3 space-y-2">
                    <li v-for="section in saved.sections" :key="section.id"
                        class="rounded-lg bg-elevated/50 px-3 py-2">
                        <p class="text-sm font-medium text-highlighted">{{ section.name }}</p>
                        <p class="text-xs text-muted">{{ section.levels.map(levelLabel).join(' • ') }}</p>
                    </li>
                </ul>
                <p v-else class="mt-1 text-sm text-muted">{{ saved.levels.map(l => l.label).join(' • ') }}</p>
            </UCard>

            <SettingsSchoolStructureEditor v-model="draft" :class-counts="classCounts" :readonly="!canEdit"
                :show-errors="showErrors" />

            <div v-if="canEdit" class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <UButton v-if="dirty" color="neutral" variant="subtle" label="Discard changes" class="justify-center"
                    @click="reset" />
                <UButton icon="lucide:save" label="Save Structure" class="justify-center" :loading="saving"
                    :disabled="!dirty" @click="save" />
            </div>
        </template>

        <UAlert v-else color="warning" variant="soft" icon="i-lucide-circle-alert"
            title="Couldn't load the school structure" description="Refresh the page to try again." />
    </div>
</template>
