export default defineNuxtPlugin(() => {
    const { show, hide } = useGlobalLoader()

    const router = useRouter()

    router.beforeEach(() => {
        show({
            title: 'Loading page...',
            subtitle: 'Please wait',
            hint: 'Fetching content'
        })
    })

    router.afterEach(() => {
        hide()
    })
})