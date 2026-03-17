'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  actionUrl: string | null
  isRead: boolean
  createdAt: string
}

interface Props {
  /** Set to true when rendered on a dark (blue) background, e.g. admin sidebar */
  dark?: boolean
}

const typeIcon: Record<string, string> = {
  PAYMENT_CONFIRMED: '✅',
  ORDER_REJECTED: '❌',
  SUBSCRIPTION_EXPIRING: '⚠️',
  SUBSCRIPTION_EXPIRED: '⏰',
  NEW_ORDER: '🛒',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

export default function NotificationBell({ dark = false }: Props) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dropdownAlign, setDropdownAlign] = useState<'left' | 'right'>('right')

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.notifications)) setNotifications(data.notifications)
      if (typeof data.unreadCount === 'number') setUnreadCount(data.unreadCount)
    } catch {
      // silently ignore network errors
    }
  }, [session])

  // Initial fetch + polling every 30s
  useEffect(() => {
    if (!session?.user) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [session, fetchNotifications])

  // Mark all as read when dropdown opens
  useEffect(() => {
    if (!open || unreadCount === 0) return
    fetch('/api/notifications/read', { method: 'PATCH' }).catch(() => {})
    setUnreadCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }, [open, unreadCount])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!session?.user) return null

  const bellColor = dark ? 'text-white hover:text-blue-200' : 'text-gray-500 hover:text-tef-blue'

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setDropdownAlign(rect.left < window.innerWidth / 2 ? 'left' : 'right')
          }
          setOpen((v) => !v)
        }}
        className={`relative p-1.5 rounded-lg transition-colors ${bellColor}`}
        aria-label="Notifications"
      >
        {/* Bell SVG */}
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className={`absolute mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-[60] overflow-hidden ${dropdownAlign === 'left' ? 'left-0' : 'right-0'}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            {notifications.length > 0 && (
              <span className="text-xs text-gray-400">{notifications.length} au total</span>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                <p className="text-2xl mb-2">🔔</p>
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const content = (
                  <div className={`px-4 py-3 transition-colors ${
                    !notif.isRead ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <span className="text-base flex-shrink-0 mt-0.5">
                        {typeIcon[notif.type] ?? '🔔'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                      </div>
                      {!notif.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-tef-blue mt-1.5" />
                      )}
                    </div>
                  </div>
                )

                return notif.actionUrl ? (
                  <Link
                    key={notif.id}
                    href={notif.actionUrl}
                    onClick={() => setOpen(false)}
                    className="block"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={notif.id}>{content}</div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400 text-center">Les 20 dernières notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
