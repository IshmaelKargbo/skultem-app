<script setup lang="ts">
// Edits a school's structure: which levels it offers, and whether it's run as one unit or as
// school-defined management sections. Shared by school onboarding (pages/schools/add.vue) and
// Settings > School Structure. Only edits the draft - saving is the caller's job.
const draft = defineModel<SchoolStructureDraft>({ required: true })

const { classCounts = {}, readonly = false, showErrors = false } = defineProps<{
    // Levels that still have classes can't be unticked (the backend refuses it too).
    classCounts?: Partial<Record<LevelCode, number>>
    readonly?: boolean
    // Show the full rule list (e.g. after a Save attempt) rather than only the gentle hints.
    showErrors?: boolean
}>()

const errors = computed(() => validateSchoolStructure(draft.value))

const offered = computed(() => LEVEL_CATALOG.filter(l => draft.value.levels.includes(l.value)))

function isLocked(level: LevelCode) {
    return (classCounts[level] ?? 0) > 0
}

function toggleLevel(level: LevelCode) {
    if (readonly) return
    const has = draft.value.levels.includes(level)
    if (has && isLocked(level)) return

    if (has) {
        draft.value.levels = draft.value.levels.filter(l => l !== level)
        // A level the school no longer offers can't stay in a section.
        for (const section of draft.value.sections) {
            section.levels = section.levels.filter(l => l !== level)
        }
    } else {
        draft.value.levels = sortLevels([...draft.value.levels, level])
    }
}

const models: { value: ManagementModel, title: string, description: string, icon: string }[] = [
    {
        value: 'UNIFIED',
        title: 'One management for the entire school',
        description: 'Everyone with management access can work across the school.',
        icon: 'i-lucide-building-2'
    },
    {
        value: 'SECTION_BASED',
        title: 'Separate management sections',
        description: 'Different parts of the school can have their own administrators.',
        icon: 'i-lucide-layers'
    }
]

function setModel(model: ManagementModel) {
    if (readonly || draft.value.managementModel === model) return
    draft.value.managementModel = model
    // Start with one blank section so there's something to fill in.
    if (model === 'SECTION_BASED' && !draft.value.sections.length) {
        draft.value.sections.push(newSectionDraft())
    }
}

function addSection() {
    draft.value.sections.push(newSectionDraft())
}

function removeSection(key: string) {
    draft.value.sections = draft.value.sections.filter(s => s.key !== key)
}

// Which section (other than this one) already manages a level - each level has one owner.
function ownerOf(level: LevelCode, exceptKey: string) {
    return draft.value.sections.find(s => s.key !== exceptKey && s.levels.includes(level))
}

function toggleSectionLevel(section: ManagementSectionDraft, level: LevelCode) {
    if (readonly) return
    if (section.levels.includes(level)) {
        section.levels = section.levels.filter(l => l !== level)
        return
    }
    // Picking a level another section has moves it here rather than being blocked - quicker
    // when reorganizing, and it can never end up in two sections.
    const other = ownerOf(level, section.key)
    if (other) other.levels = other.levels.filter(l => l !== level)
    section.levels = sortLevels([...section.levels, level])
}

const unassigned = computed(() => draft.value.managementModel === 'SECTION_BASED'
    ? offered.value.filter(l => !draft.value.sections.some(s => s.levels.includes(l.value)))
    : [])
</script>

<template>
    <div class="space-y-4">
        <!-- School levels -->
        <UCard>
            <template #header>
                <div>
                    <p class="font-semibold text-highlighted">School Levels</p>
                    <p class="text-sm text-muted">What levels does your school offer?</p>
                </div>
            </template>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <button v-for="level in LEVEL_CATALOG" :key="level.value" type="button"
                    :disabled="readonly || (draft.levels.includes(level.value) && isLocked(level.value))"
                    :aria-pressed="draft.levels.includes(level.value)"
                    class="flex items-start gap-3 rounded-xl border p-3 text-left transition-colors disabled:cursor-default"
                    :class="draft.levels.includes(level.value)
                        ? 'border-primary bg-primary/5'
                        : 'border-default hover:border-accented hover:bg-elevated/50'"
                    @click="toggleLevel(level.value)">
                    <span class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border"
                        :class="draft.levels.includes(level.value) ? 'border-primary bg-primary text-inverted' : 'border-accented'">
                        <UIcon v-if="draft.levels.includes(level.value)" name="i-lucide-check" class="size-3.5" />
                    </span>
                    <span class="min-w-0 flex-1">
                        <span class="block text-sm font-medium text-highlighted">{{ level.label }}</span>
                        <span class="block text-xs text-muted">{{ level.description }}</span>
                        <span v-if="isLocked(level.value)" class="mt-1 block text-xs text-muted">
                            {{ classCounts[level.value] }} {{ classCounts[level.value] === 1 ? 'class' : 'classes' }} -
                            can't be removed while classes use it
                        </span>
                    </span>
                </button>
            </div>
        </UCard>

        <!-- Management model -->
        <UCard>
            <template #header>
                <div>
                    <p class="font-semibold text-highlighted">Management Structure</p>
                    <p class="text-sm text-muted">How is your school managed?</p>
                </div>
            </template>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-2" role="radiogroup">
                <button v-for="model in models" :key="model.value" type="button" role="radio"
                    :aria-checked="draft.managementModel === model.value" :disabled="readonly"
                    class="flex items-start gap-3 rounded-xl border p-4 text-left transition-colors disabled:cursor-default"
                    :class="draft.managementModel === model.value
                        ? 'border-primary bg-primary/5'
                        : 'border-default hover:border-accented hover:bg-elevated/50'"
                    @click="setModel(model.value)">
                    <span class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border"
                        :class="draft.managementModel === model.value ? 'border-primary' : 'border-accented'">
                        <span v-if="draft.managementModel === model.value" class="size-2.5 rounded-full bg-primary" />
                    </span>
                    <span class="min-w-0 flex-1">
                        <span class="flex items-center gap-2 text-sm font-medium text-highlighted">
                            <UIcon :name="model.icon" class="size-4 shrink-0 text-muted" />
                            {{ model.title }}
                        </span>
                        <span class="mt-1 block text-xs text-muted">{{ model.description }}</span>
                    </span>
                </button>
            </div>
        </UCard>

        <!-- Management sections -->
        <UCard v-if="draft.managementModel === 'SECTION_BASED'">
            <template #header>
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <p class="font-semibold text-highlighted">Management Sections</p>
                        <p class="text-sm text-muted">Group your levels the way your school is run. Each level
                            belongs to one section.</p>
                    </div>
                    <UBadge variant="subtle" color="neutral" :label="`${draft.sections.length}`" class="shrink-0" />
                </div>
            </template>

            <p v-if="!offered.length" class="text-sm text-muted">Select the school's levels first.</p>

            <div v-else class="space-y-3">
                <div v-for="(section, i) in draft.sections" :key="section.key"
                    class="space-y-3 rounded-xl border border-default p-3 sm:p-4">
                    <div class="flex items-end gap-2">
                        <UFormField :label="`Section ${i + 1} name`" class="min-w-0 flex-1">
                            <UInput v-model="section.name" placeholder="e.g. Early Years & Primary" class="w-full"
                                :disabled="readonly" :maxlength="100" />
                        </UFormField>
                        <UButton v-if="!readonly && draft.sections.length > 1" icon="i-lucide-trash-2" color="error"
                            variant="ghost" :aria-label="`Remove ${section.name || 'section'}`"
                            @click="removeSection(section.key)" />
                    </div>

                    <div>
                        <p class="mb-2 text-xs font-medium text-muted">School levels in this section</p>
                        <div class="flex flex-wrap gap-2">
                            <button v-for="level in offered" :key="level.value" type="button" :disabled="readonly"
                                :aria-pressed="section.levels.includes(level.value)"
                                class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors disabled:cursor-default"
                                :class="section.levels.includes(level.value)
                                    ? 'border-primary bg-primary text-inverted'
                                    : 'border-default text-toned hover:border-accented'"
                                @click="toggleSectionLevel(section, level.value)">
                                <UIcon v-if="section.levels.includes(level.value)" name="i-lucide-check"
                                    class="size-3.5" />
                                {{ level.label }}
                                <span v-if="!section.levels.includes(level.value) && ownerOf(level.value, section.key)"
                                    class="text-xs text-dimmed">
                                    · in {{ ownerOf(level.value, section.key)?.name || 'another section' }}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap items-center justify-between gap-3">
                    <UButton v-if="!readonly" icon="i-lucide-plus" variant="subtle" label="Add Management Section"
                        @click="addSection" />
                    <p v-if="unassigned.length" class="text-xs text-warning">
                        Not in a section yet: {{ unassigned.map(l => l.label).join(', ') }}
                    </p>
                </div>
            </div>
        </UCard>

        <UAlert v-if="showErrors && errors.length" color="error" variant="soft" icon="i-lucide-circle-alert"
            title="Fix these before saving">
            <template #description>
                <ul class="list-disc space-y-0.5 pl-4">
                    <li v-for="message in errors" :key="message">{{ message }}</li>
                </ul>
            </template>
        </UAlert>
    </div>
</template>
