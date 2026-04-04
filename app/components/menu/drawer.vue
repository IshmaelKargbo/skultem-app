<script setup lang="ts">
import { ref, computed, watch } from "vue"

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const { activeRole, can, setActiveRole } = useAuth()

const router = useRouter()
const open = ref(false)

const name = computed(() =>
  user.value ? `${user.value.givenNames} ${user.value.familyName}` : ""
)

const roleDesc: Record<string, string> = {
  proprietor: "School owner & oversight",
  admin: "Full system access",
  teacher: "Classes & students",
  student: "Courses & grades",
  parent: "Child progress"
}

const roleIcons: Record<string, string> = {
  proprietor: "lucide:crown",
  admin: "lucide:shield",
  teacher: "lucide:book-open",
  student: "lucide:graduation-cap",
  parent: "lucide:users"
}

const userRoles = computed(() =>
  (user.value?.roles ?? []).map((role: string) => ({
    value: role,
    label: role.charAt(0).toUpperCase() + role.slice(1),
    desc: roleDesc[role] ?? "Access level",
    icon: roleIcons[role] ?? "lucide:user"
  }))
)

function close() {
  open.value = false
}

function switchRole(role: string) {
  setActiveRole(role)
  close()
}

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    open.value = false
  }
)
</script>

<template>
  <USlideover
    :open="open"
    :dismissible="false"
    :ui="{ content: 'w-screen max-w-none' }"
    @update:open="open = $event"
  >
    <!-- Trigger -->
    <UButton
      class="md:hidden"
      color="neutral"
      variant="link"
      icon="lucide:menu"
      @click="open = true"
    />

    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center space-x-3">
          <div class="relative shrink-0">
            <UAvatar :alt="name" size="md" />
            <span
              class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-indigo-500 rounded-full"
            />
          </div>

          <div class="min-w-0">
            <p class="text-sm font-semibold truncate">
              {{ name }}
            </p>

            <span class="text-xs text-gray-500">
              Active as
              <strong class="text-primary capitalize">
                {{ clean(activeRole) }}
              </strong>
            </span>
          </div>
        </div>

        <UButton
          icon="lucide:x"
          color="neutral"
          variant="ghost"
          size="xs"
          @click="close"
        />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <div class="flex flex-col gap-4">

        <!-- Switch Role -->
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 px-2 pb-1">
            Switch Role
          </p>

          <div class="space-y-1 border-y py-2 border-gray-100">
            <button
              v-for="role in userRoles"
              :key="role.value"
              class="flex items-center gap-3 w-full px-3 py-2 rounded-xl border transition text-left"
              :class="
                activeRole === role.value
                  ? 'bg-primary-50 border-primary-200'
                  : 'border-transparent hover:bg-gray-50'
              "
              @click="switchRole(role.value)"
            >
              <span
                class="w-7 h-7 flex items-center justify-center rounded-lg"
                :class="
                  activeRole === role.value
                    ? 'bg-primary-100'
                    : 'bg-gray-100'
                "
              >
                <UIcon :name="role.icon" class="text-sm" />
              </span>

              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold">
                  {{ clean(role.label) }}
                </p>

                <p class="text-xs text-gray-400 truncate">
                  {{ role.desc }}
                </p>
              </div>

              <UIcon
                v-if="activeRole === role.value"
                name="lucide:check"
                class="text-primary text-xs"
              />
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="border-b border-gray-100 pb-2">
          <UButton
            v-if="can(['admin','proprietor'])"
            icon="lucide:settings"
            variant="ghost"
            class="w-full justify-start"
            to="/settings"
            @click="close"
          >
            Settings
          </UButton>

          <UButton
            :icon="BELL_ICON"
            variant="ghost"
            class="w-full justify-start"
            to="/notifications"
            @click="close"
          >
            Notifications
          </UButton>
        </div>

        <!-- Performance -->
        <UButton
          :icon="PERFORMANCE_ICON"
          variant="ghost"
          class="w-full justify-start"
          to="/performance"
          @click="close"
        >
          Performance
        </UButton>
      </div>
    </template>

    <!-- Footer -->
    <template #footer>
      <UButton
        to="/logout"
        icon="lucide:log-out"
        color="error"
        variant="ghost"
        class="w-full justify-start"
      >
        Sign out
      </UButton>
    </template>

  </USlideover>
</template>