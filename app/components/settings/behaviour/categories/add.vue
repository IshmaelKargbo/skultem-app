<template>
    <USlideover :dismissible="false" title="Add Behaviour Category" :open="open" @update:open="open = $event">
        <!-- Trigger -->
        <UButton color="primary" label="Add Behaviour Category" icon="prime:plus" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Behaviour Category</p>
                <UButton icon="codicon:close" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
                <!-- Category Name -->
                <UFormField required label="Category Name" name="name">
                    <UInput v-model="state.name" placeholder="e.g. Academic Behaviour" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Enter the behaviour category name.
                        </p>
                    </template>
                </UFormField>

                <!-- Description -->
                <UFormField label="Description" name="description">
                    <UTextarea v-model="state.description" placeholder="Optional description" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Provide additional details about this behaviour category.
                        </p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <UButton icon="mynaui:save" :loading="isLoading" label="Save" @click="formRef?.submit()" />

                <UButton label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>
    </USlideover>
</template>

<script setup lang="ts">
import * as yup from "yup"
import { reactive, ref } from "vue"
import type { FormSubmitEvent } from "#ui/types"

const store = useBehaviourCategoryStore()
const toast = useToast()

const isLoading = ref(false)
const open = ref(false)
const formRef = ref<any>(null)

type BehaviourCategoryForm = {
    name: string
    description: string
}

const state = reactive<BehaviourCategoryForm>({
    name: "",
    description: ""
})

const schema = yup.object({
    name: yup.string().required("Category name is required"),
    description: yup.string().required("Category description is required")
})

const close = () => {
    open.value = false
    state.name = ""
    state.description = ""
}

const onSubmit = async (event: FormSubmitEvent<BehaviourCategoryForm>) => {
    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })

        await store.create({
            name: state.name,
            description: state.description
        })

        await store.fetchAll(1, runtimeConf().limit)

        toast.add({
            description: "Behaviour category created successfully",
            color: "success"
        })

        close()
    } catch (err: any) {
        toast.add({
            description: err.message || "Something went wrong",
            color: "error"
        })
    } finally {
        isLoading.value = false
    }
}
</script>