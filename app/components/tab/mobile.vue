<script lang="ts" setup>
interface Tab {
  key: string
  label: string
}

const props = defineProps<{
  tabs: Tab[]
  defaultActive?: string
}>()

const isActive = ref(props.defaultActive || props.tabs[0]?.key)

function setActive(key: string) {
  if (key) isActive.value = key
}
</script>

<template>
  <div class="space-y-3">
    <div class="bg-white border border-gray-200 p-1 grid gap-1 rounded-lg"
         :style="{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }">

      <div
        v-for="tab in tabs"
        :key="tab.key"
        @click="setActive(tab.key)"
        class="flex justify-center p-1 cursor-pointer transition-all"
        :class="{
          'bg-primary-950 rounded-md text-white': tab.key === isActive
        }"
      >
        <p>{{ tab.label }}</p>
      </div>

    </div>

    <!-- Active Slot -->
    <slot :name="`${isActive}-data`" />
  </div>
</template>