<template>
  <div class="space-y-3 px-4 md:px-6">
    <UCard>
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <GuideBar topic="admin-timetable" />
        <div class="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
          <USelectMenu data-guide="tt-class" v-model="grade" placeholder="Select Class" value-key="value" :items="list"
            :loading="classLoading" class="w-full md:w-72" />
          <div data-guide="tt-download">
            <TimetableDownload v-if="session && !onWeeklyPlan" :title="`${session.clazz} (${session.sectionName})`" />
          </div>
        </div>
      </div>
    </UCard>

    <div data-guide="tt-tabs">
      <TimetableSectionNav />
    </div>

    <UCard v-if="session && onWeeklyPlan">
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <UIcon name="i-lucide-calendar-range" class="mb-3 size-12 text-muted" />
        <h3 class="text-base font-semibold">{{ session.clazz }} follows a weekly plan</h3>
        <p class="mt-1 max-w-md text-sm text-muted">It is planned week by week, so it has no normal timetable. A class
          follows one or the other - change it in Timetable settings.</p>
        <div class="mt-4 flex flex-wrap justify-center gap-2">
          <UButton to="/timetable/weekly-plan" label="Open its weekly plan" icon="i-lucide-calendar-range" />
          <UButton to="/timetable/setting" label="Timetable settings" icon="i-lucide-settings" color="neutral" variant="soft" />
        </div>
      </div>
    </UCard>

    <div v-else-if="session">
      <UCard data-guide="tt-grid" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
              <UButton data-guide="tt-add-assembly" :loading="assemblyLoading" icon="i-lucide-users" color="neutral"
                variant="outline" class="w-full justify-center sm:w-auto" @click="addAssembly">
                Add Assembly
              </UButton>

              <UButton data-guide="tt-add-break" :loading="breakLoading" icon="i-lucide-coffee" color="neutral"
                variant="outline" class="w-full justify-center sm:w-auto" @click="addBreak">
                Add Break
              </UButton>

              <UButton data-guide="tt-add-lunch" :loading="lunchLoading" icon="i-lucide-coffee" color="neutral"
                variant="outline" class="w-full justify-center sm:w-auto" @click="addLunch">
                Add Lunch
              </UButton>

              <UButton data-guide="tt-add-period" :loading="addLoading" icon="i-lucide-plus"
                class="w-full justify-center sm:w-auto" @click="addPeriod">
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
// A class follows the normal timetable or a weekly plan, never both. The class picked is shared with the Weekly
// plan page; one on a weekly plan shows where to find it instead of a timetable.
const { types, load: loadTypes, loading: typesLoading, typeOfSession, selected } = useClassTimetableTypes();
const onWeeklyPlan = computed(() => !!grade.value && !!types.value && typeOfSession(grade.value) === "WEEKLY_PLAN");
const grade = ref("");

const addLoading = ref(false);
const breakLoading = ref(false);
const assemblyLoading = ref(false);
const lunchLoading = ref(false);

const session = computed(() => classStore.get(grade.value));

// The class picked before (here or on the Weekly plan page), else the first on the normal timetable.
function syncGrade(items: { value: string }[]) {
  if (!items.length || !types.value) return;

  if (items.some((item) => item.value === grade.value)) return;
  // Opening the page keeps the class picked before only if it's on the normal timetable (one on a weekly plan would
  // send you straight back to its plan).
  const kept = items.find((item) => item.value === selected.value && typeOfSession(item.value) === "PERIODS");
  grade.value = (kept ?? items.find((item) => typeOfSession(item.value) === "PERIODS") ?? items[0])!.value;
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

// Usually the first slot of the day - add it before the periods.
async function addAssembly() {
  if (!session.value?.id) return;

  assemblyLoading.value = true;
  try {
    await store.createAssembly({ session: session.value.id });
  } finally {
    assemblyLoading.value = false;
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
    selected.value = value;
    if (typeOfSession(value) === "WEEKLY_PLAN") {
      // A class on a weekly plan has no timetable: straight to its plan (the Weekly plan page opens on it).
      await navigateTo("/timetable/weekly-plan", { replace: true });
      return;
    }

    try {
      await Promise.all([
        store.getTimetable(value),
        store.getWorkingDays({ session: value }),
        teacherSubjectStore.allByClass(value)
      ]);
    } catch (error: any) {
      useNotify().error(error);
    }
  },
  { immediate: true }
);

watch([list, types], () => syncGrade(list.value), { immediate: true });

onMounted(async () => {
  document.title = "Timetable | Skultem";
  try {
    await Promise.all([
      classStore.fetchAll(0, 0),
      store.searchRoom(0, 0),
      loadTypes(true)
    ]);
  } catch (error: any) {
    useNotify().error(error);
  }
});
</script>
