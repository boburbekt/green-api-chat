# MAX Chat — GREEN-API

Тестовое задание на должность «Фронтенд разработчик React»: простой веб-интерфейс для отправки и получения текстовых сообщений в MAX через [GREEN-API](https://green-api.com/max). Внешний вид сделан по образцу web.max.ru.

**Стек:** React 19, TypeScript, Vite. Сторонних библиотек нет.

## Возможности

- Вход по учётным данным инстанса GREEN-API (`apiUrl`, `idInstance`, `apiTokenInstance`). Данные проверяются методом `getStateInstance`.
- Создание чата по номеру телефона получателя.
- Отправка текстовых сообщений методом [`SendMessage`](https://green-api.com/v3/docs/api/sending/SendMessage/).
- Получение входящих сообщений через [HTTP API](https://green-api.com/v3/docs/api/receiving/technology-http-api/): long polling `ReceiveNotification` → обработка → `DeleteNotification`.
- Статусы отправки (🕓 / ✓ / ⚠), счётчик непрочитанных, индикатор соединения.
- Адаптивная вёрстка для мобильных устройств.

## Локальный запуск

Нужен Node.js 18 или новее.

```bash
git clone <repo-url>
cd minireact
npm install
npm run dev
```

Откройте http://localhost:5173.

Сборка для продакшена: `npm run build` (результат в папке `dist/`).

## Подготовка инстанса GREEN-API

1. Создайте инстанс MAX в [личном кабинете](https://console.green-api.com) и авторизуйте его.
2. Скопируйте `apiUrl`, `idInstance` и `apiTokenInstance`.
3. В настройках инстанса оставьте **URL для webhook пустым** (иначе HTTP API не будет получать уведомления) и включите получение входящих уведомлений.

## Как пользоваться

1. Введите данные инстанса и нажмите «Войти».
2. Введите номер получателя (например, `79991234567`) и нажмите «Создать».
3. Напишите сообщение и отправьте его (Enter или кнопка ➤; Shift+Enter переносит строку).
4. Ответ получателя из MAX появится в чате.

## Структура

```
src/
  api/greenApi.ts        — запросы к GREEN-API
  hooks/useChats.ts      — состояние чатов, отправка и long polling
  components/
    LoginForm.tsx        — форма входа
    Sidebar.tsx          — список чатов и создание нового
    ChatWindow.tsx       — окно переписки
  App.tsx, types.ts, index.css
```

## Примечания

- Учётные данные хранятся только в `sessionStorage` текущей вкладки.
- История переписки хранится в памяти и сбрасывается после перезагрузки страницы: GREEN-API отдаёт только новые уведомления.
- Входящее сообщение привязывается к чату по номеру телефона отправителя (`senderPhoneNumber`).
