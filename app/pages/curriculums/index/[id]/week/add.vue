<template>
    <div class="space-y-4 px-4 md:px-6">
        <Heading title="Add Week" subtitle="Create weekly topics and learning objectives.">
            <div class="flex gap-3">
                <UButton color="neutral" variant="outline" :icon="BACK_ICON" label="Back" @click="back" />
            </div>
        </Heading>
        <UForm ref="formRef" :state="state" :schema="schema" class="space-y-6" @submit="onSubmit">
            <!-- Topic -->
            <UCard>
                <template #header>
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-book-open" class="text-primary" />
                        <span class="font-semibold">Topic Information</span>
                    </div>
                </template>

                <div class="grid gap-5 md:grid-cols-2">
                    <UFormField label="Week Number" name="week" required class="md:col-span-2">
                        <UInput v-model.number="state.week" type="number" leading-icon="i-lucide-hash" />
                    </UFormField>

                    <UFormField label="Topic" name="topic" required>
                        <UInput v-model="state.topic" leading-icon="i-lucide-book" placeholder="Whole Numbers" />
                    </UFormField>

                    <UFormField label="Sub Topic" name="subtopic">
                        <UInput v-model="state.subtopic" placeholder="Fractions" leading-icon="i-lucide-book-copy" />
                    </UFormField>
                </div>
            </UCard>

            <!-- Objectives -->
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-target" class="text-primary" />
                            <span class="font-semibold">Learning Objectives</span>
                        </div>

                        <UButton variant="soft" :icon="ADD_ICON" label="Add" @click="addObjective" />
                    </div>
                </template>

                <div class="space-y-4">
                    <div v-for="(objective, index) in state.objectives" :key="index" class="flex gap-3">
                        <UFormField :name="`objectives.${index}`" :label="`Objective ${index + 1}`" required
                            class="flex-1">
                            <UInput v-model="state.objectives[index]" :placeholder="`Objective ${index + 1}`" />
                        </UFormField>

                        <UButton v-if="state.objectives.length > 1" color="error" variant="ghost" :icon="DELETE_ICON"
                            @click="removeObjective(index)" />
                    </div>
                </div>
            </UCard>

            <!-- Actions -->
            <UCard>
                <div class="flex gap-3">
                    <UButton color="neutral" variant="outline" :icon="BACK_ICON" label="Cancel" @click="back" />

                    <UButton type="submit" :loading="isLoading" :trailing-icon="SAVE_ICON" label="Save Week" />
                </div>
            </UCard>
        </UForm>
    </div>
</template>

<script setup lang="ts">
import * as yup from "yup"
const schemeStore = useSchemeOfWorkStore()
const store = useWeekStore()
const isLoading = ref(false);
const { progress } = storeToRefs(schemeStore)

const formRef = ref()

const route = useRoute()
const id = computed(() => route.params.id as string)

const state = reactive({
    week: 0,
    topic: "",
    subtopic: "",
    objectives: [""]
})

const schema = yup.object({
    week: yup.number().required(),
    topic: yup.string().required("Topic is required"),
    objectives: yup.array()
        .of(
            yup.string().trim().required("Objective is required")
        )
        .min(1, "At least one objective is required")
        .required()
})

function addObjective() {
    state.objectives.push("")
}

function removeObjective(index: number) {
    if (state.objectives.length > 1) {
        state.objectives.splice(index, 1)
    }
}

async function onSubmit() {
    try {
        isLoading.value = true
        await store.create({ ...state, scheme: id.value })
        back()
    } catch (error: any) {
        useNotify().error(error.message);
        isLoading.value = false
    }
}

function back() {
    navigateTo(`/curriculums/${id.value}`)
}

watch(() => progress.value, (value) => {
    if (value) {
        state.week = value.totalWeeks + 1
    }
})

watch(
    () => route.params.id,
    (schemeId) => {
        if (schemeId) schemeStore.getProgress(schemeId as string)
    },
    { immediate: true }
)

onMounted(() => {
    useAppStore().setTitle('Add Week')
    useAppStore().setBack(`/curriculums/${id.value}`)
    document.title = "Add Week | Scheme of Work | Skultem"
})

// Missing entirely before - matches its parent curriculum page and the top-level "add
// curriculum" page (curriculums/index/[id]/index.vue, curriculums/index/add.vue).
definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>