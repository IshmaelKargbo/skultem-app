// Pop-up messages. Only failures pop up (error): success, info and warning messages are not shown - a toast after
// every action was too much. Callers keep calling success()/info()/warning() so they can be turned back on here in
// one place.
export function useNotify() {
    const toast = useToast()

    function success(_description?: string) {
        // Not shown (see above).
    }

    function error(description?: string) {
        toast.add({ title: TITLE, description, color: 'error', icon: 'lucide:x-circle' })
    }

    function info(_description?: string) {
        // Not shown (see above).
    }

    function warning(_description?: string) {
        // Not shown (see above).
    }

    return { success, error, info, warning }
}