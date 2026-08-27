<template>
  <UForm class="p-4 sm:p-6 space-y-4" :state="state" :schema="schema" @submit="onSubmit">
    <Heading
      title="Assign Class Subjects to Teacher"
      subtitle="Define the curriculum structure for this class."
    >
      <UFormField class="w-full md:w-auto md:min-w-sm" name="classId">
        <USelectMenu
          value-key="value"
          :loading="classStore.loading"
          v-model="state.classId"
          @change="fetchRecord"
          :items="classes"
          placeholder="Choose a class"
          class="w-full"
        />
      </UFormField>
    </Heading>
    <UCard
      v-if="state.classId"
      :ui="{
        body: 'sm:p-0',
      }"
    >
      <template #header>
        <div>
          <!-- Section Header -->
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Subject Assignments ({{ state.assignments.length }})
            </h3>
          </div>

          <!-- Empty State -->
          <div
            v-if="!state.assignments.length"
            class="border border-dashed border-gray-300 rounded-lg p-10 text-center"
          >
            <p class="text-sm text-gray-500 mb-4">No subjects assigned yet.</p>
          </div>
        </div>
      </template>



      <!-- Desktop / tablet: table -->
      <div  class="hidden md:block">
        <UTable :columns="columns" :loading="store.loading" :data="state.assignments">
          <!-- Subject -->
          <template #subjectId-cell="{ row }">
            <UFormField :name="`assignments.${row.index}.subjectId`">
              <USelectMenu
                value-key="value"
                disabled
                :items="subjects"
                :loading="subjectStore.loading"
                placeholder="Select Subject"
                class="w-full"
                v-model="row.original.subjectId"
              />
            </UFormField>
          </template>
          <!-- Teacher -->
          <template #teacherId-cell="{ row }">
            <UFormField :name="`assignments.${row.index}.teacherId`">
              <USelectMenu
                value-key="value"
                :loading="teacherStore.loading"
                :items="teachers"
                placeholder="Select Teacher"
                class="w-full"
                v-model="row.original.teacherId"
              />
            </UFormField>
          </template>
        </UTable>
      </div>

      <!-- Mobile: stacked cards, one per assignment -->
      <div
        v-if="state.assignments.length"
        class="divide-y md:hidden divide-gray-200 dark:divide-gray-800"
      >
        <div
          v-for="(assignment, index) in state.assignments"
          :key="assignment.id ?? index"
          class="p-4 space-y-3"
        >
          <div>
            <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Subject {{ index + 1 }}
            </span>
          </div>
          <div>
            <UFormField :name="`assignments.${index}.subjectId`" label="Subject">
              <USelectMenu
                value-key="value"
                disabled
                :items="subjects"
                :loading="subjectStore.loading"
                placeholder="Select Subject"
                class="w-full"
                v-model="assignment.subjectId"
              />
            </UFormField>
          </div>
          <div>
            <UFormField :name="`assignments.${index}.teacherId`" label="Teacher">
              <USelectMenu
                value-key="value"
                :loading="teacherStore.loading"
                :items="teachers"
                placeholder="Select Teacher"
                class="w-full"
                v-model="assignment.teacherId"
              />
            </UFormField>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col gap-3 sm:flex-row">
          <UButton
            type="submit"
            color="primary"
            icon="lucide:save"
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
          <UIcon name="lucide:layout-list" class="w-6 h-6 text-gray-400" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            No Class Selected
          </p>
          <p class="text-xs text-gray-400">
            Choose a class from the dropdown above to manage its teacher assignments.
          </p>
        </div>
      </div>
    </UCard>
  </UForm>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import * as yup from "yup";

const view = ref<'table' | 'card'>('table');
const store = useTeacherSubjectStore();
const subjectStore = useSubjectStore();
const classStore = useClassSessionStore();
const teacherStore = useTeacherStore();
const toast = useToast();

const saving = ref(false);

type ClassSubjectForm = {
  classId: string;
  assignments: AssignmentTeacherSubject[];
};

const state = reactive<ClassSubjectForm>({
  classId: "",
  assignments: [],
});

const schema = yup.object({
  classId: yup.string().required("Class is required"),
  assignments: yup.array().of(
    yup.object({
      subjectId: yup.string().required("Subject is required"),
      teacherId: yup.string().required("Teacher is required"),
    })
  ),
});

const columns: TableColumn<any>[] = [
  { accessorKey: "subjectId", header: "Subject" },
  { accessorKey: "teacherId", header: "Teacher" },
];

const classes = computed(() =>
  classStore.records.map((e) => ({
    label: parseClassSession(e),
    value: e.id,
  }))
);

const teachers = computed(() =>
  teacherStore.records.map((e) => ({
    label: `${e.user.givenNames} ${e.user.familyName}`,
    value: e.id,
  }))
);

const subjects = computed(() =>
  subjectStore.records.map((e) => ({
    label: e.name,
    value: e.id,
  }))
);

function resetForm() {
  state.classId = "";
  state.assignments = [];
  navigateTo("/subjects/teacher-assignment");
}

async function fetchRecord() {
  if (!state.classId) return;
  state.assignments = [];
  const list = await store.fetchAllByClass(state.classId, 0, 0);

  if (list && list.length) {
    state.assignments = list.map((e: TeacherSubject) => ({
      id: e.id,
      subjectId: e.subjectId,
      teacherId: e.teacherId,
    }));
  }
}

async function onSubmit() {
  try {
    saving.value = true;

    await store.create(state.classId, {
      assignments: state.assignments,
    });

    toast.add({
      title: "Success",
      description: "Teacher subjects assign successfully",
      color: "success",
    });

    navigateTo("/subjects/teacher-assignment");
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
  classStore.fetchAll(0, 0);
  teacherStore.fetchAll(0, 0);
  useAppStore().setTitle("Assign Teacher Subject");
  document.title = "Teacher Subject | Assign Teacher Subject | Skultem";
});

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER],
});
</script>
