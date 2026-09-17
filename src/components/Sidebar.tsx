import { useState, type FormEvent } from 'react'
import type { Chat } from '../types'

interface Props {
  chats: Chat[]
  activePhone: string | null
  polling: 'ok' | 'error'
  onCreate: (phone: string) => void
  onOpen: (phone: string) => void
  onLogout: () => void
}

export const avatarLetter = (chat: Chat) => (chat.name?.[0] ?? '#').toUpperCase()

export function Sidebar({ chats, activePhone, polling, onCreate, onOpen, onLogout }: Props) {
  const [phone, setPhone] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!phone.replace(/\D/g, '')) return
    onCreate(phone)
    setPhone('')
  }

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <h2>Чаты</h2>
        <span className={`dot dot--${polling}`} title={polling === 'ok' ? 'Подключено' : 'Нет соединения'} />
        <button className="link" onClick={onLogout}>Выйти</button>
      </header>

      <form className="new-chat" onSubmit={submit}>
        <input
          placeholder="Номер телефона, напр. 79991234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
        />
        <button className="btn btn--small">Создать</button>
      </form>

      <ul className="chat-list">
        {chats.length === 0 && <li className="muted empty">Нет чатов. Создайте новый по номеру.</li>}
        {chats.map((chat) => {
          const last = chat.messages[chat.messages.length - 1]
          return (
            <li
              key={chat.phone}
              className={`chat-item ${chat.phone === activePhone ? 'chat-item--active' : ''}`}
              onClick={() => onOpen(chat.phone)}
            >
              <div className="avatar">{avatarLetter(chat)}</div>
              <div className="chat-item__body">
                <div className="chat-item__title">{chat.name ?? `+${chat.phone}`}</div>
                <div className="chat-item__last">{last ? (last.outgoing ? 'Вы: ' : '') + last.text : 'Нет сообщений'}</div>
              </div>
              {chat.unread > 0 && <span className="badge">{chat.unread}</span>}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
