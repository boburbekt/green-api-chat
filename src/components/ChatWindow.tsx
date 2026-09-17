import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import type { Chat } from '../types'
import { avatarLetter } from './Sidebar'

interface Props {
  chat: Chat | null
  onSend: (phone: string, text: string) => void
  onBack: () => void
}

const time = (ts: number) =>
  new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

const statusIcon = { sending: '🕓', sent: '✓', error: '⚠' } as const

export function ChatWindow({ chat, onSend, onBack }: Props) {
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [chat?.messages.length, chat?.phone])

  if (!chat) {
    return (
      <section className="chat chat--empty">
        <p className="muted">Выберите чат или создайте новый</p>
      </section>
    )
  }

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const value = text.trim()
    if (!value) return
    onSend(chat.phone, value)
    setText('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <section className="chat">
      <header className="chat__header">
        <button className="link chat__back" onClick={onBack}>←</button>
        <div className="avatar">{avatarLetter(chat)}</div>
        <div>
          <div className="chat__title">{chat.name ?? `+${chat.phone}`}</div>
          <div className="muted small">+{chat.phone}</div>
        </div>
      </header>

      <div className="messages" ref={listRef}>
        {chat.messages.map((m) => (
          <div key={m.id} className={`msg ${m.outgoing ? 'msg--out' : 'msg--in'}`}>
            <span className="msg__text">{m.text}</span>
            <span className="msg__meta">
              {time(m.timestamp)} {m.outgoing && m.status && statusIcon[m.status]}
            </span>
          </div>
        ))}
      </div>

      <form className="composer" onSubmit={submit}>
        <textarea
          rows={1}
          placeholder="Сообщение"
          value={text}
          maxLength={4000}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button className="btn send" disabled={!text.trim()} aria-label="Отправить">➤</button>
      </form>
    </section>
  )
}
