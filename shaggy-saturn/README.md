# just-erdni.com — личный сайт и блог

Портфолио и блог Эрдни Самхаева (learning in public). Русский — основной язык контента.
Дизайн главной — вариант «Эволюция 3D» из Design Labs, hi-fi референс лежит в
[`design_handoff_homepage_redesign/`](./design_handoff_homepage_redesign/README.md).

## Стек

- **Astro 6** (static output), посты — Content Collections (`src/content/posts/`)
- **Tailwind CSS 4** + кастомные плагины (`src/tailwind-plugin/`)
- **three.js** — WebGL-блоб в hero главной (только там и грузится)
- **@astrojs/sitemap** — генерация `sitemap-index.xml` при сборке

## Команды

| Команда | Действие |
|---|---|
| `npm install` | Установка зависимостей |
| `npm run dev` | Dev-сервер на `localhost:4321` |
| `npm run build` | Прод-сборка в `./dist/` |
| `npm run preview` | Локальный просмотр сборки |

## Структура

```
src/
├── components/
│   ├── BlogPost.astro      # карточка поста v2 (обложка 16/9, «дата · N мин», вся карточка — ссылка)
│   ├── HeroBlob.astro      # three.js-блоб для hero; подключать только на главной
│   ├── Header.astro        # лого с точкой, навигация, бургер (CSS checkbox)
│   ├── Footer.astro        # текстовые ссылки Telegram · GitHub · RSS
│   ├── ThemeIcon.astro     # переключатель темы (34px круг)
│   └── Social.astro        # иконки соцсетей (сейчас не используется — заменён футером)
├── layouts/
│   ├── BaseLayout.astro    # <head>: SEO/OG/canonical, шрифты, тема, ClientRouter; пропы description/image/ogType/fullWidth
│   └── MarkdownPostLayout.astro
├── pages/                  # index, blog, about, posts/[...slug], tags/, rss.xml.js
├── content/posts/          # markdown-посты
├── config/theme.json       # ЕДИНСТВЕННЫЙ источник цветов и шрифтов
├── scripts/                # readingTime.ts, slugify.ts
├── styles/                 # main.css — точка входа; base/components/navigation/buttons/safe/utilities
└── tailwind-plugin/        # tw-theme.mjs (токены → CSS-переменные), tw-bs-grid.mjs
```

## Темизация — как это устроено

Все цвета и шрифты живут в `src/config/theme.json`:

1. `tw-theme.mjs` превращает токены в CSS-переменные (`--color-primary`, `--color-surface`, …)
   и utility-классы (`bg-surface`, `text-meta`, `border-primary`, …).
2. Тёмная тема — **класс `.dark` на `<html>`** (не media query). Tailwind-вариант `dark:`
   НЕ настроен — темизировать только через токены или правило `.dark .селектор` в CSS.
3. Полупрозрачные оттенки токенов — через `color-mix(in srgb, var(--color-primary) 10%, transparent)`.
4. Тема выбирается inline-скриптом в `BaseLayout` (localStorage → prefers-color-scheme)
   и восстанавливается на `astro:after-swap`, иначе ClientRouter сбросит класс при навигации.

Токены: `primary`, `on-primary` (текст на primary-кнопке), `body`, `surface` (карточки),
`code-bg` (код/таблицы), `border`, `text`, `text-dark`, `meta` (даты, подписи).

## Шрифты

Unbounded (заголовки, `--font-secondary`) + Onest (текст, `--font-primary`), Google Fonts
через Astro Fonts API. Цепочка: `theme.json` → `astro.config.mjs` (парсинг + сабсеты
`cyrillic`+`latin`) → `<Font>` в BaseLayout → `font-primary`/`font-secondary` utilities.
Новый шрифт добавляется парой ключей `имя` + `имя_type` в `theme.json`.

## Посты

Схема frontmatter — `src/content.config.ts` (zod). Обязательные: `title`, `description`,
`pubDate`. Опциональные: `author`, `image { url, alt, variant }`, `tags[]`, `draft`.

- `draft: true` — пост исключается из блога, главной, тегов и RSS (фильтр на `getCollection`).
- Теги с пробелами слагифицируются в URL: «learning in public» → `/tags/learning-in-public/`
  (`src/scripts/slugify.ts`).
- Время чтения считается из тела поста, ≈180 слов/мин (`src/scripts/readingTime.ts`).

## View Transitions — грабли

Сайт использует `<ClientRouter />`. Скрипты, которые должны переживать навигацию:

- подписываются на `astro:page-load` **и** вызывают `init()` сразу при выполнении модуля —
  событие может отстрелить раньше, чем загрузится модуль (поймано на three.js);
- чистятся на `astro:before-swap` (см. `HeroBlob.astro` — dispose геометрии/рендерера);
- обработчики кликов вешаются делегированием на `document` один раз (см. `ThemeIcon.astro`).

## SEO

- Мета-теги, Open Graph, Twitter-карточки, canonical — в `BaseLayout.astro`; страницы передают
  `description`/`image` пропами (по умолчанию — общий текст и `/images/me2.webp`).
- `sitemap-index.xml` — интеграция `@astrojs/sitemap`, ссылка в `robots.txt`.
- Абсолютные URL берутся из `Astro.site` (`https://just-erdni.com` в `astro.config.mjs`).
- Страница 404 — `src/pages/404.astro`.

## Известный техдолг

- Прогресс-бар чтения на странице поста — запланирован, вне макета «Эволюция 3D».
- `Social.astro` и `src/styles/global.css` (обёртка) больше не используются — кандидаты на удаление.
- В постах (.md) остался `layout:` во frontmatter — игнорируется content collections.

План работ и фазы: [`plan/`](./plan/), аудит ошибок: [`../AUDIT.md`](../AUDIT.md).
