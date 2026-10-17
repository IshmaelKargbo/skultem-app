export type Testimonial = {
    id: string
    authorName: string
    authorRole: string | null
    schoolName: string | null
    quote: string
    rating: number
    photoUrl: string | null
    featured: boolean
    published: boolean
    displayOrder: number
    createdAt: string
    updatedAt: string
}

export type SaveTestimonialDto = {
    authorName: string
    authorRole: string
    schoolName: string
    quote: string
    rating: number
    photoUrl: string
    featured: boolean
    published: boolean
    displayOrder: number
}

export type BlogPost = {
    id: string
    title: string
    slug: string
    excerpt: string | null
    // Only on a single post (the list leaves it out).
    content: string | null
    coverImageUrl: string | null
    // The post's photos in order; the first is the cover.
    images: string[]
    authorName: string | null
    tags: string[]
    published: boolean
    publishedAt: string | null
    createdAt: string
    updatedAt: string
}

export type SaveBlogPostDto = {
    title: string
    slug: string
    excerpt: string
    content: string
    images: string[]
    authorName: string
    tags: string[]
    published: boolean
}

// A post can have at most this many photos.
export const MAX_BLOG_PHOTOS = 4

export type ContactStatus = 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED'

export type ContactMessage = {
    id: string
    name: string
    email: string
    // Null on messages sent before the form asked for it.
    school: string | null
    phone: string | null
    // The main challenge the sender describes.
    challenge: string
    status: ContactStatus
    createdAt: string
    updatedAt: string
    // The lead (status, owner) this message was made into.
    lead?: Lead | null
}

export type ContactStatusOption = {
    label: string
    value: ContactStatus
    color: 'primary' | 'neutral' | 'success' | 'warning'
}

export const CONTACT_STATUS_OPTIONS: ContactStatusOption[] = [
    { label: 'New', value: 'NEW', color: 'primary' },
    { label: 'Read', value: 'READ', color: 'neutral' },
    { label: 'Replied', value: 'REPLIED', color: 'success' },
    { label: 'Archived', value: 'ARCHIVED', color: 'warning' }
]

// A post's web address: lowercase letters and numbers, with single hyphens between them. The same rule
// the server enforces.
export const SLUG_MAX_LENGTH = 120

export function isValidSlug(slug: string): boolean {
    return slug.length <= SLUG_MAX_LENGTH && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

// What the server makes from a title when no slug is typed.
export function slugFromTitle(title: string): string {
    return title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, SLUG_MAX_LENGTH)
        .replace(/-+$/, '')
}
