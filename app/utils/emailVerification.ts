// Email checks and ownership verification - see the backend's EmailValidationService / EmailVerificationService.
// A well-formed address on a domain that takes mail is only "deliverable"; it's "Verified" once its owner has opened a
// link sent to it. The UI keeps those two apart: a passing check is never shown in green.

export type EmailCheckStatus = 'OK' | 'INVALID_FORMAT' | 'NO_SUCH_DOMAIN' | 'NO_MAIL_SERVER' | 'UNCHECKED'

export type EmailCheck = {
    email: string | null
    status: EmailCheckStatus
    // false only for a clear problem (bad format, no such domain, takes no mail); a domain that couldn't be checked
    // is still deliverable.
    deliverable: boolean
    message: string | null
}

export type EmailVerificationState = 'NO_EMAIL' | 'VERIFIED' | 'PENDING' | 'EXPIRED' | 'UNVERIFIED'

export type EmailVerificationStatus = {
    email: string | null
    status: EmailVerificationState
    verifiedAt: string | null
    pendingExpiresAt: string | null
    // When another link can be sent (null = now).
    resendAvailableAt: string | null
}

export type EmailVerificationResultState = 'VERIFIED' | 'ALREADY_VERIFIED' | 'EXPIRED' | 'SUPERSEDED' | 'EMAIL_CHANGED' | 'INVALID'

export type EmailVerificationResult = {
    status: EmailVerificationResultState
    // Masked, e.g. a***@example.com.
    email: string | null
}

export const EMAIL_VERIFICATION_BADGE: Record<EmailVerificationState | 'INVALID', { label: string, color: 'success' | 'warning' | 'neutral' | 'error', icon: string }> = {
    VERIFIED: { label: 'Verified', color: 'success', icon: 'i-lucide-badge-check' },
    PENDING: { label: 'Pending Verification', color: 'warning', icon: 'i-lucide-mail-question' },
    EXPIRED: { label: 'Verification Expired', color: 'warning', icon: 'i-lucide-clock-alert' },
    UNVERIFIED: { label: 'Not Verified', color: 'neutral', icon: 'i-lucide-mail' },
    NO_EMAIL: { label: 'No Email', color: 'neutral', icon: 'i-lucide-mail-x' },
    INVALID: { label: 'Invalid Email', color: 'error', icon: 'i-lucide-mail-x' },
}

// Same checks as the backend's format rule, so the field can flag a typo before asking the server.
export function looksLikeEmail(value?: string | null): boolean {
    const v = (value ?? '').trim()
    if (!v || v.length > 254) return false
    const at = v.lastIndexOf('@')
    if (at <= 0 || at === v.length - 1) return false
    const domain = v.slice(at + 1)
    if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return false
    return !/\s/.test(v) && v.indexOf('@') === at
}
