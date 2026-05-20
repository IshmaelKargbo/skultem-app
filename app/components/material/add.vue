<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const store = useMaterialStore()
const { categories: records } = storeToRefs(store)
const { error: toastError, success: toastSuccess } = useNotify()

const open = ref(false)
const isLoading = ref(false)
const formRef = ref()

const categories = computed(() => records.value.map(e => ({ label: e.name, value: e.id })))
const units = [
    { label: 'Pieces', value: 'PCS' },
    { label: 'Box', value: 'BOX' },
    { label: 'Pack', value: 'PACK' },
    { label: 'Litre', value: 'LITRE' }
]

type MaterialForm = {
    name: string
    categoryId: string
    unit: string
    inStock: number
}

const state = reactive<MaterialForm>({
    name: '',
    categoryId: '',
    unit: '',
    inStock: 0
})

const schema = yup.object({
    name: yup.string().required(),
    categoryId: yup.string().required(),
    unit: yup.string().required(),
    inStock: yup.number().min(0).required()
})

const close = () => {
    open.value = false
    state.name = ''
    state.categoryId = ''
    state.unit = ''
    state.inStock = 0
}

const onSubmit = async (event: FormSubmitEvent<MaterialForm>) => {
    isLoading.value = true

    try {
        await store.create(state)
        await store.fetchAll()

        toastSuccess('Material created successfully')

        close()
    } catch (err: any) {
        toastError(err?.message || 'Something went wrong')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => store.fetchAllCategory(0, 0))
</script>
<template>
    <USlideover :dismissible="false" v-model:open="open">
        <UButton color="primary" label="Add Material" icon="prime:plus" @click="open = true" />
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Material</p>
                <UButton icon="lucide:x" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">

                <!-- Name -->
                <UFormField label="Name" name="name" required>
                    <UInput v-model="state.name" placeholder="e.g. Exercise Book" :disabled="isLoading" />
                </UFormField>

                <!-- Category -->
                <UFormField label="Category" name="categoryId" required>
                    <USelectMenu value-key="value" v-model="state.categoryId" :items="categories"
                        option-attribute="name" value-attribute="id" placeholder="Select category"
                        :disabled="isLoading" />
                </UFormField>

                <!-- Unit -->
                <UFormField label="Unit" name="unit" required>
                    <USelectMenu v-model="state.unit" value-key="value" :items="units" placeholder="Select unit"
                        :disabled="isLoading" />
                </UFormField>

                <!-- Stock -->
                <UFormField label="In Stock" name="inStock" required>
                    <UInput v-model.number="state.inStock" type="number" min="0" placeholder="0"
                        :disabled="isLoading" />
                </UFormField>

            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <UButton icon="lucide:save" :loading="isLoading" label="Save" @click="formRef?.submit()" />
                <UButton label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>
    </USlideover>
</template>