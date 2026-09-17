import { useState, type FormEvent } from 'react'
import type { Credentials } from '../types'
import { getStateInstance } from '../api/greenApi'

interface Props {
  onLogin: (creds: Credentials) => void
}

export function LoginForm({ onLogin }: Props) {
  const [form, setForm] = useState<Credentials>({
    apiUrl: 'https://api.green-api.com',
    idInstance: '',
    apiTokenInstance: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key: keyof Credentials) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value.trim() }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { stateInstance } = await getStateInstance(form)
      if (stateInstance !== 'authorized') {
        setError(`Инстанс не авторизован (статус: ${stateInstance})`)
        return
      }
      onLogin(form)
    } catch {
      setError('Не удалось подключиться. Проверьте данные инстанса.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={submit}>
        <div className="login__logo">M</div>
        <h1>Вход в чат</h1>
        <p className="muted">Введите данные инстанса из личного кабинета GREEN-API</p>

        <label>
          apiUrl
          <input value={form.apiUrl} onChange={update('apiUrl')} required />
        </label>
        <label>
          idInstance
          <input value={form.idInstance} onChange={update('idInstance')} inputMode="numeric" required />
        </label>
        <label>
          apiTokenInstance
          <input type="password" value={form.apiTokenInstance} onChange={update('apiTokenInstance')} required />
        </label>

        {error && <div className="error">{error}</div>}
        <button className="btn" disabled={loading}>
          {loading ? 'Проверка…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
