<template>
    <UCard :ui="{ body: 'sm:p-0' }">
        <template #header>
            <div>
                <p class="text-xl font-semibold">Student Photo Upload</p>
                <p class="text-sm text-muted">Upload a clear profile photo for the student record.</p>
            </div>
        </template>

        <UForm :state="form" :schema="schema" @submit="submit">
            <div>
                <div class="border-b p-5 dark:border-gray-800 border-gray-200 grid grid-cols-2 gap-5">

                    <!-- Left: Upload + Cropped Result -->
                    <div class="space-y-4">

                        <!-- Upload trigger -->
                        <label
                            class="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-5 text-center transition hover:border-primary-300 dark:border-gray-800">
                            <UIcon name="i-lucide-image-plus" class="mb-2 text-3xl text-muted" />
                            <span class="font-medium">
                                {{ croppedUrl ? 'Replace photo' : 'Upload student photo' }}
                            </span>
                            <span class="text-sm text-muted">PNG, JPG or JPEG (max. 2MB)</span>
                            <input class="hidden" type="file" accept="image/png,image/jpeg,image/jpg"
                                @change="onFileChange">
                        </label>

                        <!-- Cropped result preview -->
                        <div v-if="croppedUrl" class="space-y-2">
                            <p class="text-sm font-medium text-muted">Cropped photo for upload</p>
                            <div class="relative mx-auto overflow-hidden rounded-md border bg-gray-100 dark:bg-gray-900"
                                style="width: 100%; aspect-ratio: 4 / 5; max-height: 280px;">
                                <img :src="croppedUrl" alt="Cropped student photo"
                                    class="h-full w-full object-cover" />
                                <UButton
                                    size="xs"
                                    icon="i-lucide-pencil"
                                    label="Re-crop"
                                    class="absolute bottom-2 right-2 opacity-90"
                                    @click="openCropModal"
                                />
                            </div>
                        </div>

                        <UAlert v-else color="neutral" variant="subtle" title="ID photo crop"
                            description="Choose a photo, then align the face inside the ID frame before enrollment." />
                    </div>

                    <!-- Right: Guidelines -->
                    <div class="space-y-3 py-5">
                        <p class="text-xl font-semibold">Photo Guidelines</p>
                        <div class="space-y-2 text-muted text-sm">
                            <p>- Clear, front-facing photo</p>
                            <p>- JPG, JPEG or PNG format</p>
                            <p>- Maximum size: 2MB</p>
                            <p>- Cropped to school ID ratio (4:5)</p>
                            <p>- Avoid blurry or dark images</p>
                        </div>
                    </div>
                </div>

                <div class="flex px-5 py-4 justify-between items-center">
                    <p class="text-sm text-muted">Step 4 of 4</p>
                    <div class="flex gap-3">
                        <UButton @click="back" :icon="BACK_ICON" label="Back" variant="outline" color="neutral" />
                        <UButton type="submit" :loading="loading" :trailing-icon="NEXT_ICON" label="Enroll Student" />
                    </div>
                </div>
            </div>
        </UForm>
    </UCard>

    <!-- Crop Modal -->
    <UModal v-model:open="cropModalOpen" title="Crop Student Photo" :ui="{ width: 'max-w-lg' }">
        <template #body>
            <div class="space-y-4 p-1">
                <!-- Preview inside modal — full image visible, crop frame is the container -->
                <div class="relative mx-auto overflow-hidden rounded-lg border bg-gray-100 dark:bg-gray-900"
                    style="width: 100%; aspect-ratio: 4 / 5; max-height: 380px;">
                    <img
                        v-if="rawPreviewUrl"
                        :src="rawPreviewUrl"
                        alt="Crop preview"
                        class="absolute inset-0 w-full h-full object-contain transition-transform duration-75"
                        :style="previewStyle"
                    />
                </div>

                <!-- Controls -->
                <div class="grid gap-3">
                    <UFormField label="Zoom">
                        <input v-model.number="crop.zoom" class="w-full" type="range" min="1" max="3" step="0.05">
                    </UFormField>
                    <UFormField label="Horizontal position">
                        <input v-model.number="crop.x" class="w-full" type="range" min="-100" max="100" step="1">
                    </UFormField>
                    <UFormField label="Vertical position">
                        <input v-model.number="crop.y" class="w-full" type="range" min="-100" max="100" step="1">
                    </UFormField>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-3 w-full">
                <UButton label="Cancel" variant="outline" color="neutral" @click="cancelCrop" />
                <UButton label="Apply Crop" icon="i-lucide-check" :loading="cropping" @click="applyCrop" />
            </div>
        </template>
    </UModal>
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
    submit: [{ data: { photo: File | null } }],
    back: []
}>()

function back() {
    emit('back')
}

const schema = yup.object({
    photo: yup.mixed().required('Student photo is required')
})

const form = reactive({
    photo: null as File | null
})

// Raw source file (original upload, never mutated)
const rawFile = ref<File | null>(null)
const rawPreviewUrl = ref('')

// Final cropped result shown in main card
const croppedUrl = ref('')

// Modal state
const cropModalOpen = ref(false)
const cropping = ref(false)

const crop = reactive({ zoom: 1, x: 0, y: 0 })

const previewStyle = computed(() => ({
    transform: `scale(${crop.zoom}) translate(${crop.x}%, ${crop.y}%)`,
    transformOrigin: 'center center',
}))

// ─── File input ───────────────────────────────────────────────────────────────

function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
        useNotify().error('Student photo must be 2MB or less')
        input.value = ''
        return
    }

    rawFile.value = file
    crop.zoom = 1
    crop.x = 0
    crop.y = 0

    if (rawPreviewUrl.value) URL.revokeObjectURL(rawPreviewUrl.value)
    rawPreviewUrl.value = URL.createObjectURL(file)

    openCropModal()
}

// ─── Crop modal ───────────────────────────────────────────────────────────────

function openCropModal() {
    cropModalOpen.value = true
}

function cancelCrop() {
    // If no crop has been applied yet, clear the selection too
    if (!croppedUrl.value) {
        rawFile.value = null
        if (rawPreviewUrl.value) URL.revokeObjectURL(rawPreviewUrl.value)
        rawPreviewUrl.value = ''
    }
    cropModalOpen.value = false
}

async function applyCrop() {
    if (!rawFile.value) return
    cropping.value = true

    try {
        const cropped = await cropPhoto(rawFile.value)
        form.photo = cropped

        if (croppedUrl.value) URL.revokeObjectURL(croppedUrl.value)
        croppedUrl.value = URL.createObjectURL(cropped)

        cropModalOpen.value = false
    } finally {
        cropping.value = false
    }
}

// ─── Canvas crop ──────────────────────────────────────────────────────────────

async function cropPhoto(file: File): Promise<File> {
    const image = await loadImage(file)
    const canvas = document.createElement('canvas')
    const width = 600
    const height = 750

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    const baseScale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
    const scale = baseScale * crop.zoom
    const drawWidth = image.naturalWidth * scale
    const drawHeight = image.naturalHeight * scale
    const offsetX = (crop.x / 100) * (width / 2)
    const offsetY = (crop.y / 100) * (height / 2)

    ctx.drawImage(
        image,
        (width - drawWidth) / 2 + offsetX,
        (height - drawHeight) / 2 + offsetY,
        drawWidth,
        drawHeight
    )

    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.92)
    })

    if (!blob) return file

    return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
        type: 'image/jpeg',
        lastModified: Date.now()
    })
}

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        const url = URL.createObjectURL(file)
        image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
        image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load student photo')) }
        image.src = url
    })
}

// ─── Form submit ──────────────────────────────────────────────────────────────

async function submit() {
    emit('submit', { data: { photo: form.photo } })
}

// ─── Restore from prop ────────────────────────────────────────────────────────

watch(
    () => state,
    (newVal) => {
        if (!newVal) return
        Object.assign(form, newVal)
        if (form.photo) {
            rawFile.value = form.photo
            if (rawPreviewUrl.value) URL.revokeObjectURL(rawPreviewUrl.value)
            rawPreviewUrl.value = URL.createObjectURL(form.photo)
            if (croppedUrl.value) URL.revokeObjectURL(croppedUrl.value)
            croppedUrl.value = URL.createObjectURL(form.photo)
        }
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    if (rawPreviewUrl.value) URL.revokeObjectURL(rawPreviewUrl.value)
    if (croppedUrl.value) URL.revokeObjectURL(croppedUrl.value)
})
</script>
