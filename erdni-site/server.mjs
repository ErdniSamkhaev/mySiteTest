// Продакшн-сервер для Timeweb Cloud App Platform (и любого Node-хостинга):
// отдаёт статику из dist/ И принимает форму обратной связи → Telegram.
// Заменяет собой хостинг статики + Netlify-функцию в одном процессе.
//
// Переменные окружения (задать в панели Timeweb → App Platform → Переменные):
//   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
//   TELEGRAM_CHAT_ID   — ваш chat_id
//   PORT               — порт (Timeweb подставляет автоматически)
import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, "dist");
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: "16kb" }));

// Форма → Telegram
app.post("/api/contact", async (req, res) => {
  const clean = (v, max) => String(v ?? "").trim().slice(0, max);
  const name = clean(req.body?.name, 100);
  const contact = clean(req.body?.contact, 200);
  const message = clean(req.body?.message, 3000);

  // honeypot: заполнено ботом — тихо «ок», но не шлём
  if (req.body?.website) return res.json({ ok: true });
  if (!name || !contact || !message) {
    return res.status(400).json({ error: "все поля обязательны" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return res.status(500).json({ error: "форма не настроена на сервере" });
  }

  const text =
    `📨 Новое сообщение с сайта\n\n` +
    `👤 Имя: ${name}\n` +
    `✉️ Контакт: ${contact}\n\n` +
    `💬 ${message}`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    if (!r.ok) return res.status(502).json({ error: "не удалось отправить в Telegram" });
  } catch {
    return res.status(502).json({ error: "сеть недоступна" });
  }
  res.json({ ok: true });
});

// Статика сайта
app.use(express.static(dist));
// Одностраничник: всё остальное → index.html (с пререндер-контентом)
app.get("*", (_req, res) => res.sendFile(join(dist, "index.html")));

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
