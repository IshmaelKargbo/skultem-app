<template>
  <UForm class="p-4 sm:p-6 space-y-4" :state="state" :schema="schema" @submit="onSubmit">
    <Heading
      title="Assign Subjects to Stream"
      subtitle="Define the curriculum structure for this stream."
    >
      <div class="w-full md:w-72">
        <UFormField name="streamId">
          <USelectMenu
            value-key="value"
            :loading="streamStore.loading"
            v-model="state.streamId"
            @change="fetchRecord"
            :items="streams"
            placeholder="Choose a stream"
            class="w-full"
          />
        </UFormField>
      </div>
    </Heading>

    <UCard
      v-if="state.streamId"
      :ui="{
        body: 'sm:p-0',
      }"
    >
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Subject Assignments ({{ state.assignments.length }})
          </h3>

          <UButton
            variant="soft"
            color="primary"
            icon="prime:plus"
            label="Add Subject"
            class="w-full justify-center sm:w-auto"
            @click="add"
          />
        </div>
      </template>
      <div>
        <!-- Empty State -->
        <div
          v-if="!state.assignments.length"
          class="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg m-4 p-10 text-center"
        >
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            No subjects assigned yet.
          </p>
          <UButton icon="prime:plus" label="Add First Subject" @click="add" />
        </div>

        <template v-else>
          <!-- Desktop / tablet: table -->
          <div class="hidden md:block">
            <UTable :columns="columns" :loading="store.loading" :data="state.assignments">
              <!-- Subject -->
              <template #subjectId-cell="{ row }">
                <UFormField :name="`assignments.${row.index}.subjectId`">
                  <USelectMenu
                    value-key="value"
                    :items="availableSubjects(row.index)"
                    :loading="subjectStore.loading"
                    placeholder="Select Subject"
                    class="w-full"
                    v-model="row.original.subjectId"
                  />
                </UFormField>
              </template>

              <!-- Group -->
              <template #groupId-cell="{ row }">
                <UFormField :name="`assignments.${row.index}.groupId`">
                  <USelectMenu
                    value-key="value"
                    :loading="subjectGroupStore.loading"
                    :items="groups"
                    placeholder="Select Group"
                    class="w-full"
                    v-model="row.original.groupId"
                  />
                </UFormField>
              </template>

              <!-- Mandatory Badge -->
              <template #mandatory-cell="{ row }">
                <div class="flex">
                  <USwitch label="Mandatory" v-model="row.original.mandatory" />
                </div>
              </template>

              <!-- Actions -->
              <template #actions-cell="{ row }">
                <div class="flex justify-end">
                  <UButton
                    v-if="showDelete()"
                    @click="remove(row.index)"
                    variant="ghost"
                    color="error"
                    icon="lucide:trash-2"
                    :aria-label="`Remove subject ${row.index + 1}`"
                  />
                </div>
              </template>
            </UTable>
          </div>

          <!-- Mobile: stacked cards, one per assignment -->
          <div class="md:hidden divide-y divide-gray-200 dark:divide-gray-800">
            <div
              v-for="(assignment, index) in state.assignments"
              :key="index"
              class="p-4 space-y-3"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Subject {{ index + 1 }}
                </span>
                <UButton
                  v-if="showDelete()"
                  @click="remove(index)"
                  variant="ghost"
                  color="error"
                  icon="lucide:trash-2"
                  size="xs"
                  :aria-label="`Remove subject ${index + 1}`"
                />
              </div>

              <UFormField :name="`assignments.${index}.subjectId`" label="Subject">
                <USelectMenu
                  value-key="value"
                  :items="availableSubjects(index)"
                  :loading="subjectStore.loading"
                  placeholder="Select Subject"
                  class="w-full"
                  v-model="assignment.subjectId"
                />
              </UFormField>

              <UFormField :name="`assignments.${index}.groupId`" label="Group">
                <USelectMenu
                  value-key="value"
                  :loading="subjectGroupStore.loading"
                  :items="groups"
                  placeholder="Select Group"
                  class="w-full"
                  v-model="assignment.groupId"
                />
              </UFormField>

              <div
                class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900"
              >
                <span class="text-sm text-gray-600 dark:text-gray-300">Mandatory</span>
                <USwitch v-model="assignment.mandatory" />
              </div>
            </div>
          </div>
        </template>

        <!-- Summary -->
        <div
          v-if="state.assignments.length"
          class="flex flex-wrap items-center gap-x-4 gap-y-1 m-4 p-4 bg-gray-50 dark:bg-gray-950 rounded-lg text-sm text-gray-600 dark:text-gray-300"
        >
          <span
            >Total Subjects: <strong>{{ state.assignments.length }}</strong></span
          >
          <span
            >Core:
            <strong>{{
              state.assignments.filter((a) => a.mandatory).length
            }}</strong></span
          >
          <span
            >Optional:
            <strong>{{
              state.assignments.filter((a) => !a.mandatory).length
            }}</strong></span
          >
        </div>
      </div>
      <template #footer>
        <div class="flex flex-col gap-3 sm:flex-row">
          <UButton
            type="submit"
            color="primary"
            :icon="SAVE_ICON"
            label="Save Changes"
            :loading="saving"
            class="w-full justify-center sm:w-auto"
          />
          <UButton
            color="neutral"
            variant="outline"
            label="Cancel"
            @click="resetForm"
            class="w-full justify-center sm:w-auto"
          />
        </div>
      </template>
    </UCard>
    <UCard v-else>
      <div class="h-56 flex flex-col items-center justify-center gap-3 px-4 text-center">
        <div
          class="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800"
        >
          <UIcon :name="EMPTY_ICON" class="w-6 h-6 text-gray-400" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            No Stream Selected
          </p>
          <p class="text-xs text-gray-400">
            Choose a stream from the dropdown above to manage its subject assignments.
          </p>
        </div>
      </div>
    </UCard>
  </UForm>
</template>
<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import * as yup from "yup";

const store = useStreamSubjectStore();
const subjectStore = useSubjectStore();
const streamStore = useStreamStore();
const subjectGroupStore = useSubjectGroupStore();
const toast = useToast();

const saving = ref(false);

type StreamSubjectForm = {
  streamId: string;
  assignments: AssignmentSubject[];
};

const state = reactive<StreamSubjectForm>({
  streamId: "",
  assignments: [],
});

const schema = yup.object({
  streamId: yup.string().required("Stream is required"),
  assignments: yup.array().of(
    yup.object({
      subjectId: yup.string().required("Subject is required"),
      mandatory: yup.boolean().required(),
    })
  ),
});

const columns: TableColumn<any>[] = [
  { accessorKey: "subjectId", header: "Subject" },
  { accessorKey: "groupId", header: "Group" },
  {
    accessorKey: "mandatory",
    header: "Type",
  },
  { id: "actions" },
];

const streams = computed(() =>
  streamStore.records.map((e) => ({
    label: e.name,
    value: e.id,
  }))
);

const groups = ref<{ label: string; value: string }[]>([]);

const availableSubjects = (index: number) => {
  const selected = state.assignments
    .map((a, i) => (i !== index ? a.subjectId : null))
    .filter(Boolean);

  return subjectStore.records
    .filter((s) => !selected.includes(s.id))
    .map((s) => ({ label: s.name, value: s.id }));
};

const showDelete = () => state.assignments.length > 1;

function add() {
  state.assignments.push({
    subjectId: "",
    groupId: "",
    mandatory: false,
  });
}

function remove(index: number) {
  state.assignments.splice(index, 1);
}

function resetForm() {
  state.streamId = "";
  state.assignments = [];
  navigateTo("/subjects/stream-subjects");
}

async function fetchRecord() {
  if (!state.streamId) return;

  const list = await store.fetchAllByStream(state.streamId, 0, 0);

  if (list && list.length) {
    state.assignments = list.map((e: StreamSubject) => ({
      subjectId: e.subjectId,
      groupId: e.groupId,
      mandatory: e.mandatory,
    }));
  } else {
    state.assignments = [];
    add();
  }

  const groupRes = await subjectGroupStore.fetchAllByStream(state.streamId);

  if (groupRes) {
    groups.value = groupRes.map((e: SubjectGroup) => ({
      label: `${e.name} (${e.totalSelection})`,
      value: e.id,
    }));
  }
}

async function onSubmit() {
  try {
    saving.value = true;

    await store.create(state.streamId, {
      assignments: state.assignments,
    });

    toast.add({
      title: "Success",
      description: "Stream subjects assign successfully",
      color: "success",
    });

    navigateTo("/subjects/stream-subjects");
  } catch (err: any) {
    toast.add({
      description: err.message,
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  subjectStore.fetchAll(0, 0);
  streamStore.fetchAll(0, 0);
  useAppStore().setTitle("Assign Stream Subject");
  document.title = "Stream Subjects | Assign Stream Subject | Skultem";
});

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER],
});
</script>
