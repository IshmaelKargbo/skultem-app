import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

type NotificationSocketPayload = {
  count: number
  timestamp: string
  notification?: AppNotification
}

const isConnected = ref(false)
const error = ref<string | null>(null)
let client: Client | null = null

export function useNotifications() {
  const store = useAppStore()

  function connect() {
    if (client?.active) return

    const socketBase = apiServerBase()

    client = new Client({
      webSocketFactory: () => new SockJS(`${socketBase}/ws`),
      beforeConnect: () => {
        const { accessToken } = useAuthCookies()
        if (!accessToken.value) {
          throw new Error('Missing notification socket token')
        }

        client!.connectHeaders = {
          Authorization: `Bearer ${accessToken.value}`,
        }
      },
      onConnect: () => {
        isConnected.value = true
        error.value = null

        client?.subscribe('/user/queue/notifications', (message) => {
          const body = JSON.parse(message.body) as NotificationSocketPayload
          store.notifications = body.count

          // New notifications show on the bell (store.notifications) and as device notifications; they no longer
          // pop up as toasts - only failures do.
        })
      },
      onDisconnect: () => {
        isConnected.value = false
      },
      onStompError: (frame) => {
        error.value = frame.headers.message || 'Notification socket error'
        console.error('STOMP error', frame)
      },
      onWebSocketClose: () => {
        isConnected.value = false
      },
      reconnectDelay: 5000,
    })

    client.activate()
  }

  function disconnect() {
    client?.deactivate()
  }

  onMounted(connect)
  onUnmounted(disconnect)

  return { connect, disconnect, isConnected, error }
}

