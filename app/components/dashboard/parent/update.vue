<script lang="ts" setup>
const store = useParentStore()
const { notifications } = storeToRefs(store)

const loading = ref(true)

onMounted(async () => {
  loading.value = true
  await store.fetchAllNotifications(1, 3)
  loading.value = false
})
</script>

<template>
  <UCard>
    <div>
      <p class="text-mute">Recent Updates</p>

      <div class="mt-2 space-y-4">
        <!-- Loading -->
        <div v-if="loading" class="space-y-1">
          <div v-for="n in 3" :key="n" class="flex space-x-2">
            <USkeleton class="w-2 h-2 rounded-full mt-2" />

            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-48" />
              <USkeleton class="h-3 w-20" />
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div
          v-else
          v-for="(item, index) in notifications"
          :key="item.id"
          class="flex space-x-2 border-b border-gray-100"
          :class="{ 'border-b-0': index + 1 === notifications.length }"
        >
          <div class="mt-1.5">
            <div class="w-2 h-2 rounded-full bg-success"></div>
          </div>

          <div class="space-y-0.5">
            <p class="font-semibold line-clamp-1">{{ item.title }}</p>
            <p class="text-xs text-muted line-clamp-1">{{ item.message }}</p>
            <p class="text-mute text-[11px]">
              {{ formatDateTime(item.createdAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>