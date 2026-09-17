import type { Credentials } from '../types'

export interface Notification {
  receiptId: number
  body: {
    typeWebhook: string
    timestamp: number
    idMessage?: string
    senderData?: {
      chatId: string
      chatName?: string
      senderName?: string
      senderPhoneNumber?: number | string
    }
    messageData?: {
      typeMessage: string
      textMessageData?: { textMessage: string }
      extendedTextMessageData?: { text: string }
    }
  }
}

const base = ({ apiUrl, idInstance }: Credentials) =>
  `${apiUrl.replace(/\/+$/, '')}/waInstance${idInstance}`

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    throw new Error(`GREEN-API: ${res.status} ${res.statusText}`)
  }
  const text = await res.text()
  return (text ? JSON.parse(text) : null) as T
}

export const toChatId = (phone: string) => `${phone}@c.us`

export function sendMessage(creds: Credentials, phone: string, message: string) {
  return request<{ idMessage: string }>(
    `${base(creds)}/sendMessage/${creds.apiTokenInstance}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: toChatId(phone), message }),
    },
  )
}

export function receiveNotification(creds: Credentials, signal?: AbortSignal) {
  return request<Notification | null>(
    `${base(creds)}/receiveNotification/${creds.apiTokenInstance}?receiveTimeout=20`,
    { signal },
  )
}

export function deleteNotification(creds: Credentials, receiptId: number) {
  return request<{ result: boolean }>(
    `${base(creds)}/deleteNotification/${creds.apiTokenInstance}/${receiptId}`,
    { method: 'DELETE' },
  )
}

/** Проверка учётных данных */
export function getStateInstance(creds: Credentials) {
  return request<{ stateInstance: string }>(
    `${base(creds)}/getStateInstance/${creds.apiTokenInstance}`,
  )
}

/** Достаёт текст из входящего уведомления (только текстовые сообщения) */
export function extractText(n: Notification): string | null {
  const d = n.body.messageData
  if (!d) return null
  if (d.typeMessage === 'textMessage') return d.textMessageData?.textMessage ?? null
  if (d.typeMessage === 'extendedTextMessage') return d.extendedTextMessageData?.text ?? null
  return null
}
