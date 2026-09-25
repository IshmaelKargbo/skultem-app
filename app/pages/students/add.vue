<template>
    <div class="space-y-4 px-4 md:px-6">
        <!-- Stepper -->
        <nav ref="stepperEl" aria-label="Enrollment progress" class="scroll-mt-4 rounded-2xl border border-default bg-default p-3 sm:p-4 md:py-6">
            <ol class="flex items-start">
                <li v-for="(value, i) in step" :key="value.title" class="relative flex flex-1 flex-col items-center">
                    <!-- connector to the next step -->
                    <div v-if="i < step.length - 1" aria-hidden="true"
                        class="absolute left-[calc(50%+1.25rem)] right-[calc(-50%+1.25rem)] top-4 h-0.5 overflow-hidden rounded-full bg-accented sm:top-5">
                        <div class="h-full bg-primary transition-all duration-500"
                            :class="state > i ? 'w-full' : 'w-0'" />
                    </div>

                    <button type="button" :disabled="i >= state" :aria-current="state === i ? 'step' : undefined"
                        class="group flex flex-col items-center gap-2 disabled:cursor-default" @click="goTo(i)">
                        <span
                            class="relative z-[1] flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 sm:size-10"
                            :class="state > i
                                ? 'bg-primary text-inverted group-hover:ring-4 group-hover:ring-primary/20'
                                : state === i
                                    ? 'bg-primary text-inverted ring-4 ring-primary/20'
                                    : 'bg-elevated text-muted ring-1 ring-default'">
                            <UIcon v-if="state > i" name="i-lucide-check" class="size-4 sm:size-5" />
                            <UIcon v-else :name="value.icon" class="size-4 sm:size-5" />
                        </span>
                        <span class="hidden text-center sm:block">
                            <span class="block text-sm font-medium transition-colors"
                                :class="state >= i ? 'text-highlighted' : 'text-muted'">{{ value.title }}</span>
                            <span class="hidden text-xs text-muted lg:block">{{ value.sub }}</span>
                        </span>
                    </button>
                </li>
            </ol>

            <!-- Mobile: name the current step under the dots -->
            <div class="mt-3 flex items-center justify-between gap-2 border-t border-default pt-3 sm:hidden">
                <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-highlighted">{{ step[state]?.title }}</p>
                    <p class="truncate text-xs text-muted">{{ step[state]?.sub }}</p>
                </div>
                <UBadge variant="subtle" color="primary" size="sm" class="shrink-0"
                    :label="`${state + 1} / ${step.length}`" />
            </div>
        </nav>

        <div v-if="lastSavedAt" class="flex items-center justify-between gap-2 px-1 text-xs text-muted">
            <span class="flex min-w-0 items-center gap-1.5">
                <UIcon name="i-lucide-cloud-check" class="size-4 shrink-0 text-success" />
                <span class="truncate">Progress saved on this device</span>
            </span>
            <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-rotate-ccw" label="Start over"
                @click="startOverOpen = true" />
        </div>

        <div v-if="draftReady" :key="formKey" class="min-w-0">
            <StudentAddPersonal :state="personal" @next="moveToParent" @change="live.personal = $event"
                v-if="state === 0" />
            <StudentAddParent :state="parent" @next="moveToAcademic" @back="back" @change="live.parent = $event"
                v-if="state === 1" />
            <StudentAddAcademic :state="academic" @back="back" @next="moveToProfile" @change="live.academic = $event"
                v-if="state === 2" />
            <StudentAddProfile :loading="loading" :state="profile" @back="back" @submit="submit"
                v-if="state === 3" />
        </div>
    </div>

    <!-- Unfinished enrollment found on this device -->
    <UModal :open="!!pendingDraft" :dismissible="false">
        <template #content>
            <div v-if="pendingDraft" class="space-y-4 p-4 sm:space-y-5 sm:p-6">
                <div class="flex flex-col items-center space-y-2 text-center">
                    <div class="flex size-14 items-center justify-center rounded-full bg-primary/10">
                        <UIcon name="i-lucide-file-clock" class="text-2xl text-primary" />
                    </div>
                    <h2 class="text-lg font-semibold">Continue unfinished enrollment?</h2>
                    <p class="text-sm text-muted">
                        You started enrolling a student and didn't finish. Pick up where you left off, or start a
                        new one.
                    </p>
                </div>

                <div class="space-y-2 rounded-xl border border-default bg-elevated/50 p-3 text-sm">
                    <div class="flex items-center justify-between gap-3">
                        <span class="text-muted">Student</span>
                        <span class="truncate font-medium text-highlighted">{{ draftStudentName }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                        <span class="text-muted">Stopped at</span>
                        <span class="font-medium text-highlighted">
                            Step {{ draftStep + 1 }} of {{ step.length }} · {{ step[draftStep]?.title }}
                        </span>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                        <span class="text-muted">Last saved</span>
                        <span class="font-medium text-highlighted">{{ timeAgo(pendingDraft.savedAt) }}</span>
                    </div>
                </div>

                <p v-if="draftStep === 3" class="text-xs text-muted">
                    The student photo isn't saved with the draft - you'll need to add it again.
                </p>

                <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <UButton class="w-full justify-center sm:w-auto" color="neutral" variant="subtle"
                        icon="i-lucide-file-plus" label="Start new" @click="startNew" />
                    <UButton class="w-full justify-center sm:w-auto" color="primary" icon="i-lucide-play"
                        label="Resume" @click="resumeDraft" />
                </div>
            </div>
        </template>
    </UModal>

    <!-- Confirm discarding the in-progress enrollment -->
    <UModal v-model:open="startOverOpen">
        <template #content>
            <div class="space-y-4 p-4 sm:p-6">
                <div class="space-y-1">
                    <h2 class="text-lg font-semibold">Start over?</h2>
                    <p class="text-sm text-muted">
                        Everything entered for this enrollment will be cleared. This can't be undone.
                    </p>
                </div>
                <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <UButton class="w-full justify-center sm:w-auto" color="neutral" variant="subtle" label="Cancel"
                        @click="startOverOpen = false" />
                    <UButton class="w-full justify-center sm:w-auto" color="error" icon="i-lucide-rotate-ccw"
                        label="Clear and start over" @click="startOver" />
                </div>
            </div>
        </template>
    </UModal>
    <UModal v-model:open="successModal" :dismissible="false">
        <template #content>
            <div class="space-y-4 p-4 text-center sm:space-y-5 sm:p-6">

                <div class="flex flex-col items-center space-y-2">
                    <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                        <UIcon name="i-lucide-check" class="text-green-600 text-2xl" />
                    </div>

                    <h2 class="text-lg font-semibold">Enrollment Successful</h2>
                    <p class="text-sm text-muted">
                        The student has been successfully enrolled into the system.
                    </p>
                </div>

                <div class="flex flex-col gap-3 justify-center pt-2 sm:flex-row">

                    <UButton class="w-full justify-center sm:w-auto" color="primary" :trailing-icon="VIEW_ICON" @click="() => {
                        successModal = false
                        navigateTo(`/students/${createdStudentId}`)
                    }">
                        View Profile
                    </UButton>

                    <UButton class="w-full justify-center sm:w-auto" color="neutral" variant="subtle" :trailing-icon="ADD_ICON" @click="() => {
                        successModal = false
                        resetForm()
                    }">
                        Add New Student
                    </UButton>

                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { EnrollmentDraft } from '~/composables/useEnrollmentDraft'

const loading = ref(false)
const successModal = ref(false)
const createdStudentId = ref<string | null>(null)
const store = useStudentStore()
const state = ref(0)

const step = [
    {
        title: 'Student',
        sub: 'Basic details',
        icon: 'i-lucide-user'
    },
    {
        title: 'Guardian',
        sub: 'Parent contacts',
        icon: 'i-lucide-users'
    },
    {
        title: 'Academic',
        sub: 'Class & subjects',
        icon: 'i-lucide-graduation-cap'
    },
    {
        title: 'Photo',
        sub: 'Optional',
        icon: 'i-lucide-camera'
    }
]

const personal = reactive({
    givenNames: '',
    familyName: '',
    dob: '',
    gender: '',
    nationality: '',
    religion: '',
    city: '',
    street: ''
})

const profile = reactive({
    photo: null as File | null
})

function resetForm() {
    Object.assign(personal, {
        givenNames: '',
        familyName: '',
        dob: '',
        gender: '',
        nationality: '',
        religion: '',
        city: '',
        street: '',
    })
    Object.assign(parent, {
        fatherName: '',
        motherName: '',
        motherOccupation: '',
        fatherOccupation: '',
        fatherContact: '',
        motherContact: '',
        existingGuardianId: '',
        guardianGivenNames: '',
        guardianFamilyName: '',
        relationship: '',
        guardianPhone: '',
        guardianEmail: '',
        guardianOccupation: '',
        guardianCity: '',
        guardianAddress: ''
    })
    Object.assign(academic, {
        enrollmentType: '',
        admissionDate: '',
        classId: '',
        admissionNumber: '',
        previousSchool: '',
        lastGradeCompleted: '',
        optionalSubjects: {},
        selectedOptionIds: {}
    })
    Object.assign(profile, {
        photo: null
    })
    live.personal = {}
    live.parent = {}
    live.academic = {}

    state.value = 0
    // The step components copy their state once on mount, so remount them to pick up the blank form.
    formKey.value++
    autosave = true
}

const parent = reactive({
    fatherName: '',
    motherName: '',
    motherOccupation: '',
    fatherOccupation: '',
    fatherContact: '',
    motherContact: '',

    existingGuardianId: '',

    guardianGivenNames: '',
    guardianFamilyName: '',
    relationship: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianCity: '',
    guardianAddress: ''
})

const academic = reactive({
    enrollmentType: '',
    admissionDate: '',
    classId: '',
    admissionNumber: '',
    previousSchool: '',
    lastGradeCompleted: '',
    selectedOptionIds: {} as Record<string, string>
})

// ─── Draft autosave / resume ──────────────────────────────────────────────────
// Committed step data (personal/parent/academic) only updates on "Next", so each step also streams
// its live form here - the draft then holds whatever was on screen, not just the last completed step.

const draft = useEnrollmentDraft()
const live = reactive({
    personal: {} as Record<string, any>,
    parent: {} as Record<string, any>,
    academic: {} as Record<string, any>
})
const formKey = ref(0)
// Steps stay hidden until the resume/start-new choice is made, so they mount with the right data.
const draftReady = ref(false)
const pendingDraft = ref<EnrollmentDraft | null>(null)
const lastSavedAt = ref<number | null>(null)
const startOverOpen = ref(false)
// Off once the student is enrolled, so leaving the success screen doesn't re-save a finished form.
let autosave = true
let saveTimer: ReturnType<typeof setTimeout> | undefined

const draftStep = computed(() => Math.min(Math.max(pendingDraft.value?.step ?? 0, 0), step.length - 1))
const draftStudentName = computed(() => {
    const p = pendingDraft.value?.personal
    return [p?.givenNames, p?.familyName].filter(Boolean).join(' ') || 'Name not entered yet'
})

function isFilled(value: unknown): boolean {
    if (value && typeof value === 'object') return Object.values(value).some(isFilled)
    return !!value
}

function snapshot() {
    return {
        step: state.value,
        personal: { ...personal, ...live.personal },
        parent: { ...parent, ...live.parent },
        academic: { ...academic, ...live.academic }
    }
}

function persistDraft() {
    clearTimeout(saveTimer)
    saveTimer = undefined
    if (!draftReady.value || !autosave) return

    const snap = snapshot()
    if (!isFilled([snap.personal, snap.parent, snap.academic])) {
        draft.clear()
        lastSavedAt.value = null
        return
    }
    lastSavedAt.value = draft.save(snap) ?? lastSavedAt.value
}

function scheduleDraftSave() {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(persistDraft, 500)
}

watch([state, personal, parent, academic, live], scheduleDraftSave, { deep: true })

function resumeDraft() {
    const saved = pendingDraft.value
    if (!saved) return
    Object.assign(personal, saved.personal)
    Object.assign(parent, saved.parent)
    Object.assign(academic, saved.academic)
    state.value = draftStep.value
    lastSavedAt.value = saved.savedAt
    pendingDraft.value = null
    draftReady.value = true
}

function startNew() {
    draft.clear()
    pendingDraft.value = null
    draftReady.value = true
}

function startOver() {
    startOverOpen.value = false
    clearTimeout(saveTimer)
    resetForm()
    draft.clear()
    lastSavedAt.value = null
}

function timeAgo(ts: number) {
    const minutes = Math.round((Date.now() - ts) / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.round(minutes / 60)
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
    const days = Math.round(hours / 24)
    return `${days} day${days === 1 ? '' : 's'} ago`
}

// Save immediately (not on the debounce) when leaving the page or closing/refreshing the tab.
onMounted(() => window.addEventListener('pagehide', persistDraft))
onBeforeUnmount(() => {
    window.removeEventListener('pagehide', persistDraft)
    persistDraft()
})

// ssr: false, so this runs in the browser - decide before the steps first render.
const savedDraft = draft.load()
if (savedDraft && isFilled([savedDraft.personal, savedDraft.parent, savedDraft.academic])) {
    pendingDraft.value = savedDraft
} else {
    draftReady.value = true
}

function moveToParent(param: any) {
    Object.assign(personal, {
        givenNames: param.givenNames,
        familyName: param.familyName,
        dob: param.dob,
        gender: param.gender,
        nationality: param.nationality,
        religion: param.religion,
        city: param.city,
        street: param.street
    })

    Object.assign(parent, {
        guardianCity: param.city,
        guardianAddress: param.street
    })

    if (state.value === 3) return
    state.value++
}

function moveToProfile(param: any) {
    Object.assign(academic, {
        enrollmentType: param.enrollmentType,
        admissionDate: param.admissionDate,
        classId: param.classId,
        admissionNumber: param.admissionNumber,
        previousSchool: param.previousSchool,
        lastGradeCompleted: param.lastGradeCompleted,
        ...param
    })

    if (state.value === 3) return
    state.value++
}

function moveToAcademic(param: any) {
    Object.assign(parent, { ...param })
    if (state.value === 3) return
    state.value++
}

function back() {
    if (state.value === 0) return
    state.value--
}

// Completed steps can be revisited from the stepper; forward moves go through each step's validation.
function goTo(i: number) {
    if (i < state.value) state.value = i
}

const stepperEl = ref<HTMLElement | null>(null)
watch(state, () => stepperEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))

async function submit(param: any) {
    Object.assign(profile, {
        photo: param.data.photo
    })

    try {
        loading.value = true
        const formData = new FormData()
        const list = Object.values(academic.selectedOptionIds)

        const data = {
            ...personal,
            dateOfBirth: personal.dob,
            family: {
                fatherName: parent.fatherName,
                motherName: parent.motherName,
                fatherOccupation: parent.fatherOccupation,
                motherOccupation: parent.motherOccupation,
                motherContact: parent.motherContact,
                fatherContact: parent.fatherContact
            },
            parent: {
                familyName: parent.guardianFamilyName,
                givenNames: parent.guardianGivenNames,
                phone: parent.guardianPhone,
                email: parent.guardianEmail,
                relationship: parent.relationship,
                city: parent.guardianCity,
                street: parent.guardianAddress
            },
            selectedOptionIds: list,
            parentId: parent.existingGuardianId,
            classId: academic.classId,
            admissionNumber: academic.admissionNumber,
            admissionDate: academic.admissionDate,
            enrollmentType: academic.enrollmentType,
            previousSchool: academic.previousSchool,
            // Backend field is `lastClass`, not `lastGradeCompleted` - this key must match it or
            // the value is silently dropped (Jackson ignores unknown properties).
            lastClass: academic.lastGradeCompleted
        }


        if (profile.photo) {
            formData.append('photo', profile.photo)
        }

        formData.append(
            'data',
            new Blob(
                [JSON.stringify(data)],
                {
                    type: 'application/json'
                }
            )
        )

        const response: any = await store.create(formData)

        createdStudentId.value = response.id
        // Enrolled - the draft has served its purpose.
        autosave = false
        clearTimeout(saveTimer)
        draft.clear()
        lastSavedAt.value = null
        successModal.value = true
        useNotify().success('Student enrolled successfully')
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to enroll student'
        useNotify().error(message)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    useAppStore().setTitle('Enroll Student')
    useAppStore().setBack(true)
    document.title = 'Enroll Student | Students | Skultem'
})


definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
