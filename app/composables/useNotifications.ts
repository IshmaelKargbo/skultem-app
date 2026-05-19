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
  const toast = useToast()

  function connect() {
    if (client?.active) return

    const config = useRuntimeConfig()
    const configuredBase = (config.public.apiBase || window.location.origin).replace(/\/+$/, '')
    const socketBase = configuredBase.replace(/\/api\/v\d+$/, '')

    client = new Client({
      webSocketFactory: () => new SockJS(`${socketBase}/ws`),
      beforeConnect: () => {
        const accessToken = useCookie<string | null>('access_token')
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

          if (isImportantNotification(body.notification)) {
            toast.add({
              title: body.notification.title,
              description: body.notification.message,
              color: body.notification.priority === 'URGENT' ? 'error' : 'warning',
              icon: body.notification.priority === 'URGENT' ? 'lucide:circle-alert' : 'lucide:bell-ring',
            })
          }
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

function isImportantNotification(notification?: AppNotification) {
  return notification?.priority === 'HIGH' || notification?.priority === 'URGENT'
}
