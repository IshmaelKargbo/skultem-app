<template>
    <UCard :ui="{ body: 'sm:p-0' }">
        <template #header>
            <div>
                <p class="text-xl font-semibold">
                    Student Photo Upload
                </p>

                <p class="text-sm text-muted">
                    Upload a clear profile photo for the student record.
                </p>
            </div>
        </template>

        <UForm :state="form" :schema="schema" @submit="next">
            <div>
                <div class="border-b p-5 dark:border-gray-800 border-gray-200 grid grid-cols-2 gap-5">
                    <div>
                        <UFileUpload v-model="form.photo" :ui="{
                            base: 'object-contain'
                        }" label="Drop student photo here" description="PNG, JPG or JPEG (max. 2MB)"
                            class="w-full min-h-64" />
                    </div>

                    <div class="space-y-3 py-5">
                        <p class="text-xl font-semibold">
                            Photo Guidelines
                        </p>

                        <div class="space-y-2 text-muted text-sm">
                            <p>- Clear, front-facing photo</p>
                            <p>- JPG, JPEG or PNG format</p>
                            <p>- Maximum size: 2MB</p>
                            <p>- Recommended size: 300×300px</p>
                            <p>- Avoid blurry or dark images</p>
                        </div>
                    </div>
                </div>

                <div class="flex px-5 py-4 justify-between items-center">
                    <p class="text-sm text-muted">
                        Step 4 of 4
                    </p>
                    <div class="flex gap-3">
                        <UButton @click="back" :icon="BACK_ICON" label="Back" variant="outline" color="neutral" />
                        <UButton type="submit" :loading="loading" :trailing-icon="NEXT_ICON" label="Enrolled Student" />
                    </div>
                </div>
            </div>
        </UForm>
    </UCard>
</template>

<script lang="ts" setup>
import * as yup from 'yup'

const { state, loading } = defineProps<{
    state?: {
        photo: File | null
    },
    loading: boolean
}>()

const emit = defineEmits<{
    next: [typeof form],
    back: []
}>()

function back() {
    emit('back')
}

const schema = yup.object({
    photo: yup
        .mixed()
        .required('Student photo is required')
})

const form = reactive({
    photo: null as File | null
})

function next() {
    emit('next', {
        ...form
    })
}

watch(
    () => state,
    (newVal) => {
        if (!newVal) return
        Object.assign(form, newVal)
    },
    {
        immediate: true
    }
)
</script>