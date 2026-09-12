<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const { material } = defineProps<{ material?: Material }>()

const store = useMaterialStore()
const { categories: records } = storeToRefs(store)
const { error: toastError, success: toastSuccess } = useNotify()

const isEdit = computed(() => !!material)
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
    price: number
}

function defaultState(): MaterialForm {
    return {
        name: material?.name || '',
        categoryId: material?.category.id || '',
        unit: material?.unit || '',
        inStock: material?.inStock || 0,
        price: material?.price || 0
    }
}

const state = reactive<MaterialForm>(defaultState())

const schema = yup.object({
    name: yup.string().required(),
    categoryId: yup.string().required(),
    unit: yup.string().required(),
    inStock: yup.number().min(0).required(),
    price: yup.number().min(0, 'Cannot be negative').required('Price is required')
})

const close = () => {
    open.value = false
    Object.assign(state, defaultState())
}

const onSubmit = async (event: FormSubmitEvent<MaterialForm>) => {
    isLoading.value = true

    try {
        if (isEdit.value && material) {
            const { inStock, ...rest } = state
            await store.update({ id: material.id, ...rest })
            toastSuccess('Material updated successfully')
        } else {
            await store.create(state)
            await store.fetchAll()
            toastSuccess('Material created successfully')
        }

        close()
    } catch (err: any) {
        toastError(err?.message || 'Something went wrong')
    } finally {
        isLoading.value = false
    }
}

// Every material row renders its own instance of this component (for its "edit" trigger), plus
// one more for the header's "Add" button - all fetching the same unpaged category list purely to
// populate this form's dropdown. Only fetch if nothing's loaded yet, instead of once per instance.
onMounted(() => {
    if (!records.value.length) store.fetchAllCategory(0, 0)
})
</script>
<template>
    <USlideover :dismissible="false" v-model:open="open">
        <UButton
            v-if="isEdit"
            :icon="EDIT_ICON"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="open = true"
        />
        <UButton v-else color="primary" label="Add Material" icon="prime:plus" @click="open = true" />
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">{{ isEdit ? 'Edit Material' : 'Add Material' }}</p>
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
                        :disabled="isLoading || isEdit" />
                    <template v-if="isEdit" #help>
                        <p class="text-xs text-muted">
                            Stock is adjusted separately via restock or supply, not here.
                        </p>
                    </template>
                </UFormField>

                <!-- Price -->
                <UFormField label="Selling Price" name="price" required>
                    <UInput v-model.number="state.price" type="number" min="0" step="0.01" placeholder="0.00"
                        :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Price per unit - pre-fills the unit price when this item is sold.
                        </p>
                    </template>
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
