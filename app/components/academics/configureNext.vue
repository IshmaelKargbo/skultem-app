<template>
    <u-slideover :dismissible="false" title="Set Next Academic Year" :open="open" @update:open="open = $event">
        <!-- Trigger -->
        <UButton v-if="activeYear && !activeYear.nextYearId" color="primary" variant="soft" label="Set Next Year"
            class="hidden md:flex" icon="i-lucide-calendar-plus" @click="onOpen" />
        <UButton v-if="activeYear && !activeYear.nextYearId" color="primary" variant="soft" class="md:hidden"
            icon="i-lucide-calendar-plus" @click="onOpen" />

        <UBadge v-if="activeYear && activeYear.nextYearId" color="success" variant="soft" size="lg"
            icon="i-lucide-circle-check" :label="`Next year: ${activeYear.nextYearName}`" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Set Next Academic Year</p>
                <u-button icon="lucide:x" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body / Form -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit.prevent="onSubmit">
                <div class="rounded-xl border-2 border-primary-200 dark:border-primary-600 dark:bg-gray-950 bg-primary-50 p-3">
                    <p class="text-sm font-medium text-primary-800 dark:text-white">Current academic year</p>
                    <p v-if="activeYear" class="text-xs text-primary-700 dark:text-muted mt-1">
                        {{ activeYear.name }}: {{ formatDateString(activeYear.startDate) }} - {{ formatDateString(activeYear.endDate) }}
                    </p>
                </div>

                <UButtonGroup class="w-full">
                    <UButton class="flex-1 justify-center" :color="mode === 'existing' ? 'primary' : 'neutral'"
                        :variant="mode === 'existing' ? 'solid' : 'outline'" label="Use Existing Year"
                        :disabled="isLoading" @click="mode = 'existing'" />
                    <UButton class="flex-1 justify-center" :color="mode === 'new' ? 'primary' : 'neutral'"
                        :variant="mode === 'new' ? 'solid' : 'outline'" label="Create New Year"
                        :disabled="isLoading" @click="mode = 'new'" />
                </UButtonGroup>

                <!-- Assign an academic year the school already created -->
                <template v-if="mode === 'existing'">
                    <UFormField required label="Academic year" name="nextYearId" :error="assignableYears.length === 0
                        ? 'No academic year starting after this one exists yet - create one from Academic Years first, or use \'Create New Year\'.'
                        : undefined">
                        <USelectMenu v-model="state.nextYearId" value-key="value" :items="assignableYears"
                            placeholder="Select an academic year" :disabled="isLoading || assignableYears.length === 0"
                            class="w-full" />
                    </UFormField>
                </template>

                <!-- Auto-create and template a new year -->
                <template v-else>
                    <UFormField required label="Name" name="name">
                        <UInput v-model="state.name" placeholder="e.g. 2026/2027" :disabled="isLoading" />
                        <template #hint>
                            <p class="text-xs text-muted">Suggested from {{ activeYear?.name }} - edit if needed.</p>
                        </template>
                    </UFormField>

                    <UFormField required label="Start Date" name="startDate" class="flex-1">
                        <UInput v-model="state.startDate" type="date" :disabled="isLoading" />
                    </UFormField>

                    <UFormField required label="End Date" name="endDate" class="flex-1">
                        <UInput v-model="state.endDate" type="date" :disabled="isLoading" />
                    </UFormField>

                    <div v-if="terms.length" class="rounded-xl border-2 border-primary-200 dark:border-primary-600 dark:bg-gray-950 bg-primary-50 p-3 space-y-2">
                        <p class="text-sm font-medium text-primary-800 dark:text-white">Terms that will be templated</p>
                        <p class="text-xs text-primary-700 dark:text-muted">
                            Copied from {{ activeYear?.name }}'s terms, shifted to fall inside the new year.
                        </p>
                        <ul class="space-y-1">
                            <li v-for="t in terms" :key="t.id" class="text-xs text-primary-700 dark:text-muted flex justify-between">
                                <span>{{ t.name }}</span>
                                <span>{{ formatDateString(shiftDate(t.startDate)) }} - {{ formatDateString(shiftDate(t.endDate)) }}</span>
                            </li>
                        </ul>
                    </div>
                </template>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <u-button label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
                <u-button trailing-icon="lucide:save" :loading="isLoading"
                    :label="mode === 'existing' ? 'Assign' : 'Create & Template'"
                    :disabled="mode === 'existing' && assignableYears.length === 0" @click="formRef?.submit()" />
            </div>
        </template>
    </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const store = useAcademicYearStore()
const { error: toastError, success: toastSuccess } = useNotify()
const isLoading = ref(false)
const mode = ref<'existing' | 'new'>('existing')

const activeYear = computed(() => store.activeYear)
const terms = computed(() => store.terms)

const assignableYears = computed(() => {
    if (!activeYear.value) return []
    const endDate = new Date(activeYear.value.endDate)

    return store.unassignedYears
        .filter((y) => y.id !== activeYear.value!.id && new Date(y.startDate) > endDate)
        .map((y) => ({ label: y.name, value: y.id }))
})

type NextYearForm = {
    nextYearId: string
    name: string
    startDate: string
    endDate: string
}

const state = reactive<NextYearForm>({
    nextYearId: '',
    name: '',
    startDate: '',
    endDate: ''
})

const schema = computed(() => mode.value === 'existing'
    ? yup.object({ nextYearId: yup.string().required('Select an academic year') })
    : yup.object({
        name: yup.string().required('Name is required'),
        startDate: yup.string().required('Start date is required'),
        endDate: yup.string().required('End date is required')
    }))

const formRef = ref<any>(null)
const open = ref(false)

// "2025/2026" -> "2026/2027", "2025" -> "2026", otherwise appends a marker.
function deriveNextName(name: string): string {
    const range = name.match(/(\d{4})(\D+)(\d{4})/)
    if (range) {
        const start = Number(range[1]) + 1
        const end = Number(range[3]) + 1
        return name.slice(0, range.index) + start + range[2] + end + name.slice((range.index ?? 0) + range[0].length)
    }

    const single = name.match(/\d{4}/)
    if (single) {
        const year = Number(single[0]) + 1
        return name.slice(0, single.index) + year + name.slice((single.index ?? 0) + single[0].length)
    }

    return `${name} (Next)`
}

function shiftDate(date: string): string {
    if (!date) return date
    const d = new Date(date)
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString().slice(0, 10)
}

function prefill() {
    if (!activeYear.value) return
    state.name = deriveNextName(activeYear.value.name)
    state.startDate = shiftDate(activeYear.value.startDate)
    state.endDate = shiftDate(activeYear.value.endDate)
}

async function onOpen() {
    open.value = true
    if (!store.records.length) await store.fetchAll()
    mode.value = assignableYears.value.length > 0 ? 'existing' : 'new'
    prefill()
    if (!store.terms.length) await store.getTerms()
}

const close = () => {
    open.value = false
    state.nextYearId = ''
    state.name = ''
    state.startDate = ''
    state.endDate = ''
}

const onSubmit = async (event: FormSubmitEvent<NextYearForm>) => {
    event.preventDefault()
    if (!activeYear.value) return

    isLoading.value = true
    try {
        if (mode.value === 'existing') {
            if (!state.nextYearId) {
                toastError('Select an academic year to assign')
                return
            }

            const res = await store.assignNext(activeYear.value.id, state.nextYearId)
            if (res) {
                toastSuccess(`${res.nextYearName} assigned as the next academic year`)
                close()
            }
            return
        }

        await schema.value.validate(state, { abortEarly: false })
        const res = await store.configureNext(activeYear.value.id, {
            name: state.name,
            startDate: state.startDate,
            endDate: state.endDate
        })

        if (res) {
            toastSuccess(`${res.academicYear.name} configured${res.terms.length ? ` with ${res.terms.length} term(s) templated` : ''}`)
            close()
        }
    } catch (err: any) {
        toastError(err.message)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    if (!store.records.length) store.fetchAll()
})
</script>
