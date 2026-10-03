import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { notificationsService } from '../services/notificationsService'

const POLL_MS = 30_000
const STORAGE_KEY = 'admin_notifications_last_seen_id'

export const notificationKeys = {
  list: ['notifications'] as const,
}

/** Latest admin notifications, polled in the background. On a failed poll the last list is kept. */
export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list,
    queryFn: () => notificationsService.list(),
    refetchInterval: POLL_MS,
    retry: false,
  })
}

function readLastSeen(): number {
  try {
    return Number(localStorage.getItem(STORAGE_KEY)) || 0
  } catch {
    return 0
  }
}

/** Highest notification id the admin has marked as read, persisted per browser. */
export function useLastSeenNotification() {
  const [lastSeen, setLastSeen] = useState(readLastSeen)

  const markSeen = (id: number) => {
    setLastSeen(id)
    try {
      localStorage.setItem(STORAGE_KEY, String(id))
    } catch {
      // storage unavailable: unread state just won't persist
    }
  }

  return { lastSeen, markSeen }
}
