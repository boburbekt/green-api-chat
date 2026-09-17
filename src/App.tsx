import { useState } from 'react'
import type { Credentials } from './types'
import { LoginForm } from './components/LoginForm'
import { Sidebar } from './components/Sidebar'
import { ChatWindow } from './components/ChatWindow'
import { useChats } from './hooks/useChats'

const STORAGE_KEY = 'green-api-credentials'

function loadCreds(): Credentials | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Credentials) : null
  } catch {
    return null
  }
}

function Messenger({ creds, onLogout }: { creds: Credentials; onLogout: () => void }) {
  const { chats, activeChat, polling, createChat, openChat, send } = useChats(creds)
  const [mobileChatOpen, setMobileChatOpen] = useState(false)

  return (
    <div className={`app ${mobileChatOpen ? 'app--chat-open' : ''}`}>
      <Sidebar
        chats={chats}
        activePhone={activeChat?.phone ?? null}
        polling={polling}
        onCreate={(p) => { createChat(p); setMobileChatOpen(true) }}
        onOpen={(p) => { openChat(p); setMobileChatOpen(true) }}
        onLogout={onLogout}
      />
      <ChatWindow chat={activeChat} onSend={send} onBack={() => setMobileChatOpen(false)} />
    </div>
  )
}

export default function App() {
  const [creds, setCreds] = useState<Credentials | null>(loadCreds)

  const login = (c: Credentials) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(c))
    setCreds(c)
  }
  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setCreds(null)
  }

  return creds ? <Messenger creds={creds} onLogout={logout} /> : <LoginForm onLogin={login} />
}
