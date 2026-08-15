<template>
  <div class="space-y-4 p-4 md:px-6">
    <Heading
      title="Class Timetables"
      subtitle="Configure and manage weekly timetables for classes and sections"
    >
      <div class="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
        <USelectMenu
          v-model="grade"
          placeholder="Select Class"
          value-key="value"
          :items="list"
          :loading="classLoading"
          class="w-full md:w-72"
        />
      </div>
    </Heading>
    <div v-if="session">
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
              >
                <UIcon name="i-lucide-calendar-days" class="size-5" />
              </div>

              <div class="min-w-0">
                <h2 class="truncate font-semibold text-base">
                  {{ session?.clazz }} · {{ session?.sectionName }}
                </h2>

                <p class="text-sm text-muted">
                  {{ periods.length }} periods · {{ store.getDayRange }}
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
              <UButton
                :loading="breakLoading"
                icon="i-lucide-coffee"
                color="neutral"
                variant="outline"
                class="w-full justify-center sm:w-auto"
                @click="addBreak"
              >
                Add Break
              </UButton>

              <UButton
                :loading="lunchLoading"
                icon="i-lucide-coffee"
                color="neutral"
                variant="outline"
                class="w-full justify-center sm:w-auto"
                @click="addLunch"
              >
                Add Lunch
              </UButton>

              <UButton
                :loading="addLoading"
                icon="i-lucide-plus"
                class="w-full justify-center sm:w-auto"
                @click="addPeriod"
              >
                Add Period
              </UButton>
            </div>
          </div>
        </template>

        <TimetablePeriod is-admin />
      </UCard>
    </div>

    <UCard v-else>
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <UIcon name="i-lucide-school" class="mb-3 size-12 text-muted" />

        <h3 class="text-base font-semibold">Select a class to continue</h3>

        <p class="mt-1 text-sm text-muted">
          Choose a class from the dropdown to view or create its timetable.
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const store = useTimetableStore();
const classStore = useClassSessionStore();
const teacherSubjectStore = useTeacherSubjectStore();

const { periods } = storeToRefs(store);
const { list, loading: classLoading } = storeToRefs(classStore);
const grade = ref("");

const addLoading = ref(false);
const breakLoading = ref(false);
const lunchLoading = ref(false);

const session = computed(() => classStore.get(grade.value));

function syncGrade(items: { value: string }[]) {
  if (!items.length) return;

  const exists = items.some((item) => item.value === grade.value);
  if (!exists) {
    grade.value = items[0].value;
  }
}

async function addPeriod() {
  if (!session.value?.id) return;

  addLoading.value = true;
  try {
    await store.createPeriod({ session: session.value.id });
  } finally {
    addLoading.value = false;
  }
}

async function addBreak() {
  if (!session.value?.id) return;

  breakLoading.value = true;
  try {
    await store.createBreak({ session: session.value.id });
  } finally {
    breakLoading.value = false;
  }
}

async function addLunch() {
  if (!session.value?.id) return;

  lunchLoading.value = true;
  try {
    await store.createLunch({ session: session.value.id });
  } finally {
    lunchLoading.value = false;
  }
}

watch(
  () => grade.value,
  async (value) => {
    if (!value) return;

    try {
      await store.getTimetable(value);
      await teacherSubjectStore.allByClass(value);
    } catch (error: any) {
      useNotify().error(error);
    }
  },
  { immediate: true }
);

watch(list, syncGrade, { immediate: true });

onMounted(async () => {
  document.title = "Timetable | Skultem";
  try {
    await classStore.fetchAll(0, 0);
    await store.getWorkingDays();
    await store.searchRoom(0, 0);
  } catch (error: any) {
    useNotify().error(error);
  }
});
</script>
