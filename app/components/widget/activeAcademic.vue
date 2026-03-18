<template>
  <UCard>
    <div class="space-y-1">
      <p class="text-xs text-mute">Active Academic Year</p>
      <div class="flex justify-between items-center">
        <div v-if="!isReady" class="space-y-2 w-full">
          <USkeleton class="h-8 w-1/2" />
          <USkeleton class="h-4 w-1/3" />
        </div>
        <template v-else>
          <div>
            <p class="text-2xl font-semibold">{{ year }}</p>
            <p class="text-xs text-success">{{ term }}</p>
          </div>
          <UBadge :icon="ATTENDANCE_ICON" variant="subtle" size="xl" class="p-1.5" color="info" />
        </template>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"

const store = useTermStore()
const isReady = ref(false)
const year = ref("")
const term = ref("")

onMounted(async () => {
  const res = await store.getActive()
  if (res != null) {
    year.value = res.academicYear.name
    term.value = res.name
  }
  isReady.value = true
})
</script>