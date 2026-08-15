import { defineStore } from 'pinia'

function uid() {
    return Math.random().toString(36).slice(2, 10)
}

function daysFromNow(days: number) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString()
}

const seedNotices: Notice[] = [
    {
        id: 'nt-1',
        title: 'PTA Meeting — Term 2',
        content: 'All parents are invited to the Term 2 PTA meeting in the main hall to discuss academic progress and upcoming activities.',
        category: 'GENERAL',
        audience: 'PARENTS',
        pinned: true,
        postedBy: 'School Administration',
        postedAt: daysFromNow(-3),
        expiresAt: daysFromNow(7)
    },
    {
        id: 'nt-2',
        title: 'Fee Payment Deadline Reminder',
        content: 'Term 2 fees are due by the end of this month. Please settle outstanding balances to avoid late fees.',
        category: 'FEE',
        audience: 'PARENTS',
        pinned: true,
        postedBy: 'Accounts Office',
        postedAt: daysFromNow(-1),
        expiresAt: daysFromNow(14)
    },
    {
        id: 'nt-3',
        title: 'Mid-Term Exam Timetable Released',
        content: 'The Term 2 mid-term examination timetable has been published. Check the academics section for your class schedule.',
        category: 'ACADEMIC',
        audience: 'ALL',
        pinned: false,
        postedBy: 'Academic Office',
        postedAt: daysFromNow(-5),
        expiresAt: daysFromNow(10)
    },
    {
        id: 'nt-4',
        title: 'Inter-House Sports Day Volunteers Needed',
        content: 'We are looking for staff and parent volunteers to help coordinate this term\'s inter-house sports day.',
        category: 'GENERAL',
        audience: 'STAFF',
        pinned: false,
        postedBy: 'Athletics Department',
        postedAt: daysFromNow(-8),
        expiresAt: daysFromNow(-1)
    },
    {
        id: 'nt-5',
        title: 'School Closed — Public Holiday',
        content: 'The school will be closed tomorrow in observance of the public holiday. Classes resume the following day.',
        category: 'URGENT',
        audience: 'ALL',
        pinned: true,
        postedBy: 'School Administration',
        postedAt: daysFromNow(0),
        expiresAt: daysFromNow(2)
    }
]

const seedCalendar: CalendarEntry[] = [
    { id: 'ev-1', title: 'Independence Day', description: 'National public holiday — no classes.', type: 'HOLIDAY', startDate: daysFromNow(12), endDate: daysFromNow(12), location: '' },
    { id: 'ev-2', title: "Founder's Day Celebration", description: 'Annual celebration marking the founding of the school, with performances and awards.', type: 'EVENT', startDate: daysFromNow(20), endDate: daysFromNow(20), location: 'Main Auditorium' },
    { id: 'ev-3', title: 'Inter-House Sports Competition', description: 'Athletics and team sports competition between school houses.', type: 'EVENT', startDate: daysFromNow(28), endDate: daysFromNow(29), location: 'School Sports Field' },
    { id: 'ev-4', title: 'Mid-Term Break', description: 'School closed for the mid-term break.', type: 'HOLIDAY', startDate: daysFromNow(35), endDate: daysFromNow(39), location: '' },
    { id: 'ev-5', title: 'Cultural Day', description: 'Students showcase local culture through food, dance and dress.', type: 'EVENT', startDate: daysFromNow(-6), endDate: daysFromNow(-6), location: 'School Compound' },
    { id: 'ev-6', title: 'Christmas & New Year Break', description: 'End of year holiday break.', type: 'HOLIDAY', startDate: daysFromNow(60), endDate: daysFromNow(74), location: '' }
]

const seedBroadcasts: Broadcast[] = [
    {
        id: 'bc-1',
        title: 'Term 2 Resumption Notice',
        message: 'School resumes for Term 2 on Monday. Please ensure all students are in proper uniform.',
        audience: 'ALL',
        channels: ['SMS', 'PUSH'],
        status: 'SENT',
        recipientsCount: audienceSize.ALL,
        deliveredCount: Math.round(audienceSize.ALL * 0.97),
        sentBy: 'School Administration',
        scheduledAt: null,
        sentAt: daysFromNow(-14),
        createdAt: daysFromNow(-14)
    },
    {
        id: 'bc-2',
        title: 'Fee Deadline Reminder',
        message: 'Reminder: Term 2 fees are due by the end of the month. Contact the accounts office with any questions.',
        audience: 'PARENTS',
        channels: ['SMS', 'EMAIL'],
        status: 'SENT',
        recipientsCount: audienceSize.PARENTS,
        deliveredCount: Math.round(audienceSize.PARENTS * 0.94),
        sentBy: 'Accounts Office',
        scheduledAt: null,
        sentAt: daysFromNow(-1),
        createdAt: daysFromNow(-1)
    },
    {
        id: 'bc-3',
        title: 'Staff Meeting Tomorrow',
        message: 'All teaching staff are required to attend a briefing in the staff room tomorrow at 3:30pm.',
        audience: 'TEACHERS',
        channels: ['EMAIL', 'IN_APP'],
        status: 'SCHEDULED',
        recipientsCount: audienceSize.TEACHERS,
        deliveredCount: 0,
        sentBy: 'School Administration',
        scheduledAt: daysFromNow(1),
        sentAt: null,
        createdAt: daysFromNow(0)
    },
    {
        id: 'bc-4',
        title: 'SMS Gateway Outage Notice',
        message: 'Exam results release announcement.',
        audience: 'ALL',
        channels: ['SMS'],
        status: 'FAILED',
        recipientsCount: audienceSize.ALL,
        deliveredCount: 0,
        sentBy: 'Academic Office',
        scheduledAt: null,
        sentAt: daysFromNow(-4),
        createdAt: daysFromNow(-4)
    }
]

export const useCommunicateStore = defineStore('communicate', {
    state: () => ({
        notices: [...seedNotices] as Notice[],
        calendar: [...seedCalendar] as CalendarEntry[],
        broadcasts: [...seedBroadcasts] as Broadcast[]
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
        createNotice(payload: CreateNoticeDto) {
            const notice: Notice = {
                id: uid(),
                title: payload.title,
                content: payload.content,
                category: payload.category,
                audience: payload.audience,
                expiresAt: payload.expiresAt,
                pinned: false,
                postedBy: 'You',
                postedAt: new Date().toISOString()
            }
            this.notices.unshift(notice)
        },

        updateNotice(payload: UpdateNoticeDto) {
            const notice = this.notices.find(e => e.id === payload.id)
            if (!notice) return

            notice.title = payload.title
            notice.content = payload.content
            notice.category = payload.category
            notice.audience = payload.audience
            notice.expiresAt = payload.expiresAt
        },

        deleteNotice(id: string) {
            this.notices = this.notices.filter(e => e.id !== id)
        },

        togglePin(id: string) {
            const notice = this.notices.find(e => e.id === id)
            if (notice) notice.pinned = !notice.pinned
        },

        createEntry(payload: CreateCalendarEntryDto) {
            const entry: CalendarEntry = {
                id: uid(),
                ...payload
            }
            this.calendar.unshift(entry)
        },

        updateEntry(payload: UpdateCalendarEntryDto) {
            const entry = this.calendar.find(e => e.id === payload.id)
            if (!entry) return

            entry.title = payload.title
            entry.description = payload.description
            entry.type = payload.type
            entry.startDate = payload.startDate
            entry.endDate = payload.endDate
            entry.location = payload.location
        },

        deleteEntry(id: string) {
            this.calendar = this.calendar.filter(e => e.id !== id)
        },

        composeBroadcast(payload: ComposeBroadcastDto) {
            if (!payload.channels.length) throw new Error('Select at least one channel')

            const recipientsCount = audienceSize[payload.audience]
            const isNow = payload.sendOption === 'NOW'

            const broadcast: Broadcast = {
                id: uid(),
                title: payload.title,
                message: payload.message,
                audience: payload.audience,
                channels: payload.channels,
                status: isNow ? 'SENT' : 'SCHEDULED',
                recipientsCount,
                deliveredCount: isNow ? Math.round(recipientsCount * (0.93 + Math.random() * 0.06)) : 0,
                sentBy: 'You',
                scheduledAt: isNow ? null : payload.scheduledAt,
                sentAt: isNow ? new Date().toISOString() : null,
                createdAt: new Date().toISOString()
            }
            this.broadcasts.unshift(broadcast)
            return broadcast
        }
    }
})
