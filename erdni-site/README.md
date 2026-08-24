# Сайт Эрдни Самхаева

Одностраничный сайт-визитка в тёмном кинематографичном стиле: интерактивное
облако частиц, инерционный скролл, кастомный курсор, бабочка и цветок,
раскрывающиеся по скроллу, ambient-звук и форма обратной связи в Telegram.

**Стек:** React 18 + TypeScript + Vite. Скролл — [Lenis](https://github.com/darkroomengineering/lenis).
Графика — «сырой» WebGL (частицы) и Canvas/SVG. Звук — Web Audio (синтез в
браузере). Форма — Netlify-функция → Telegram. Для индексации — пререндер
контента в HTML на этапе сборки.

## Запуск

Нужен Node.js 18+.

```bash
npm install
npm run dev
```

Откроется на http://localhost:5173

Прод-сборка (с пререндером):

```bash
npm run build
npm run preview
```

## Форма обратной связи → Telegram

Сообщения формы уходят вам в Telegram через Netlify-функцию
`netlify/functions/contact.mjs` (адрес `/api/contact`). Токен бота хранится в
переменных окружения на сервере и в браузер не попадает.

Настройка:

1. Создайте бота у [@BotFather](https://t.me/BotFather) → получите **токен**.
2. Напишите своему боту любое сообщение, затем откройте
   `https://api.telegram.org/bot<ТОКЕН>/getUpdates` и найдите ваш **chat_id**
   (`message.chat.id`).
3. В Netlify: **Site settings → Environment variables** добавьте:
   ```
   TELEGRAM_BOT_TOKEN = <токен от BotFather>
   TELEGRAM_CHAT_ID   = <ваш chat_id>
   ```
4. Задеплойте — форма заработает.

Локальная проверка формы (функции эмулирует Netlify CLI):

```bash
npm i -g netlify-cli
netlify dev
```

(те же переменные можно положить в `.env` — Netlify CLI их подхватит).
Анти-спам: скрытое honeypot-поле + отсечка отправки быстрее 3 секунд + повторная
проверка на сервере.

## SEO / индексация

- `index.html` содержит `<title>`, `<meta description>`, Open Graph, Twitter
  Card, `og.png`, и **структурированные данные Schema.org** (Person + WebSite) —
  их читают Яндекс и Google.
- `public/robots.txt` и `public/sitemap.xml` — открыты для индексации.
- **Пререндер:** `npm run build` дополнительно рендерит контент секций в
  статический HTML и вшивает его в `dist/index.html` (см. `src/prerender.tsx` и
  `scripts/prerender.mjs`). Поэтому поисковики видят весь текст сразу, без JS.
  При загрузке JS React заменяет снимок полной интерактивной версией.
- **Домен** прописан как `https://just-erdni.netlify.app` в `index.html`,
  `public/sitemap.xml`, `public/robots.txt` — при смене домена обновите его там.
- После деплоя добавьте сайт в **Яндекс.Вебмастер** и **Google Search Console**,
  отправьте `sitemap.xml`.

## Замена фото

Портрет в блоке «Обо мне» — файл `public/images/me2.webp`, прогоняется через
дизеринг «под зелёный монитор». Замените файл на свой (тем же именем) или
поправьте путь в `src/components/Portrait.tsx`.

## «Настоящий» цветок (опционально)

Секция «Принцип» показывает векторный цветок, раскрывающийся по скроллу. Если
положить ролик реального цветка в `public/bloom.mp4` (и/или `public/bloom.webm`),
сайт автоматически переключится на него и будет перематывать по скроллу.

## Структура

```
src/
  App.tsx              — оркестрация: скролл, reveal, активная глава, магнит, scrim
  prerender.tsx        — SSR-снимок контента для поисковиков
  lib/                 — scroll (Lenis), env-хелперы, useAnimationFrame
  components/
    SceneCanvas.tsx    — облако частиц (WebGL), реагирует на курсор
    Grain / Cursor / Butterfly / Ecg / Hud / SoundToggle / Portrait
    Header / Footer / ChaptersNav
    sections/          — Hero, About, Services, Bloom (цветок), Contact (форма)
netlify/functions/
  contact.mjs          — приём формы → отправка в Telegram
scripts/prerender.mjs  — вшивание пререндера в dist/index.html
```

## Доступность

Уважается `prefers-reduced-motion`: инерционный скролл, зерно, частицы-анимация,
бабочка и анимация звука приглушаются/отключаются, контент виден сразу. Курсор,
магнит и звук — только на десктопе с мышью.
