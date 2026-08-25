// Продакшн-сервер для Timeweb Cloud App Platform:
// отдаёт статику из dist/ И принимает форму обратной связи → e-mail (SMTP).
//
// Почему почта, а не Telegram: из российского дата-центра доступ к
// api.telegram.org режется ТСПУ (запрос виснет по таймауту). SMTP российских
// провайдеров (Яндекс, Timeweb) доступен из РФ-хостинга.
//
// Переменные окружения (Timeweb → App Platform → Переменные):
//   SMTP_HOST  — хост SMTP (напр. smtp.yandex.ru или smtp.timeweb.ru)
//   SMTP_PORT  — порт (465 = SSL, рекомендуется)
//   SMTP_USER  — логин (полный адрес ящика, от которого шлём)
//   SMTP_PASS  — пароль ящика (для Яндекса — «пароль приложения»)
//   MAIL_TO    — куда слать заявки (по умолчанию = SMTP_USER)
//   MAIL_FROM  — от кого (по умолчанию = SMTP_USER)
//   PORT       — порт сервера (Timeweb подставляет сам)
import express from "express";
import nodemailer from "nodemailer";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, "dist");
const PORT = process.env.PORT || 3000;

// SMTP-транспорт создаём один раз при старте, если заданы переменные
const smtpReady =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
const port = Number(process.env.SMTP_PORT) || 465;
const transporter = smtpReady
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 = SSL, 587 = STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

const app = express();

// www → без www (301): один канонический адрес just-erdni.ru
app.use((req, res, next) => {
  const host = req.headers.host || "";
  if (host.startsWith("www.")) {
    return res.redirect(301, "https://" + host.slice(4) + req.originalUrl);
  }
  next();
});

app.use(express.json({ limit: "16kb" }));

// Форма → e-mail
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
  if (!transporter) {
    return res.status(500).json({ error: "почта не настроена на сервере" });
  }

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: process.env.MAIL_TO || process.env.SMTP_USER,
      // если контакт — email, можно ответить прямо из письма
      replyTo: contact.includes("@") ? contact : undefined,
      subject: `Заявка с сайта — ${name}`,
      text:
        `Новое сообщение с сайта just-erdni.ru\n\n` +
        `Имя: ${name}\n` +
        `Контакт: ${contact}\n\n` +
        `Сообщение:\n${message}`,
    });
  } catch (err) {
    console.error("[contact] отправка письма упала:", err?.message, err?.code || "");
    return res.status(502).json({ error: "не удалось отправить" });
  }
  res.json({ ok: true });
});

// Статика сайта
app.use(express.static(dist));
// Одностраничник: всё остальное → index.html (с пререндер-контентом)
app.get("*", (_req, res) => res.sendFile(join(dist, "index.html")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Сервер запущен на 0.0.0.0:${PORT}`);
});
