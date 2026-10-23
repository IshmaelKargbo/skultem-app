import { defineStore } from 'pinia'

export const useMarketingStore = defineStore('marketing', {
  state: () => ({
    testimonials: [] as Testimonial[],
    testimonialsMeta: {} as Meta,
    videos: [] as MarketingVideo[],
    videosMeta: {} as Meta,
    posts: [] as BlogPost[],
    postsMeta: {} as Meta,
    messages: [] as ContactMessage[],
    messagesMeta: {} as Meta,
    unread: 0,
    loading: false
  }),

  actions: {
    async fetchTestimonials(page = 1, size = 10) {
      this.loading = true
      try {
        const res = await MarketingApi().listTestimonials(page, size)
        this.testimonials = res?.data || []
        this.testimonialsMeta = res?.meta || {} as Meta
      } finally {
        this.loading = false
      }
    },
    async fetchVideos(page = 1, size = 10) {
      this.loading = true
      try {
        const res = await MarketingApi().listVideos(page, size)
        this.videos = res?.data || []
        this.videosMeta = res?.meta || {} as Meta
      } finally {
        this.loading = false
      }
    },
    async fetchPosts(page = 1, size = 10) {
      this.loading = true
      try {
        const res = await MarketingApi().listPosts(page, size)
        this.posts = res?.data || []
        this.postsMeta = res?.meta || {} as Meta
      } finally {
        this.loading = false
      }
    },
    async fetchMessages(page = 1, size = 10, status?: string) {
      this.loading = true
      try {
        const res = await MarketingApi().listMessages(page, size, status)
        this.messages = res?.data || []
        this.messagesMeta = res?.meta || {} as Meta
      } finally {
        this.loading = false
      }
    },
    async fetchUnread() {
      this.unread = await MarketingApi().unreadMessages()
    }
  }
})
