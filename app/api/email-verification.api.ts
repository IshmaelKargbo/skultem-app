export const EmailVerificationApi = () => {
  const { $api } = useNuxtApp()

  return {
    // Format + domain check for a form field (public - works on the public site's forms too).
    check: async (email: string) => {
      const res = await $api('/email-verification/check', { method: 'POST', body: { email } }) as any
      return res?.data as EmailCheck
    },
    status: async () => {
      try {
        const res = await $api('/email-verification/status') as any
        return res?.data as EmailVerificationStatus
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Sends (or re-sends - an earlier link stops working) a link to the signed-in person's own email.
    send: async () => {
      try {
        const res = await $api('/email-verification/send', { method: 'POST' }) as any
        return res?.data as EmailVerificationStatus
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Opens a link from an email. Public - the token is the proof.
    confirm: async (token: string) => {
      try {
        const res = await $api('/email-verification/confirm', { method: 'POST', body: { token } }) as any
        return res?.data as EmailVerificationResult
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // An admin sends a link to an account they manage (it goes to that account's own email).
    sendForUser: async (userId: string) => {
      try {
        const res = await $api(`/user/${userId}/email-verification`, { method: 'POST' }) as any
        return res?.data as EmailVerificationStatus
      } catch (err: any) {
        useHandleError(err)
      }
    },
  }
}
