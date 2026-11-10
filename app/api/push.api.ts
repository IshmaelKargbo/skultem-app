export const PushApi = () => {
  const { $api } = useNuxtApp()

  return {
    // Whether the server sends device notifications, and its public (VAPID) key to subscribe with.
    getPublicKey: async () => {
      try {
        const res = await $api('/push/public-key') as any
        return res?.data as { enabled: boolean, publicKey: string } | undefined
      } catch (err: any) {
        useHandleError(err)
      }
    },
    subscribe: async (subscription: PushSubscriptionJSON) => {
      try {
        await $api('/push/subscriptions', { method: 'POST', body: subscription })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    unsubscribe: async (endpoint: string) => {
      try {
        await $api('/push/subscriptions', { method: 'DELETE', body: { endpoint } })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    sendTest: async () => {
      try {
        const res = await $api('/push/test', { method: 'POST' }) as any
        return (res?.data?.devices ?? 0) as number
      } catch (err: any) {
        useHandleError(err)
      }
    },
  }
}
