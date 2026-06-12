# Handoff: Редизайн главной страницы — «Эволюция + 3D»

## Overview

Редизайн главной страницы личного блога **just-erdni.netlify.app** (репозиторий `shaggy-saturn`, Astro + Tailwind). Утверждённый дизайн — вариант «Эволюция»: развитие текущей тёмной Telegram-палитры с новым hero (аватар, имя, роль, intro, кнопки Telegram/GitHub), секцией «Последние посты» с карточками v2 и WebGL-блобом в фоне hero.

## About the Design Files

Файлы в этом пакете — **дизайн-референсы, сделанные в HTML** (`Эволюция 3D.dc.html`). Это прототип, показывающий целевой вид и поведение, а **не production-код для копирования**. Задача — воссоздать этот дизайн в существующем Astro-проекте `shaggy-saturn`, используя его паттерны: Astro-компоненты, Tailwind, токены из `src/config/theme.json` (через плагин `src/tailwind-plugin/tw-theme.mjs`).

В прототипе все стили инлайновые — в Astro их нужно перевести в Tailwind-классы / токены.

## Fidelity

**High-fidelity.** Цвета, типографика, отступы, радиусы и ховеры — финальные. Воспроизводить точно по значениям ниже. Шейдерный код 3D-блоба в `Эволюция 3D.dc.html` (класс `Component`, метод `_init`) можно переносить почти как есть — это рабочий three.js-код.

## Целевой код (что менять в shaggy-saturn)

| Что | Файл в репозитории |
|---|---|
| Hero + секция «Последние посты» | `src/pages/index.astro` (сейчас три строки текста — заменить целиком) |
| Карточка поста v2 | `src/components/BlogPost.astro` (переписать) |
| Токены: surface, code-bg + светлая/тёмная пары | `src/config/theme.json` + убрать хардкоды `#2e3b47`/`#242e38` в `src/styles/components.css` |
| Шрифты Questrial → Unbounded + Onest | `src/config/theme.json` (`fonts.font_family`) — Questrial не поддерживает кириллицу |
| 3D-блоб | новый компонент, напр. `src/components/HeroBlob.astro` — подключается **только** на главной |
| Время чтения | вычислять из body поста (≈180 слов/мин), напр. утилита `src/scripts/readingTime.ts` |
| Теги в URL | слагифицировать (`learning in public` → `learning-in-public`) — затрагивает `BlogPost.astro`, `MarkdownPostLayout.astro`, `tags/*` |

## Design Tokens

### Цвета — тёмная тема (основная)
| Токен | Значение | Использование |
|---|---|---|
| `body` | `#17212b` | фон страницы (как сейчас) |
| `surface` | `#1f2c3a` | фон карточек |
| `code-bg` | `#141d26` | блоки кода (для theme.json) |
| `border` | `#2f4050` | рамки, разделители (как сейчас) |
| `primary` | `#66e197` | акцент (как сейчас) |
| `text` | `#c6d0d9` | основной текст |
| `text-dark` | `#ffffff` | заголовки |
| доп. | `#8fa0af` | метаданные (дата, время чтения) |
| доп. | `#10301e` | текст на primary-кнопке |

### Цвета — светлая тема
| Токен | Значение |
|---|---|
| `body` | `#f7f9fa` |
| `surface` | `#ffffff` |
| `code-bg` | `#eef2f5` |
| `border` | `#e2e8f0` |
| `primary` | `#1fae62` (затемнённый зелёный — контраст на белом) |
| `text` | `#475569` |
| `text-dark` | `#0f172a` |

### Типографика (Google Fonts, обе с кириллицей)
- **Unbounded** — заголовки и логотип. Веса: 500, 600, 700.
- **Onest** — весь остальной текст. Веса: 400, 500, 600, 700.
- h1 hero: Unbounded 700, 46px, letter-spacing −0.01em
- h2 секции: Unbounded 600, 22px
- Заголовок карточки: Unbounded 500, 17px, line-height 1.35
- Текст: Onest 400; intro 17px / 1.65; описание карточки 14px / 1.55
- Метаданные: 13px, цвет `#8fa0af`

### Радиусы и тени
- Карточки: radius 16px; кнопки: 12px; чипы/пилюли: 99px; теги: 6px
- Тень карточки на hover: `0 16px 36px rgba(0,0,0,0.35)`
- Тень primary-кнопки на hover: `0 8px 28px rgba(102,225,151,0.35)`

### Контейнер
- max-width 1100px, горизонтальный padding 32px

## Screens / Views

### Главная (`index.astro`)

**Header** (существующий `Header.astro` почти подходит):
- Логотип: зелёная точка 10px + «Erdni» (Unbounded 600, 16px, белый)
- Навигация: ссылки 14px; активная — цвет primary + фон `rgba(102,225,151,0.10)`, radius 8px, padding 8px 14px; hover неактивных — `rgba(255,255,255,0.06)` (в светлой теме нужен свой hover-токен, не `white/10`!)
- Переключатель темы: круг 34px, рамка border

**Hero** (по центру, padding 96px сверху / 80px снизу):
- Фон: WebGL-блоб (см. ниже) + поверх него виньетка `radial-gradient(ellipse 62% 58% at 50% 44%, rgba(23,33,43,0) 30%, rgba(23,33,43,0.82) 72%, #17212b 98%)` — гасит края, держит читаемость текста
- Аватар: 124px круг, обводка-градиент `linear-gradient(135deg, #66e197, rgba(102,225,151,0.12))` толщиной 3px + внутренняя рамка 3px цвета фона; фото `public/images/me2.webp`, `object-position: 50% 28%`
- Имя: h1 (см. типографику), text-shadow `0 2px 24px rgba(10,16,22,0.55)`
- Чип роли: «Frontend Developer» — пилюля с точкой 7px primary, фон `rgba(23,33,43,0.55)`, рамка `rgba(102,225,151,0.4)`, `backdrop-filter: blur(4px)`, текст primary 14px/600
- Intro: «Пишу про разработку, обучение и свои проекты. Живу в Москве, веду блог и делюсь заметками.» — 17px, max-width 540px, цвет `#d4dde4`
- Кнопки (gap 12px): **Telegram** — заливка primary, текст `#10301e` 700; **GitHub** — рамка `#3a4f63`, фон `rgba(23,33,43,0.5)` + blur. Обе: padding 13px 26px, radius 12px, `white-space: nowrap`. Hover: Telegram приподнимается на 2px + тень; GitHub — рамка и текст становятся primary. Ссылки: t.me-канал и `https://github.com/ErdniSamkhaev`

**Секция «Последние посты»**:
- Шапка: h2 слева, «Все посты →» (14px, primary, ссылка на `/blog/`) справа, baseline
- Грид: 3 колонки, gap 20px (на мобильном — 1 колонка)
- Показывать 2–3 последних поста (сортировка по `pubDate` desc, фильтр `!draft` — сейчас черновики не фильтруются, это баг)
- Третья ячейка — карточка подписки: пунктирная рамка border, по центру круг 44px с «→», текст «Посты выходят в Telegram первыми», ссылка «Подписаться на канал»; hover: рамка primary + фон `rgba(102,225,151,0.04)`

### Карточка поста v2 (`BlogPost.astro`)

- **Вся карточка — одна ссылка** `<a>` на пост (не отдельная «Читать далее»)
- Структура: обложка → контент (padding 20px 22px 22px, flex column, gap 10px)
- Обложка: `aspect-ratio: 16/9`, `object-fit: cover` из `frontmatter.image.url`; **если image нет** — плейсхолдер: `repeating-linear-gradient(45deg, #243140, #243140 10px, #1f2c3a 10px, #1f2c3a 20px)` с подписью моноширинным 12px `#6d7d8c`. Обязательно фиксированный aspect-ratio — убирает CLS
- Мета: `дата · N мин` — 13px `#8fa0af`, дата в формате «9 июня 2026», `white-space: nowrap`
- Заголовок: Unbounded 500 17px белый
- Описание: 14px `text`, `flex: 1` (прижимает теги к низу)
- Теги: чипы — primary текст 12px на фоне `rgba(102,225,151,0.10)`, radius 6px, padding 4px 10px; href — **слагифицированный** тег
- Hover карточки: `translateY(-5px)` + тень + рамка primary; transition 0.2s

**Состояния:** карточка — `:focus-visible` с видимым кольцом primary (карточка теперь ссылка); у всех интерактивных элементов transition 0.15–0.2s.

### Footer
- Верхняя рамка border; слева ссылки Telegram · GitHub · RSS (14px, hover → primary), справа «© 2026 Erdni Samkhaev» (14px `#8fa0af`)

## 3D-блоб в hero (HeroBlob)

Рабочая реализация — в `Эволюция 3D.dc.html`, класс `Component` (методы `componentDidMount` / `_init` / `componentWillUnmount`). Перенести в Astro-компонент с инлайн `<script>` или отдельным модулем:

- **three.js r160** (UMD или npm-импорт), подключается **только на главной**; бюджет ~150 КБ gzip
- Сцена: `IcosahedronGeometry(1.5, 48)` + `ShaderMaterial`; vertex-шейдер смещает вершины 3D simplex-шумом (`dir * 1.6 + time * 0.18`, амплитуда 0.32) + «выпуклость» в сторону курсора (`pow(dot, 3) * |mouse| * 0.45`); fragment — микс цветов `deep #082819` → `base #66e197` + френель-свечение `#c7ffe0`, альфа 0.92
- Камера: fov 40, z = 4.2; mesh.position.y = 0.25 + лёгкое покачивание `sin(t*0.5)*0.06`
- Курсор: нормализованные координаты окна, лерп 0.045; вращение `y = t*0.1 + mx*0.35`, `x = my*0.22`
- Контейнер канваса: `position: absolute; inset: -40px; pointer-events: none; filter: blur(10px) saturate(1.05)` — блюр даёт «мягкий градиентный» вид
- `setPixelRatio(min(dpr, 1.5))`, прозрачный clearColor, ResizeObserver на ресайз
- **Деградация**: `prefers-reduced-motion: reduce` → отрисовать один кадр без цикла; ошибка WebGL → молча оставить плоский фон `#17212b` (контент не зависит от канваса)
- Очистка: cancelAnimationFrame, dispose geometry/material/renderer, снять слушатели (важно при View Transitions — см. ниже)

Параметры, согласованные с автором: blur 10px, скорость 1.0, сила деформации 1.0.

## Interactions & Behavior

- **View Transitions** (Astro `<ClientRouter />`): плавные переходы между страницами. Внимание: скрипт блоба должен переинициализироваться после `astro:page-load` и чиститься на `astro:before-swap`
- Scroll-reveal карточек: появление снизу (translateY 16px → 0, opacity 0 → 1, ~0.4s ease-out, stagger ~80ms) при входе во вьюпорт (IntersectionObserver); при `prefers-reduced-motion` — без анимации
- Прогресс-бар чтения на странице поста: полоса 3px primary сверху (отдельная задача, не в этом макете)
- Hover-состояния — описаны у каждого компонента выше

## State Management

Состояния нет — статический сайт. Динамика: тема (существующий localStorage-механизм, обернуть в try/catch — см. AUDIT), блоб (время/курсор, внутри скрипта), IntersectionObserver для reveal.

## Assets

- `assets/me2.webp` — фото автора (в репозитории уже есть: `public/images/me2.webp`)
- `assets/post-test.webp` — обложка поста-1 (в репозитории: `public/images/posts/test.webp`)
- Шрифты: Unbounded, Onest — Google Fonts (или self-host через `astro:assets` / fontsource)
- Иконок нет: стрелки — текстовые символы «→», «↗»; точки статуса — CSS-круги

## Files

- `Эволюция 3D.dc.html` — утверждённый hi-fi прототип главной (вёрстка + рабочий three.js-код блоба). Открывается в браузере; секции размечены, все стили инлайновые
- `assets/` — изображения, на которые ссылается прототип
