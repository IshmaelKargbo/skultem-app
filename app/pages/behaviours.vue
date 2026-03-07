<template>
    <BehaviourTable />
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Behaviours')
    document.title = 'Behaviours | Skultem'
})
</script>