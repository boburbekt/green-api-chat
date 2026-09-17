export interface Credentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export interface Message {
  id: string
  text: string
  outgoing: boolean
  timestamp: number
  status?: 'sending' | 'sent' | 'error'
}

export interface Chat {
  /** Номер телефона получателя, только цифры */
  phone: string
  name?: string
  messages: Message[]
  unread: number
}
