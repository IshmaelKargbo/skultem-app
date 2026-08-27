import { defineStore } from 'pinia'

export const useCommunicateStore = defineStore('communicate', {
    state: () => ({
        notices: [] as Notice[],
        noticesMeta: {} as Meta,
        calendar: [] as CalendarEntry[],
        calendarMeta: {} as Meta,
        broadcasts: [] as Broadcast[],
        broadcastsMeta: {} as Meta,
        loading: false,
        error: null as string | null
    }),

    getters: {
        pinnedNotices(state): Notice[] {
            return state.notices.filter(e => e.pinned)
        },
        upcomingEntries(state): CalendarEntry[] {
            return state.calendar
                .filter(isEntryUpcoming)
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        }
    },

    actions: {
        async fetchNotices(page: number = 1, size: number = 10) {
            this.loading = true
            this.error = null
            try {
                const res = await NoticeApi().getAll(page, size) as any
                this.notices = res?.data || []
                this.noticesMeta = res?.meta || {} as Meta
            } catch (err: any) {
                this.error = err?.message || 'Failed to fetch notices'
            } finally {
                this.loading = false
            }
        },

        async createNotice(payload: CreateNoticeDto) {
            const notice = await NoticeApi().create(payload) as Notice
            if (notice) this.notices.unshift(notice)
            return notice
        },

        async updateNotice(payload: UpdateNoticeDto) {
            const { id, ...rest } = payload
            const notice = await NoticeApi().update(id, rest) as Notice
            if (notice) {
                const index = this.notices.findIndex(e => e.id === id)
                if (index !== -1) this.notices[index] = notice
            }
            return notice
        },

        async deleteNotice(id: string) {
            await NoticeApi().remove(id)
            this.notices = this.notices.filter(e => e.id !== id)
        },

        async togglePin(id: string) {
            const notice = await NoticeApi().togglePin(id) as Notice
            if (notice) {
                const index = this.notices.findIndex(e => e.id === id)
                if (index !== -1) this.notices[index] = notice
            }
        },

        async fetchCalendar(page: number = 1, size: number = 10) {
            this.loading = true
            this.error = null
            try {
                const res = await CalendarEventApi().getAll(page, size) as any
                this.calendar = res?.data || []
                this.calendarMeta = res?.meta || {} as Meta
            } catch (err: any) {
                this.error = err?.message || 'Failed to fetch calendar entries'
            } finally {
                this.loading = false
            }
        },

        async createEntry(payload: CreateCalendarEntryDto) {
            const entry = await CalendarEventApi().create(payload) as CalendarEntry
            if (entry) this.calendar.unshift(entry)
            return entry
        },

        async updateEntry(payload: UpdateCalendarEntryDto) {
            const { id, ...rest } = payload
            const entry = await CalendarEventApi().update(id, rest) as CalendarEntry
            if (entry) {
                const index = this.calendar.findIndex(e => e.id === id)
                if (index !== -1) this.calendar[index] = entry
            }
            return entry
        },

        async deleteEntry(id: string) {
            await CalendarEventApi().remove(id)
            this.calendar = this.calendar.filter(e => e.id !== id)
        },

        async fetchBroadcasts(page: number = 1, size: number = 10) {
            this.loading = true
            this.error = null
            try {
                const res = await BroadcastApi().getAll(page, size) as any
                this.broadcasts = res?.data || []
                this.broadcastsMeta = res?.meta || {} as Meta
            } catch (err: any) {
                this.error = err?.message || 'Failed to fetch broadcasts'
            } finally {
                this.loading = false
            }
        },

        async composeBroadcast(payload: ComposeBroadcastDto) {
            if (!payload.channels.length) throw new Error('Select at least one channel')

            const broadcast = await BroadcastApi().compose(payload) as Broadcast
            if (broadcast) this.broadcasts.unshift(broadcast)
            return broadcast
        }
    }
})
