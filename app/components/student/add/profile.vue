<template>
    <UCard :ui="{ body: 'sm:p-0' }">
        <template #header>
            <div>
                <p class="text-lg font-semibold md:text-xl">
                    Student Photo Upload
                </p>

                <p class="text-sm text-muted">
                    Upload a clear profile photo for the student record.
                </p>
            </div>
        </template>

        <UForm :state="form" :schema="schema" @submit="next">
            <div>
                <div class="grid grid-cols-1 gap-4 border-b border-gray-200 p-4 dark:border-gray-800 md:grid-cols-2 md:gap-5 md:p-5">
                    <div>
                        <UFileUpload v-model="form.photo" :ui="{
                            base: 'object-contain'
                        }" label="Drop student photo here" description="PNG, JPG or JPEG (max. 2MB)"
                            class="w-full min-h-52 md:min-h-64" />
                    </div>

                    <div class="space-y-3 py-0 md:py-5">
                        <p class="text-lg font-semibold md:text-xl">
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

                <div class="flex flex-col-reverse gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
                    <p class="text-sm text-muted">
                        Step 4 of 4
                    </p>
                    <div class="flex flex-col gap-2 sm:flex-row">
                        <UButton @click="back" :icon="BACK_ICON" label="Back" variant="outline" color="neutral" class="w-full justify-center sm:w-auto" />
                        <UButton type="submit" :loading="loading" :trailing-icon="NEXT_ICON" label="Enrolled Student" class="w-full justify-center sm:w-auto" />
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
