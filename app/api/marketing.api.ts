// The system admin's side of the marketing site's content (testimonials, blog, contact messages).
export const MarketingApi = () => {
  const { $api } = useNuxtApp()

  const page = async (url: string) => {
    try {
      const res = await $api(url) as any
      if (!res)
        throw new Error('Failed to fetch')
      return { ...res, data: res.data, meta: useMeta(res.meta) }
    } catch (err: any) {
      useHandleError(err)
    }
  }

  const send = async (url: string, method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', body?: unknown) => {
    try {
      const res = await $api(url, { method, body }) as any
      return res?.data
    } catch (err: any) {
      useHandleError(err)
    }
  }

  return {
    listTestimonials: (p: number, size: number) => page(`/marketing/testimonials?page=${p}&size=${size}`),
    createTestimonial: (dto: SaveTestimonialDto) => send('/marketing/testimonials', 'POST', dto),
    updateTestimonial: (id: string, dto: SaveTestimonialDto) => send(`/marketing/testimonials/${id}`, 'PUT', dto),
    deleteTestimonial: (id: string) => send(`/marketing/testimonials/${id}`, 'DELETE'),

    listPosts: (p: number, size: number) => page(`/marketing/blog?page=${p}&size=${size}`),
    getPost: (id: string) => $api(`/marketing/blog/${id}`).then((res: any) => res.data as BlogPost).catch(useHandleError),
    // Whether the slug is well formed and no other post uses it (a post may keep its own).
    slugAvailable: async (slug: string, excludeId?: string) => {
      try {
        const query = new URLSearchParams({ slug })
        if (excludeId) query.set('excludeId', excludeId)
        const res = await $api(`/marketing/blog/slug-available?${query}`) as any
        return res.data === true
      } catch {
        // If the check itself fails the server still validates on save.
        return true
      }
    },
    createPost: (dto: SaveBlogPostDto) => send('/marketing/blog', 'POST', dto),
    // One photo per call; the URL it comes back with is added to the post's photos.
    uploadPostImage: async (file: File) => {
      try {
        const body = new FormData()
        body.append('image', file)
        const res = await $api('/marketing/blog/images', { method: 'POST', body }) as any
        return res.data.url as string
      } catch (err: any) {
        useHandleError(err)
      }
    },
    updatePost: (id: string, dto: SaveBlogPostDto) => send(`/marketing/blog/${id}`, 'PUT', dto),
    deletePost: (id: string) => send(`/marketing/blog/${id}`, 'DELETE'),

    listMessages: (p: number, size: number, status?: string) =>
      page(`/marketing/contact?page=${p}&size=${size}${status ? `&status=${status}` : ''}`),
    unreadMessages: () => $api('/marketing/contact/unread').then((res: any) => Number(res.data || 0)).catch(() => 0),
    updateMessageStatus: (id: string, status: ContactStatus) => send(`/marketing/contact/${id}/status`, 'PATCH', { status }),
    deleteMessage: (id: string) => send(`/marketing/contact/${id}`, 'DELETE')
  }
}
