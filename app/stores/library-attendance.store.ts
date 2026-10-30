import { defineStore } from 'pinia'

// Library Attendance figures shared across its screens. Every change (check-in, check-out, follow-up, register
// changes) bumps changeVersion, and views showing counts watch it and reload - so nothing shows stale numbers.
export const useLibraryAttendanceStore = defineStore('library-attendance', {
    state: () => ({
        overview: null as LibraryAttendanceOverview | null,
        overviewLoading: false,
        changeVersion: 0
    }),

    actions: {
        async fetchOverview() {
            this.overviewLoading = true
            try {
                this.overview = await LibraryAttendanceApi().overview()
            } finally {
                this.overviewLoading = false
            }
        },

        changed() {
            this.changeVersion++
        }
    }
})
