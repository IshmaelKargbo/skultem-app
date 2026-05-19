export default defineNuxtRouteMiddleware(() => {
    const store = useAppStore()
    store.setBack(false)
})