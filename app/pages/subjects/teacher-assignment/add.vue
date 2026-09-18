<template>
  <UForm class="px-4 md:px-6 space-y-4" :state="state" :schema="schema" @submit="onSubmit">
    <Heading title="Assign Class Subjects to Teacher" subtitle="Define the curriculum structure for this class.">
      <USelectMenu value-key="value" :loading="classStore.loading" v-model="state.classId" @change="fetchRecord"
        :items="classes" placeholder="Choose a class" class="w-56" />
    </Heading>
    <UCard v-if="state.classId" :ui="{
      body: 'sm:p-0',
      header: 'p-0 sm:p-0'
    }">
      <template #header>
        <div>
          <!-- Section Header -->
          <div class="flex border-b border-default p-3 items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Subject Assignments ({{ state.assignments.length }})
            </h3>
          </div>

          <!-- Class Master bulk-assign -->
          <div v-if="state.assignments.length"
            class="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div v-if="classMasters.length" class="flex flex-wrap items-center gap-2 text-sm">
              <span class="text-gray-500">Class Master{{ classMasters.length > 1 ? 's' : '' }}:</span>
              <UBadge v-for="master in classMasters" :key="master.id" variant="subtle" color="neutral"
                :label="teacherName(master)" />
            </div>
            <p v-else class="text-sm text-gray-400">No class master assigned to this class yet.</p>

            <div v-if="classMasters.length" class="flex items-center gap-2">
              <USelectMenu v-if="classMasters.length > 1" v-model="selectedMasterIds" multiple value-key="value"
                :items="masterOptions" class="w-56" />
              <UButton icon="lucide:wand-2" variant="soft" color="primary" label="Assign to All Subjects"
                :disabled="!selectedMasterIds.length" @click="assignMasterToAll" />
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!state.assignments.length"
            class="border border-dashed border-gray-300 rounded-lg p-10 text-center">
            <p class="text-sm text-gray-500 mb-4">No subjects assigned yet.</p>
          </div>
        </div>
      </template>



      <!-- Desktop / tablet: table -->
      <div class="hidden md:block">
        <UTable :columns="columns" :loading="store.loading" :data="state.assignments">
          <!-- Subject -->
          <template #subjectId-cell="{ row }">
            <UFormField :name="`assignments.${row.index}.subjectId`">
              <USelectMenu value-key="value" disabled :items="subjects" :loading="subjectStore.loading"
                placeholder="Select Subject" class="w-full" v-model="row.original.subjectId" />
            </UFormField>
          </template>
          <!-- Teacher(s) -->
          <template #teacherIds-cell="{ row }">
            <UFormField :name="`assignments.${row.index}.teacherIds`">
              <USelectMenu value-key="value" multiple :loading="teacherStore.loading" :items="teachers"
                placeholder="Select one or more teachers" class="w-full" v-model="row.original.teacherIds" />
            </UFormField>
          </template>
        </UTable>
      </div>

      <!-- Mobile: stacked cards, one per assignment -->
      <div v-if="state.assignments.length" class="divide-y md:hidden divide-gray-200 dark:divide-gray-800">
        <div v-for="(assignment, index) in state.assignments" :key="assignment.subjectId" class="p-4 space-y-3">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Subject {{ index + 1 }}
            </span>
          </div>
          <div>
            <UFormField :name="`assignments.${index}.subjectId`" label="Subject">
              <USelectMenu value-key="value" disabled :items="subjects" :loading="subjectStore.loading"
                placeholder="Select Subject" class="w-full" v-model="assignment.subjectId" />
            </UFormField>
          </div>
          <div>
            <UFormField :name="`assignments.${index}.teacherIds`" label="Teacher(s)">
              <USelectMenu value-key="value" multiple :loading="teacherStore.loading" :items="teachers"
                placeholder="Select one or more teachers" class="w-full" v-model="assignment.teacherIds" />
            </UFormField>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col gap-3 sm:flex-row">
          <UButton type="submit" color="primary" icon="lucide:save" label="Save Changes" :loading="saving"
            class="w-full justify-center sm:w-auto" />
          <UButton color="neutral" variant="outline" label="Cancel" @click="resetForm"
            class="w-full justify-center sm:w-auto" />
        </div>
      </template>
    </UCard>
    <UCard v-else>
      <div class="h-56 flex flex-col items-center justify-center gap-3 px-4 text-center">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800">
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
const classMasterStore = useClassStore();
const teacherStore = useTeacherStore();
const toast = useToast();

const saving = ref(false);

type ClassMasterInfo = {
  id: string;
  teacher: {
    id: string;
    user: { givenNames: string; familyName: string };
  };
};

const classMasters = ref<ClassMasterInfo[]>([]);
// Defaults to every class master selected - "any of them can teach/grade" means the common case
// is applying all of them in one click, not picking a subset.
const selectedMasterIds = ref<string[]>([]);

function teacherName(master: ClassMasterInfo) {
  return `${master.teacher.user.givenNames} ${master.teacher.user.familyName}`;
}

const masterOptions = computed(() =>
  classMasters.value.map((m) => ({
    label: teacherName(m),
    value: m.teacher.id,
  }))
);

// Some classes are self-contained (one class master teaches every subject) - this fills every
// subject with the selected master(s) in one click instead of picking the same teacher 15 times.
// A co-taught class (more than one active master) can assign several of them to every subject at
// once, since any of them can teach/grade it - existing per-pairing ids are preserved via
// existingAssignmentIds so this doesn't churn rows that are already correct.
function assignMasterToAll() {
  if (!selectedMasterIds.value.length) return;

  state.assignments.forEach((row) => {
    row.teacherIds = [...selectedMasterIds.value];
  });
}

type AssignmentRow = {
  subjectId: string;
  teacherIds: string[];
};

type ClassSubjectForm = {
  classId: string;
  assignments: AssignmentRow[];
};

const state = reactive<ClassSubjectForm>({
  classId: "",
  assignments: [],
});

// Tracks the real TeacherSubject id behind each (subject, teacher) pairing that already existed
// on load, keyed by `${subjectId}::${teacherId}`. A pairing kept selected on submit reuses its id
// (an in-place update); a newly-added pairing has none (created fresh); a pairing that's no
// longer selected is simply left out of the submit payload (removed).
const existingAssignmentIds = ref<Record<string, string>>({});

function assignmentKey(subjectId: string, teacherId: string) {
  return `${subjectId}::${teacherId}`;
}

const schema = yup.object({
  classId: yup.string().required("Class is required"),
  assignments: yup.array().of(
    yup.object({
      subjectId: yup.string().required("Subject is required"),
      teacherIds: yup.array().min(1, "At least one teacher is required"),
    })
  ),
});

const columns: TableColumn<any>[] = [
  { accessorKey: "subjectId", header: "Subject" },
  { accessorKey: "teacherIds", header: "Teacher(s)" },
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
  classMasters.value = [];
  selectedMasterIds.value = [];
  existingAssignmentIds.value = {};
  navigateTo("/subjects/teacher-assignment");
}

async function fetchRecord() {
  if (!state.classId) return;
  state.assignments = [];
  classMasters.value = [];
  selectedMasterIds.value = [];
  existingAssignmentIds.value = {};

  const [list, masters] = await Promise.all([
    store.fetchAllByClass(state.classId, 0, 0),
    classMasterStore.findClassMastersBySession(state.classId),
  ]);

  if (list && list.length) {
    // The backend returns one row per subject (a placeholder with no teacher) or one row per
    // (subject, teacher) pairing when the subject already has one or more teachers assigned -
    // group those pairings back into one form row per subject with a list of teacher ids.
    const bySubject = new Map<string, AssignmentRow>();

    for (const e of list as TeacherSubject[]) {
      if (!bySubject.has(e.subjectId)) {
        bySubject.set(e.subjectId, { subjectId: e.subjectId, teacherIds: [] });
      }

      if (e.teacherId) {
        bySubject.get(e.subjectId)!.teacherIds.push(e.teacherId);
        existingAssignmentIds.value[assignmentKey(e.subjectId, e.teacherId)] = e.id;
      }
    }

    state.assignments = Array.from(bySubject.values());
  }

  if (masters && masters.length) {
    classMasters.value = masters;
    selectedMasterIds.value = masters.map((m: ClassMasterInfo) => m.teacher.id);
  }
}

async function onSubmit() {
  try {
    saving.value = true;

    const assignments = state.assignments.flatMap((row) =>
      row.teacherIds.map((teacherId) => ({
        id: existingAssignmentIds.value[assignmentKey(row.subjectId, teacherId)] ?? null,
        teacherId,
        subjectId: row.subjectId,
      }))
    );

    await store.create(state.classId, { assignments });

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
  useAppStore().setTitle("Subjects");
  document.title = "Teacher Subject | Assign Teacher Subject | Skultem";
});

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER],
});
</script>
