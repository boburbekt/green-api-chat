import { useCallback, useEffect, useState } from 'react'
import type { Chat, Credentials, Message } from '../types'
import {
  deleteNotification,
  extractText,
  receiveNotification,
  sendMessage,
  type Notification,
} from '../api/greenApi'

const digits = (v: unknown) => String(v ?? '').replace(/\D/g, '')

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Определяет номер собеседника из входящего уведомления */
function senderPhone(n: Notification): string {
  const s = n.body.senderData
  return digits(s?.senderPhoneNumber) || digits(s?.chatId.split('@')[0])
}

export function useChats(creds: Credentials) {
  const [chats, setChats] = useState<Chat[]>([])
  const [activePhone, setActivePhone] = useState<string | null>(null)
  const [polling, setPolling] = useState<'ok' | 'error'>('ok')

  const upsertMessage = useCallback(
    (phone: string, msg: Message, name?: string, markUnread = false) => {
      setChats((prev) => {
        const idx = prev.findIndex((c) => c.phone === phone)
        if (idx === -1) {
          return [{ phone, name, messages: [msg], unread: markUnread ? 1 : 0 }, ...prev]
        }
        const chat = prev[idx]
        if (chat.messages.some((m) => m.id === msg.id)) return prev
        const updated: Chat = {
          ...chat,
          name: chat.name ?? name,
          messages: [...chat.messages, msg],
          unread: chat.unread + (markUnread ? 1 : 0),
        }
        // Чат с новым сообщением поднимаем наверх
        return [updated, ...prev.filter((_, i) => i !== idx)]
      })
    },
    [],
  )

  const createChat = useCallback((rawPhone: string) => {
    const phone = digits(rawPhone)
    if (!phone) return
    setChats((prev) =>
      prev.some((c) => c.phone === phone)
        ? prev
        : [{ phone, messages: [], unread: 0 }, ...prev],
    )
    setActivePhone(phone)
  }, [])

  const openChat = useCallback((phone: string) => {
    setActivePhone(phone)
    setChats((prev) => prev.map((c) => (c.phone === phone ? { ...c, unread: 0 } : c)))
  }, [])

  const send = useCallback(
    async (phone: string, text: string) => {
      const tempId = `local-${Date.now()}`
      const updateStatus = (patch: Partial<Message>) =>
        setChats((prev) =>
          prev.map((c) =>
            c.phone !== phone
              ? c
              : {
                  ...c,
                  messages: c.messages.map((m) => (m.id === tempId ? { ...m, ...patch } : m)),
                },
          ),
        )

      upsertMessage(phone, {
        id: tempId,
        text,
        outgoing: true,
        timestamp: Date.now(),
        status: 'sending',
      })
      try {
        const { idMessage } = await sendMessage(creds, phone, text)
        updateStatus({ id: idMessage, status: 'sent' })
      } catch {
        updateStatus({ status: 'error' })
      }
    },
    [creds, upsertMessage],
  )

  // Long polling входящих уведомлений: receiveNotification -> обработка -> deleteNotification
  useEffect(() => {
    const controller = new AbortController()
    let stopped = false

    const handle = (n: Notification) => {
      const { typeWebhook, idMessage, timestamp, senderData } = n.body
      // Сообщения, отправленные через API, уже есть в чате
      if (typeWebhook !== 'incomingMessageReceived' && typeWebhook !== 'outgoingMessageReceived') {
        return
      }
      const text = extractText(n)
      const phone = senderPhone(n)
      if (!text || !phone) return

      const incoming = typeWebhook === 'incomingMessageReceived'
      upsertMessage(
        phone,
        {
          id: idMessage ?? `${n.receiptId}`,
          text,
          outgoing: !incoming,
          timestamp: timestamp * 1000,
          status: incoming ? undefined : 'sent',
        },
        incoming ? senderData?.senderName || senderData?.chatName : undefined,
        incoming,
      )
    }

    ;(async () => {
      while (!stopped) {
        try {
          const n = await receiveNotification(creds, controller.signal)
          setPolling('ok')
          if (!n) continue
          try {
            handle(n)
          } finally {
            await deleteNotification(creds, n.receiptId)
          }
        } catch (e) {
          if (stopped || (e as Error).name === 'AbortError') return
          setPolling('error')
          await sleep(5000)
        }
      }
    })()

    return () => {
      stopped = true
      controller.abort()
    }
  }, [creds, upsertMessage])

  // Сбрасываем счётчик непрочитанных в открытом чате
  useEffect(() => {
    if (!activePhone) return
    setChats((prev) =>
      prev.some((c) => c.phone === activePhone && c.unread > 0)
        ? prev.map((c) => (c.phone === activePhone ? { ...c, unread: 0 } : c))
        : prev,
    )
  }, [chats, activePhone])

  const activeChat = chats.find((c) => c.phone === activePhone) ?? null

  return { chats, activeChat, polling, createChat, openChat, send }
}
