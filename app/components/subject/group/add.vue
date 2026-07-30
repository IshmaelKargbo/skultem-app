<template>
  <u-slideover title="Add Subject Group" :open="open" @update:open="open = $event">
    <UButton
      color="primary"
      class="hidden md:flex"
      label="Add Subject Group"
      :icon="ADD_ICON"
      @click="open = true"
    />
    <UButton color="primary" class="md:hidden" :icon="ADD_ICON" @click="open = true" />

    <template #header>
      <div class="flex justify-between w-full items-center">
        <p class="text-lg font-semibold">Add Subject Group</p>
        <u-button :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
      <UForm
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-4 w-full"
        @submit="onSubmit"
      >
        <!-- Group Name -->
        <UFormField required label="Group Name" name="name">
          <UInput
            v-model="state.name"
            placeholder="e.g. Optional Subjects"
            :disabled="isLoading"
          >
            <template #leading>
              <UIcon name="i-lucide-folder-open" class="text-muted" />
            </template>
          </UInput>
        </UFormField>

        <!-- Level -->
        <UFormField required label="Level" name="level">
          <USelectMenu
            v-model="state.level"
            value-key="value"
            :items="levelsXPrimary"
            placeholder="Select Level"
          >
            <template #leading>
              <UIcon name="i-lucide-layers-3" class="text-muted" />
            </template>
          </USelectMenu>
        </UFormField>

        <!-- Class -->
        <UFormField
          v-if="state.level && state.level !== Level.SSS"
          required
          label="Class"
          name="classId"
        >
          <USelectMenu
            v-model="state.classId"
            value-key="value"
            :items="classes"
            placeholder="Select class"
          >
            <template #leading>
              <UIcon name="i-lucide-school" class="text-muted" />
            </template>
          </USelectMenu>
        </UFormField>

        <!-- Stream -->
        <UFormField
          v-if="state.level === Level.SSS"
          required
          label="Stream"
          name="streamId"
        >
          <USelectMenu
            v-model="state.streamId"
            value-key="value"
            :items="streams"
            placeholder="Select Stream"
          >
            <template #leading>
              <UIcon name="i-lucide-git-branch-plus" class="text-muted" />
            </template>
          </USelectMenu>
        </UFormField>

        <!-- Total Selection -->
        <UFormField required label="Total Selection" name="totalSelection">
          <UInput
            v-model.number="state.totalSelection"
            type="number"
            placeholder="e.g. 1"
          >
            <template #leading>
              <UIcon name="i-lucide-list-checks" class="text-muted" />
            </template>
          </UInput>
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="flex space-x-3">
        <u-button
          :icon="SAVE_ICON"
          :loading="isLoading"
          label="Save"
          @click="formRef?.submit()"
        />
        <u-button
          label="Cancel"
          variant="outline"
          color="neutral"
          @click="close"
          :disabled="isLoading"
        />
      </div>
    </template>
  </u-slideover>
</template>
<script setup lang="ts">
import * as yup from "yup";
import { reactive, ref, onMounted } from "vue";
import type { FormSubmitEvent } from "#ui/types";

const store = useSubjectGroupStore();
const classStore = useClassStore();
const streamStore = useStreamStore();
const toast = useToast();
const isLoading = ref(false);

const open = ref(false);
const formRef = ref<any>(null);

const streams = computed(() =>
  streamStore.records.map((s) => ({
    label: s.name,
    value: s.id,
  }))
);

const levelsXPrimary = computed(() =>
  levels.filter((e) => e.label.toUpperCase() != "PRIMARY")
);

const classes = computed(() =>
  classStore.records
    .filter((e) => e.level.toLowerCase() == state.level?.toLowerCase())
    .map((s) => ({
      label: s.name,
      value: s.id,
    }))
);

type SubjectGroupForm = {
  name: string;
  level: Level | null;
  classId: string;
  streamId: string;
  totalSelection: number | null;
};

const state = reactive<SubjectGroupForm>({
  name: "",
  level: null,
  streamId: "",
  classId: "",
  totalSelection: null,
});

const schema = yup.object({
  name: yup.string().required("Group name is required"),
  level: yup.mixed<Level>().required("Level is required"),
  streamId: yup
    .string()
    .nullable()
    .when("level", {
      is: (val: Level) => val === Level.SSS,
      then: (schema) => schema.required("Stream is required for SSS"),
      otherwise: (schema) => schema.nullable(),
    }),
  classId: yup
    .string()
    .nullable()
    .when("level", {
      is: (val: Level) => val !== Level.SSS,
      then: (schema) => schema.required("Class is required for Primary of JSS"),
      otherwise: (schema) => schema.nullable(),
    }),
  totalSelection: yup
    .number()
    .typeError("Total must be a number")
    .required("Total selection is required")
    .min(1, "Total minimum selection must be 1"),
});

const close = () => {
  open.value = false;
  Object.assign(state, {
    name: "",
    level: "",
    streamId: "",
    totalSelection: null,
  });
};

const onSubmit = async (event: FormSubmitEvent<SubjectGroupForm>) => {
  isLoading.value = true;
  try {
    await schema.validate(state, { abortEarly: false });

    await store.create({
      totalSelection: state.totalSelection || 1,
      name: state.name,
      classId: state.classId,
      streamId: state.streamId,
    });

    toast.add({
      description: "Subject Group created successfully",
      color: "success",
    });

    store.fetchAll(1, runtimeConf().limit);
    close();
  } catch (err: any) {
    toast.add({
      description: err.message,
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  streamStore.fetchAll(0, 0);
  classStore.fetchAll(0, 0);
});
</script>
