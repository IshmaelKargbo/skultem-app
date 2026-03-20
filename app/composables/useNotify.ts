export function useNotify() {
    const toast = useToast()

    function success(description?: string) {
        toast.add({ title: TITLE, description, color: 'success', icon: 'lucide:check-circle' })
    }

    function error(description?: string) {
        toast.add({ title: TITLE, description, color: 'error', icon: 'lucide:x-circle' })
    }

    function info(description?: string) {
        toast.add({ title: TITLE, description, color: 'info', icon: 'lucide:info' })
    }

    function warning(description?: string) {
        toast.add({ title: TITLE, description, color: 'warning', icon: 'lucide:alert-triangle' })
    }

    return { success, error, info, warning }
}