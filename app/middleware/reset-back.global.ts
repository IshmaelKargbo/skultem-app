export default defineNuxtRouteMiddleware((to, from) => {
    // Only reset on an actual page change. Several pages page their tables via
    // router.replace({ query }) (e.g. student Academic Information) - that's a
    // navigation on the *same* route, so the page's component isn't remounted and
    // its onMounted(() => setBack(...)) never re-fires. Resetting back here too
    // would wipe the back button until the user leaves and re-enters the page.
    if (to.path === from.path) return

    const store = useAppStore()
    store.setBack(false)
})