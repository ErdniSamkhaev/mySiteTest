// Netlify-функция: принимает сообщение формы и отправляет его вам в Telegram.
// Токен бота и chat_id берутся из переменных окружения Netlify (на сервере),
// поэтому в браузер они не попадают. Настройка — см. README.
//
// Нужны переменные окружения в Netlify:
//   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
//   TELEGRAM_CHAT_ID   — ваш chat_id (узнать: напишите боту, затем
//                        https://api.telegram.org/bot<TOKEN>/getUpdates)

export default async (req) => {
  if (req.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  let data;
  try {
    data = await req.json();
  } catch {
    return json({ error: "bad request" }, 400);
  }

  const clean = (v, max) => String(v ?? "").trim().slice(0, max);
  const name = clean(data.name, 100);
  const contact = clean(data.contact, 200);
  const message = clean(data.message, 3000);

  // honeypot: поле заполнено ботом — делаем вид, что всё ок, но не шлём
  if (data.website) return json({ ok: true });
  if (!name || !contact || !message) {
    return json({ error: "все поля обязательны" }, 400);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return json({ error: "форма не настроена на сервере" }, 500);
  }

  // parse_mode не задаём — текст уходит как обычный, инъекции невозможны
  const text =
    `📨 Новое сообщение с сайта\n\n` +
    `👤 Имя: ${name}\n` +
    `✉️ Контакт: ${contact}\n\n` +
    `💬 ${message}`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });
    if (!r.ok) {
      return json({ error: "не удалось отправить в Telegram" }, 502);
    }
  } catch {
    return json({ error: "сеть недоступна" }, 502);
  }

  return json({ ok: true });
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Функция доступна по адресу /api/contact
export const config = { path: "/api/contact" };
