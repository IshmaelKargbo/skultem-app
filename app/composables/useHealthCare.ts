// Shared Health Care state for the screens that need it: the school's settings (complaint list, rules) loaded once,
// and a counter bumped whenever a visit changes, so the dashboard and lists reload together.
export function useHealthCare() {
    const settings = useState<HealthCareSettings | null>('health-care-settings', () => null)
    const loadingSettings = useState('health-care-settings-loading', () => false)
    const changeVersion = useState('health-care-change', () => 0)

    async function loadSettings(force = false) {
        if (settings.value && !force) return settings.value
        loadingSettings.value = true
        try {
            settings.value = await HealthCareApi().settings()
            return settings.value
        } finally {
            loadingSettings.value = false
        }
    }

    /** Complaints the nurse can choose for a new visit: the school's list without hidden ones. */
    const complaintOptions = computed(() => (settings.value?.complaintList ?? [])
        .filter(c => !c.hidden)
        .map(c => ({ label: c.label, value: c.code, urgent: c.urgent })))

    return {
        settings,
        loadingSettings,
        loadSettings,
        complaintOptions,
        changeVersion,
        changed: () => { changeVersion.value++ }
    }
}
