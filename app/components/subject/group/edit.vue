<template>
  <u-slideover
    :dismissible="false"
    title="Edit Subject Group"
    :open="open"
    @update:open="(value) => emit('update:open', value)"
  >
    <template #header>
      <div class="flex justify-between w-full items-center">
        <p class="text-lg font-semibold">Edit Subject Group</p>
        <u-button :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
        <UFormField required label="Group Name" name="name">
          <UInput v-model="state.name" placeholder="e.g. Optional Subjects" :disabled="isLoading" class="w-full">
            <template #leading>
              <UIcon name="i-lucide-folder-open" class="text-muted" />
            </template>
          </UInput>
        </UFormField>

        <!-- The class/stream can't change: the group's subjects are already linked inside it. -->
        <UFormField :label="record?.streamId ? 'Stream' : 'Class'"
          help="To move a group, create a new one in the other class or stream.">
          <UInput :model-value="scopeName" disabled class="w-full">
            <template #leading>
              <UIcon :name="record?.streamId ? 'i-lucide-git-branch-plus' : 'i-lucide-school'" class="text-muted" />
            </template>
          </UInput>
        </UFormField>

        <UFormField required label="Total Selection" name="totalSelection">
          <UInput v-model.number="state.totalSelection" type="number" placeholder="e.g. 1" :disabled="isLoading"
            class="w-full">
            <template #leading>
              <UIcon name="i-lucide-list-checks" class="text-muted" />
            </template>
          </UInput>
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex space-x-3">
        <u-button :icon="SAVE_ICON" :loading="isLoading" label="Save" @click="formRef?.submit()" />
        <u-button label="Cancel" variant="outline" color="neutral" :disabled="isLoading" @click="close" />
      </div>
    </template>
  </u-slideover>
</template>

<script setup lang="ts">
import * as yup from "yup";

const { open, record } = defineProps<{
  open: boolean
  record: SubjectGroup | null
}>()

const emit = defineEmits<{
  "update:open": [boolean]
  saved: []
}>()

const store = useSubjectGroupStore();
const { error: toastError, success: toastSuccess } = useNotify();
const isLoading = ref(false);
const formRef = ref<any>(null);

const state = reactive<{ name: string; totalSelection: number | undefined }>({
  name: "",
  totalSelection: undefined,
});

const schema = yup.object({
  name: yup.string().trim().required("Group name is required"),
  totalSelection: yup
    .number()
    .typeError("Total must be a number")
    .required("Total selection is required")
    .min(1, "Total minimum selection must be 1"),
});

const scopeName = computed(() => {
  if (!record) return "";
  const name = record.streamId ? record.streamName : record.className;
  return name && name !== "N/A" ? name : "";
});

const close = () => emit("update:open", false);

async function onSubmit() {
  if (!record) return;
  isLoading.value = true;
  try {
    await store.edit(record.id, {
      name: state.name.trim(),
      totalSelection: Number(state.totalSelection),
    });
    toastSuccess("Subject group updated successfully");
    emit("saved");
    close();
  } catch (err: any) {
    toastError(err.message);
  } finally {
    isLoading.value = false;
  }
}

// Reload on every open so a cancelled edit doesn't linger the next time.
watch(() => [record, open] as const, ([value, isOpen]) => {
  if (!value || !isOpen) return;
  state.name = value.name;
  state.totalSelection = Number(value.totalSelection);
}, { immediate: true });
</script>
