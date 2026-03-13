<template>
    <u-slideover :open="open" @update:open="emit('update:open', $event)">
        <template #header>
            <div class="flex justify-between w-full items-center">
                <div>
                    <p class="text-lg font-semibold">Assign Assessments</p>
                    <p class="text-xs text-slate-500">{{ template?.name || 'Select template' }}</p>
                </div>
                <UButton icon="lucide:x" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
                <div class="sticky top-0 z-10 rounded-lg border border-slate-200 p-3 bg-slate-50 shadow-sm">
                    <p class="text-sm text-slate-600">Total Weight</p>
                    <div class="flex items-center justify-between">
                        <p class="text-xl font-semibold"
                            :class="totalWeight === 100 ? 'text-green-600' : 'text-amber-600'">
                            {{ totalWeight }}%
                        </p>
                        <UBadge :color="totalWeight === 100 ? 'success' : 'warning'" variant="subtle"
                            :label="totalWeight === 100 ? 'Balanced' : 'Needs adjustment'" />
                    </div>
                    <p class="text-xs text-slate-500 mt-1">
                        Remaining balance: {{ remainingWeight }}%
                    </p>
                </div>

                <div class="space-y-3">
                    <div v-for="(assignment, index) in state.assignments" :key="index"
                        class="p-3 border border-slate-200 rounded-lg bg-white">
                        <div class="flex items-center justify-between mb-3">
                            <p class="text-sm font-medium text-slate-700">Assessment {{ index + 1 }}</p>
                            <UButton v-if="state.assignments.length > 1" icon="i-lucide-trash-2" color="error"
                                variant="ghost" size="xs" @click="removeAssignment(index)" />
                        </div>

                        <div class="space-y-4">
                            <UFormField :name="`assignments.${index}.name`" label="Name" required class="md:col-span-2">
                                <UInput v-model="assignment.name" placeholder="e.g. Test 1" :disabled="isLoading" />
                            </UFormField>

                            <UFormField :name="`assignments.${index}.weight`" label="Weight (%)" required>
                                <UInput :model-value="assignment.weight" type="number" min="1" max="100"
                                    :disabled="isLoading"
                                    @update:model-value="(value) => updateWeight(index, value)"
                                    @input="normalizeWeight(index)" />
                                <template #help>
                                    <div class="flex items-center justify-between">
                                        <span>Max available: {{ maxAllowedFor(index) }}%</span>
                                        <button type="button" class="text-primary text-xs" @click="applyBalance(index)">
                                            Apply balance
                                        </button>
                                    </div>
                                </template>
                            </UFormField>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col space-y-2">
                    <UButton class="flex justify-center" label="Add Assessment" icon="i-lucide-plus" variant="outline"
                        color="neutral" :disabled="isLoading" @click="addAssignment" />
                    <UButton label="Auto Split 100%" icon="i-lucide-wand-sparkles"
                        class="flex justify-center" variant="outline" color="info"
                        :disabled="isLoading || !state.assignments.length" @click="splitAcrossRows" />
                </div>
            </UForm>
        </template>

        <template #footer>
            <div class="flex space-x-3">
                <UButton icon="lucide:save" :loading="isLoading" label="Save" @click="formRef?.submit()" />
                <UButton label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>
    </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { computed, reactive, ref, watch } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

interface AssessmentItem {
    id: string
    name: string
    weight: number
    position: number
    createdAt: string
    updatedAt: string
}

interface AssessmentTemplateItem {
    id: string
    name: string
    description: string
    assessments: AssessmentItem[]
    createdAt: string
    updatedAt: string
}

const props = defineProps<{
    open: boolean
    template: AssessmentTemplateItem | null
}>()

const emit = defineEmits<{
    'update:open': [value: boolean]
    saved: []
}>()

const store = useAssessmentStore()
const toast = useToast()

const isLoading = ref(false)
const formRef = ref<any>(null)

type AssessmentForm = {
    assignments: AssessmentAssignmentDto[]
}

const state = reactive<AssessmentForm>({
    assignments: [{ name: '', weight: 0 }]
})

const schema = yup.object({
    assignments: yup.array().of(
        yup.object({
            name: yup.string().trim().required('Assessment name is required'),
            weight: yup
                .number()
                .typeError('Weight must be a number')
                .required('Weight is required')
                .moreThan(0, 'Weight must be greater than 0')
                .max(100, 'Weight cannot exceed 100')
        })
    ).min(1, 'At least one assessment is required')
})

const totalWeight = computed(() =>
    state.assignments.reduce((sum, item) => sum + (Number(item.weight) || 0), 0)
)

const remainingWeight = computed(() => Math.max(0, 100 - totalWeight.value))

function sumWithout(index: number) {
    return state.assignments.reduce((sum, item, i) => {
        if (i === index) return sum
        return sum + (Number(item.weight) || 0)
    }, 0)
}

function maxAllowedFor(index: number) {
    return Math.max(0, 100 - sumWithout(index))
}

function normalizeWeight(index: number) {
    const current = Number(state.assignments[index]?.weight) || 0
    const bounded = Math.min(Math.max(current, 0), maxAllowedFor(index))
    if (state.assignments[index]) {
        state.assignments[index].weight = bounded
    }
}

function updateWeight(index: number, value: string | number) {
    const parsed = Number(value)
    const current = Number.isFinite(parsed) ? parsed : 0
    const bounded = Math.min(Math.max(current, 0), maxAllowedFor(index))

    if (state.assignments[index]) {
        state.assignments[index].weight = bounded
    }
}

function applyBalance(index: number) {
    if (!state.assignments[index]) return
    state.assignments[index].weight = maxAllowedFor(index)
}

function splitAcrossRows() {
    const count = state.assignments.length
    if (!count) return

    const base = Math.floor(100 / count)
    let remainder = 100 - (base * count)

    state.assignments.forEach((item) => {
        const bonus = remainder > 0 ? 1 : 0
        item.weight = base + bonus
        if (remainder > 0) remainder -= 1
    })
}

function hydrateFromTemplate() {
    if (!props.template?.assessments?.length) {
        state.assignments = [{ name: '', weight: 0 }]
        return
    }

    state.assignments = [...props.template.assessments]
        .sort((a, b) => a.position - b.position)
        .map((item) => ({
            name: item.name,
            weight: item.weight
        }))
}

watch(
    () => props.open,
    (value) => {
        if (!value) return
        hydrateFromTemplate()
    }
)

function addAssignment() {
    state.assignments.push({ name: '', weight: 0 })
}

function removeAssignment(index: number) {
    state.assignments.splice(index, 1)
}

function close() {
    emit('update:open', false)
}

const onSubmit = async (event: FormSubmitEvent<AssessmentForm>) => {
    if (!props.template?.id) return

    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })

        const assignments = state.assignments.map((item) => ({
            name: item.name.trim(),
            weight: Number(item.weight)
        }))

        const uniqueNames = new Set(assignments.map((a) => a.name.toLowerCase()))
        if (uniqueNames.size !== assignments.length) {
            throw new Error('Assessment names must be unique')
        }

        if (totalWeight.value > 100) {
            throw new Error('Total assessment weight cannot exceed 100%')
        }

        await store.assign(props.template.id, { assignments })
        await store.fetchAll()

        toast.add({
            description: 'Assessments updated successfully',
            color: 'success'
        })

        emit('saved')
        close()
    } catch (err: any) {
        toast.add({
            description: err.message || 'Something went wrong',
            color: 'error'
        })
    } finally {
        isLoading.value = false
    }
}
</script>
