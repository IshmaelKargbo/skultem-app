<template>
  <USlideover
    :open="open"
    side="left"
    :ui="{
      body: 'p-0',
      content:
        'w-full max-w-sm   border-r border-gray-200 dark:border-gray-800',
    }"
    @update:open="open = $event"
  >
    <!-- Trigger -->
    <UButton
      class="md:hidden"
      color="neutral"
      variant="link"
      icon="lucide:menu"
      :aria-expanded="open"
      aria-controls="account-menu-panel"
      aria-label="Open account menu"
      @click="open = true"
    />

    <template #header>
      <div class="w-full">
        <div class="flex items-center justify-between gap-3">
          <div class="relative shrink-0">
            <UAvatar :alt="name" size="lg" class="ring-2 ring-white dark:ring-gray-900" />
            <span
              class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-950 bg-emerald-500"
              aria-hidden="true"
            />
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {{ name }}
            </h3>
            <p class="truncate text-xs text-gray-500 dark:text-gray-400">
              {{ user?.email }}
            </p>
          </div>

          <UButton
            icon="lucide:x"
            variant="ghost"
            color="gray"
            size="xs"
            class="rounded-xl"
            aria-label="Close account menu"
            @click="open = false"
          />
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <div
        id="account-menu-panel"
        class="flex h-full flex-col overflow-y-auto px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
      >
        <!-- ROLE SWITCHER -->
        <div v-if="userRoles.length" class="pt-2">
          <div class="space-y-2 pb-5">
            <div class="mb-3 flex items-center justify-between">
              <p
                id="role-switch-label"
                class="text-xs font-semibold uppercase tracking-wider text-gray-400"
              >
                Switch Role
              </p>
              <div
                class="rounded-full border border-gray-200 dark:border-white/10 px-2 py-1 text-[10px] text-gray-500 dark:text-gray-400"
              >
                {{ userRoles.length }} roles
              </div>
            </div>

            <div role="radiogroup" aria-labelledby="role-switch-label" class="space-y-2">
              <button
                v-for="role in userRoles"
                :key="role.value"
                type="button"
                role="radio"
                :aria-checked="role.value === activeRole"
                class="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border p-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                :class="
                  role.value === activeRole
                    ? 'border-primary-500/30 bg-primary-50 dark:border-primary-500/20 dark:bg-primary-500/10'
                    : 'border-gray-200/70 dark:border-white/5 bg-gray-100 dark:bg-white/5 hover:border-primary-500/20 hover:bg-white dark:hover:bg-white/10'
                "
                @click="switchRole(role.value)"
              >
                <div
                  v-if="role.value === activeRole"
                  class="absolute inset-y-0 left-0 w-1 rounded-r-full bg-primary"
                  aria-hidden="true"
                />

                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all"
                  :class="
                    role.value === activeRole
                      ? 'bg-primary text-white shadow-lg shadow-primary-500/20'
                      : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5'
                  "
                >
                  <UIcon :name="role.icon" class="text-base" aria-hidden="true" />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {{ role.label }}
                  </p>
                  <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                    {{ role.desc }}
                  </p>
                </div>

                <Transition
                  enter-active-class="transition duration-200"
                  enter-from-class="scale-75 opacity-0"
                  enter-to-class="scale-100 opacity-100"
                >
                  <div
                    v-if="role.value === activeRole"
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white"
                  >
                    <UIcon name="lucide:check" class="size-3.5" aria-hidden="true" />
                  </div>
                </Transition>
              </button>
            </div>
          </div>
        </div>

        <!-- APPEARANCE -->
        <div class="border-t border-gray-200/60 dark:border-white/10 pt-4 mt-3">
          <div class="mb-3 px-1">
            <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
              Appearance
            </p>
          </div>

          <div
            class="flex items-center justify-between rounded-2xl border border-gray-200/70 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-4 py-3"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 dark:bg-primary-500/15"
              >
                <UIcon
                  :name="colorMode.value === 'dark' ? 'lucide:moon' : 'lucide:sun'"
                  class="text-primary text-lg"
                  aria-hidden="true"
                />
              </div>
              <div>
                <label
                  for="theme-toggle"
                  class="text-sm font-semibold text-gray-900 dark:text-white"
                  >Theme</label
                >
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ colorMode.value === "dark" ? "Dark mode" : "Light mode" }}
                </p>
              </div>
            </div>

            <USwitch
              id="theme-toggle"
              :model-value="colorMode.value === 'dark'"
              aria-label="Toggle dark mode"
              @update:model-value="colorMode.preference = $event ? 'dark' : 'light'"
            />
          </div>
        </div>

        <!-- QUICK LINKS -->
        <nav
          v-if="quickLinks.length"
          aria-label="Quick links"
          class="mt-3 space-y-3 rounded-3xl border border-gray-200/80 bg-white/80 p-3 dark:border-white/10 dark:bg-white/[0.03]"
        >
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-4 rounded-2xl border border-transparent bg-gray-100 px-4 py-4 text-gray-700 transition hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-primary-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:bg-white/5 dark:text-gray-200 dark:hover:border-primary-500/30 dark:hover:bg-primary-500/10"
            :class="
              link.to === activeQuickLinkTo
                ? 'border-primary-500/20 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-200'
                : ''
            "
            :aria-current="link.to === activeQuickLinkTo ? 'page' : undefined"
            @click="close"
          >
            <UIcon :name="link.icon" class="size-6 shrink-0" aria-hidden="true" />
            <span class="text-[16px] font-medium">{{ link.label }}</span>
          </NuxtLink>
        </nav>

        <!-- ACCORDIONS -->
        <div class="my-2">
          <div
            v-for="section in sections"
            :key="section.id"
            class="mt-3 rounded-3xl border border-gray-200/80 bg-white/80 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-3xl px-5 py-[1.125rem] text-gray-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              :aria-expanded="expanded.includes(section.id)"
              :aria-controls="`section-panel-${section.id}`"
              @click="toggleSection(section.id)"
            >
              <span class="flex items-center gap-4">
                <UIcon
                  :name="section.icon"
                  class="size-6 text-gray-700 dark:text-gray-300"
                  aria-hidden="true"
                />
                <span class="text-[16px] font-medium">{{ section.title }}</span>
              </span>
              <UIcon
                name="lucide:chevron-down"
                class="size-5 text-gray-500 dark:text-gray-400 transition-transform duration-200"
                :class="expanded.includes(section.id) ? 'rotate-180' : ''"
                aria-hidden="true"
              />
            </button>

            <div
              v-show="expanded.includes(section.id)"
              :id="`section-panel-${section.id}`"
              class="px-5 pb-5 space-y-2"
            >
              <NuxtLink
                v-for="item in section.linkItems"
                :key="item.label"
                :to="item.to"
                :aria-current="item.to === activeItemTo(section) ? 'page' : undefined"
                class="group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out ring-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                :class="
                  item.to === activeItemTo(section)
                    ? [
                        // Light mode
                        'bg-primary-100 text-primary-700 ring-primary-200 shadow-sm',

                        // Dark mode
                        'dark:bg-primary-500/20 dark:text-primary-300 dark:ring-primary-500/40 dark:shadow-primary-500/10',
                      ]
                    : [
                        // Light mode
                        'bg-gray-100 text-gray-700 ring-gray-200 hover:bg-primary-50 hover:text-primary-600 hover:ring-primary-300',

                        // Dark mode
                        'dark:bg-white/5 dark:text-gray-300 dark:ring-white/10 dark:hover:bg-primary-500/10 dark:hover:text-primary-200 dark:hover:ring-primary-500/30',
                      ]
                "
                @click="close"
              >
                <UIcon
                  :name="item.icon"
                  class="size-5 shrink-0 text-current transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                />

                <span class="font-medium">
                  {{ item.label }}
                </span>

                <UIcon
                  v-if="item.to === activeItemTo(section)"
                  name="lucide:chevron-right"
                  class="ml-auto size-4 text-current opacity-80"
                />
              </NuxtLink>
              <button
                v-for="item in section.actionItems"
                :key="item.label"
                type="button"
                class="flex w-full items-center gap-3 rounded-2xl ring ring-transparent bg-gray-100 px-4 py-3.5 text-left text-gray-700 transition hover:border-primary-500/30 hover:bg-primary-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:bg-white/5 dark:text-gray-200 dark:hover:border-primary-500/30 dark:hover:bg-primary-500/10"
                @click="item.action?.()"
              >
                <UIcon :name="item.icon" class="size-5 shrink-0" aria-hidden="true" />
                <span class="font-medium">{{ item.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="w-full px-4 pb-4">
        <UButton to="/logout" color="error" class="flex w-full justify-center">
          Log out
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
interface QuickLink {
  label: string;
  to: string;
  icon: string;
  roles: Role[];
}

interface SectionItem {
  label: string;
  icon: string;
  to?: string;
  action?: () => void;
}

interface RawSection {
  id: string;
  title: string;
  icon: string;
  roles: Role[];
  items: (SectionItem | false)[];
}

interface Section {
  id: string;
  title: string;
  icon: string;
  linkItems: (SectionItem & { to: string })[];
  actionItems: (SectionItem & { action: () => void })[];
}

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const { activeRole, can, setActiveRole } = useAuth();
const { canInstall, install } = usePwaInstall();

const route = useRoute();
const open = ref(false);
const expanded = ref<string[]>(["grades"]);
const colorMode = useColorMode();

// --- Active-path matching -------------------------------------------------
// A single item is "active" if the current route equals it exactly, or is a
// descendant of it (route starts with `${to}/`). When several items in the
// same list satisfy that (e.g. "/classes" and "/classes/sections" both match
// "/classes/sections/edit/1"), only the most specific (longest `to`) one
// should actually be highlighted — otherwise multiple links light up at once.
function matchesRoute(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`);
}

function mostSpecificMatch(items: { to: string }[]): string | undefined {
  const candidates = items.filter((i) => matchesRoute(i.to));
  if (!candidates.length) return undefined;
  return candidates.reduce((a, b) => (b.to.length > a.to.length ? b : a)).to;
}

function activeItemTo(section: Section) {
  return mostSpecificMatch(section.linkItems);
}

const activeQuickLinkTo = computed(() => mostSpecificMatch(quickLinks.value));
// ---------------------------------------------------------------------------

const name = computed(() =>
  user.value ? `${user.value.givenNames} ${user.value.familyName}` : ""
);

const roleDesc: Record<string, string> = {
  PROPRIETOR: "School owner & oversight",
  ADMIN: "Full system access",
  TEACHER: "Classes & students",
  PARENT: "Child progress",
  ACCOUNTANT: "Finance & fees",
};

const roleIcons: Record<string, string> = {
  PROPRIETOR: "lucide:crown",
  ADMIN: "lucide:shield-check",
  TEACHER: "lucide:graduation-cap",
  PARENT: "lucide:users",
  ACCOUNTANT: "lucide:calculator",
};

const userRoles = computed(() =>
  (user.value?.roles ?? []).map((role: string) => ({
    value: role,
    label: clean(role),
    desc: roleDesc[role] ?? "Access level",
    icon: roleIcons[role] ?? "lucide:user",
  }))
);

// Quick-access row above the accordions.
const allQuickLinks: QuickLink[] = [
  {
    label: "Attendance",
    to: "/attendance",
    icon: ATTENDANCE_ICON,
    roles: [Role.PROPRIETOR, Role.ADMIN, Role.OWNER, Role.TEACHER, Role.PARENT],
  },
  {
    label: "Parents",
    to: "/parents",
    icon: PARENT_ICON,
    roles: [Role.PROPRIETOR, Role.ADMIN, Role.ACCOUNTANT],
  },
  {
    label: "Teachers",
    to: "/teachers",
    icon: TEACHER_ICON,
    roles: [Role.PROPRIETOR, Role.ADMIN, Role.OWNER],
  }, {
    label: "Classes",
    to: "/classes",
    icon: CLASS_ICON,
    roles: [Role.ACCOUNTANT, ],
  },
  {
    label: "Subjects",
    to: "/subjects",
    icon: CURRICULUM_SUBJECT_ICON,
    roles: [Role.TEACHER, ],
  },
  {
    label: "Students",
    to: "/students",
    icon: STUDENT_ICON,
    roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT],
  },
  { label: "Grades", to: "/grades", icon: GRADES_ICON, roles: [Role.PARENT] },
  {
    label: "Notifications", to: "/communicate/notifications", icon: BELL_ICON,
    roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.ACCOUNTANT]
  },
  { label: "Fees", to: "/fees", icon: PAYMENT_ICON, roles: [Role.PARENT] },
];

const quickLinks = computed(() => allQuickLinks.filter((link) => can(link.roles)));

// Each raw section declares the roles that can see it AND its items, in one
// place. Visibility is then *derived* — a section only renders if it has at
// least one item left after filtering — instead of being a second, hand-kept
// `visible` flag that can drift out of sync with the item-level `can()`
// checks (previously possible to end up with an expandable section with a
// chevron and no content underneath).
const rawSections: (roles: (r: Role[]) => boolean) => RawSection[] = () => [
  {
    id: "general",
    title: "General",
    icon: "lucide:settings-2",
    roles: [],
    items: [
      can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]) && {
        label: "Settings",
        icon: "lucide:settings-2",
        to: "/settings/school",
      },
      { label: "Notifications", icon: BELL_ICON, to: "/communicate/notifications" },
      canInstall.value && {
        label: "Install App",
        icon: "lucide:download",
        action: installApp,
      },
    ],
  },
  {
    id: "grades",
    title: "Grades",
    icon: GRADES_ICON,
    roles: [Role.PROPRIETOR, Role.ADMIN, Role.TEACHER, Role.OWNER],
    items: [
      { label: "Grade Approval", icon: GRADES_APPROVAL_ICON, to: "/grades/approval" },
      { label: "Grade Assignment", icon: "lucide:clipboard-check", to: "/grades" },
    ],
  },
  {
    id: "subjects",
    title: "Subjects",
    icon: CURRICULUM_SUBJECT_ICON,
    roles: [Role.PROPRIETOR, Role.ADMIN, Role.OWNER],
    items: [
      { label: "Subjects", icon: CURRICULUM_SUBJECT_ICON, to: "/subjects" },
      {
        label: "Teacher Assignment",
        icon: CLIPBOARD_ADD_ICON,
        to: "/subjects/teacher-assignment",
      },
      {
        label: "Subject Groups",
        icon: CURRICULUM_GROUP_ICON,
        to: "/subjects/subject-groups",
      },
      { label: "Class Subjects", icon: BOOK_OPEN_ICON, to: "/subjects/class-subjects" },
      {
        label: "Streams Subjects",
        icon: CURRICULUM_STREAM_ICON,
        to: "/subjects/stream-subjects",
      },
    ],
  },
  {
    id: "classes",
    title: "Classes",
    icon: CLASS_ICON,
    roles: [Role.PROPRIETOR, Role.ADMIN, Role.OWNER],
    items: [
      { label: "Classes", icon: CLASS_ICON, to: "/classes" },
      { label: "Sections", icon: LAYERS_ICON, to: "/classes/sections" },
      { label: "Streams", icon: CURRICULUM_STREAM_ICON, to: "/classes/streams" },
    ],
  },
  {
    id: "behaviours",
    title: "Behaviours",
    icon: BEHAVIOUR_ICON,
    roles: [Role.PROPRIETOR, Role.ADMIN, Role.TEACHER, Role.OWNER],
    items: [
      { label: "Behaviours", icon: BEHAVIOUR_ICON, to: "/behaviours" },
      { label: "Category", icon: CATEGORY_ICON, to: "/behaviours/category" },
    ],
  },
  {
    id: "timetable",
    title: "Timetable",
    icon: TIMETABLE_ICON,
    roles: [Role.PROPRIETOR, Role.ADMIN, Role.TEACHER, Role.OWNER],
    items: [
      { label: "Timetable", icon: TIMETABLE_ICON, to: "/timetable" },
      { label: "Settings", icon: TIMETABLE_SETTINGS_ICON, to: "/timetable/setting" },
    ],
  },
  {
    id: "library",
    title: "Library",
    icon: LIBRARY_ICON,
    roles: [Role.PROPRIETOR, Role.ADMIN, Role.OWNER],
    items: [
      { label: "Library Dashboard", icon: LIBRARY_ICON, to: "/library" },
      { label: "Issue/Return Book", icon: ISSUE_BOOK_ICON, to: "/library/issue" },
      { label: "Manage Books", icon: BOOK_ICON, to: "/library/books" },
      { label: "Book Categories", icon: BOOK_CATEGORY_ICON, to: "/library/categories" },
    ],
  },
  {
    id: "communicate",
    title: "Communicate",
    icon: COMMUNICATE_ICON,
    roles: [Role.PROPRIETOR, Role.ADMIN, Role.OWNER, Role.TEACHER],
    items: [
      { label: "Notice Board", icon: NOTICE_ICON, to: "/communicate" },
      { label: "Events & Holidays", icon: EVENT_ICON, to: "/communicate/events" },
      { label: "Compose Broadcast", icon: BROADCAST_ICON, to: "/communicate/broadcast" },
      { label: "Broadcast History", icon: BROADCAST_HISTORY_ICON, to: "/communicate/broadcast/history" },
    ],
  },
  {
    id: "expenses",
    title: "Expenses",
    icon: EXPENSES_ICON,
    roles: [Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER],
    items: [
      { label: "Expenses", icon: EXPENSES_ICON, to: "/expenses" },
      { label: "Expense Category", icon: CATEGORY_ICON, to: "/expenses/category" },
    ],
  },
  {
    id: "transactions",
    title: "Transactions",
    icon: TRANSACTION_ICON,
    roles: [Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER],
    items: [
      { label: "Transactions", icon: TRANSACTION_ICON, to: "/transactions" },
      {
        label: "Student Ledger",
        icon: TRANSACTION_ICON,
        to: "/transactions/student-ledger",
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    icon: REPORT_ICON,
    roles: [Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER],
    items: [
      can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER]) && {
        label: "Reports",
        icon: REPORT_ICON,
        to: "/analytics",
      },
      {
        label: "Financial Reports",
        icon: SCHEME_ICON,
        to: "/analytics/financial-reports",
      },
    ],
  },
  {
    id: "academics",
    title: "Academics",
    icon: CALANDA_ICON,
    roles: [Role.PROPRIETOR, Role.ADMIN, Role.OWNER],
    items: [
      { label: "Academics", icon: CALANDA_ICON, to: "/academics" },
      { label: "Term Settings", icon: TERM_ICON, to: "/academics/terms" },
      { label: "Template", icon: TEMPLATE_ICON, to: "/academics/assessment-templates" },
      { label: "Academic Cycle", icon: CYCLE_ICON, to: "/academics/assessment-cycle" },
      { label: "Grade Scale", icon: GRADE_ICON, to: "/academics/grade-scale" },
      { label: "Promotions", icon: PROMOTE_STUDENTS_ICON, to: "/academics/promotions" },
    ],
  },
  {
    id: "authorization",
    title: "Authorization",
    icon: USERS_ICON,
    roles: [Role.PROPRIETOR, Role.ADMIN, Role.OWNER],
    items: [
      can([Role.PROPRIETOR, Role.OWNER]) && {
        label: "Users",
        icon: USERS_ICON,
        to: "/auth",
      },
      { label: "Audits", icon: AUDIT_ICON, to: "/auth/audits" },
      { label: "Sessions", icon: SESSIONS_ICON, to: "/auth/sessions" },
    ],
  },
  {
    id: "fees",
    title: "Fees & Payments",
    icon: PAYMENT_ICON,
    roles: [Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER],
    items: [
      can([Role.ACCOUNTANT, Role.OWNER]) && {
        label: "Student Fees",
        icon: STUDENT_FEES_ICON,
        to: "/fees-payment",
      },
      { label: "Payments", icon: PAYMENT_ICON, to: "/fees-payment/pay" },
      {
        label: "Fee Structures",
        icon: FEE_STRUCTURE_ICON,
        to: "/fees-payment/structure",
      },
      { label: "Discounts", icon: DISCOUNT_ICON, to: "/fees-payment/discounts" },
      { label: "Category", icon: CATEGORY_ICON, to: "/fees-payment/category" },
    ],
  },
  {
    id: "materials",
    title: "Materials & Supplies",
    icon: MATERIAL_ICON,
    roles: [Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER],
    items: [
      { label: "Materials", icon: MATERIAL_ICON, to: "/material" },
      can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER]) && {
        label: "Supplies",
        icon: CURRICULUM_GROUP_ICON,
        to: "/material/supply",
      },
      can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER]) && {
        label: "Category",
        icon: CATEGORY_ICON,
        to: "/material/category",
      },
    ],
  },
];

function isSectionItem(item: SectionItem | false): item is SectionItem {
  return item !== false;
}

const sections = computed<Section[]>(() =>
  rawSections()
    .filter((section) => can(section.roles) || section.roles.length === 0)
    .map((section) => {
      const items = section.items.filter(isSectionItem);
      return {
        id: section.id,
        title: section.title,
        icon: section.icon,
        linkItems: items.filter((i): i is SectionItem & { to: string } => !!i.to),
        actionItems: items.filter(
          (i): i is SectionItem & { action: () => void } => !i.to && !!i.action
        ),
      };
    })
    // A section with no visible items (all its own items were filtered out
    // by role) shouldn't render at all — avoids an expandable header with
    // nothing inside it.
    .filter((section) => section.linkItems.length > 0 || section.actionItems.length > 0)
);

function toggleSection(id: string) {
  expanded.value = expanded.value.includes(id)
    ? expanded.value.filter((v) => v !== id)
    : [...expanded.value, id];
}

function close() {
  open.value = false;
}

function switchRole(role: string) {
  setActiveRole(role);
  close();
}

async function installApp() {
  const installResult = await install();
  if (installResult !== "unavailable") close();
}

watch(
  () => route.fullPath,
  () => {
    open.value = false;
  }
);
</script>
