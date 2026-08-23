# Сайт Эрдни Самхаева

Одностраничный сайт-визитка в тёмном кинематографичном стиле: WebGL-объект,
инерционный скролл, кастомный курсор, летящая бабочка, раскрывающийся цветок,
ambient-звук и форма обратной связи в Supabase.

**Стек:** React 18 + TypeScript + Vite. Скролл — [Lenis](https://github.com/darkroomengineering/lenis).
3D-объект — «сырой» WebGL (без тяжёлого 3D-фреймворка). Анимации — CSS +
IntersectionObserver + requestAnimationFrame. Звук — Web Audio (синтез в браузере).

## Запуск

Нужен Node.js 18+.

```bash
npm install
npm run dev
```

Откроется на http://localhost:5173

Прод-сборка:

```bash
npm run build
npm run preview
```

## Форма обратной связи (Supabase)

Форма пишет сообщения в таблицу `messages`. Без переменных окружения сайт
работает, но форма показывает подсказку вместо отправки.

1. Скопируйте `.env.example` в `.env` и подставьте значения из вашего проекта
   Supabase (Project Settings → API):

   ```
   VITE_SUPABASE_URL=https://ваш-проект.supabase.co
   VITE_SUPABASE_ANON_KEY=ваш-anon-ключ
   ```

2. В SQL-редакторе Supabase выполните:

   ```sql
   create table public.messages (
     id uuid primary key default gen_random_uuid(),
     created_at timestamptz not null default now(),
     name text not null check (char_length(name) between 1 and 100),
     contact text not null check (char_length(contact) between 1 and 200),
     message text not null check (char_length(message) between 1 and 3000)
   );

   alter table public.messages enable row level security;

   -- аноним может только вставлять; читать сообщения — из панели Supabase
   create policy "anon can insert" on public.messages
     for insert to anon with check (true);
   ```

Сообщения смотрите в Supabase → Table Editor → `messages`.
anon-ключ публичный — данные защищает RLS: чтение анониму не выдаётся.

Анти-спам: скрытое honeypot-поле + отсечка отправки быстрее 3 секунд.

## Замена фото

Портрет в блоке «Обо мне» — файл `public/images/me2.webp`, который прогоняется
через дизеринг «под зелёный монитор». Замените файл на свой (тем же именем) или
поправьте путь в `src/components/Portrait.tsx`. Обработку (сила дизеринга, число
уровней, цвета) можно настроить там же.

## Что где лежит

```
src/
  App.tsx              — оркестрация: скролл, reveal, активная глава, магнит
  lib/
    scroll.ts          — Lenis + общее состояние скролла (scrollState)
    supabase.ts        — клиент Supabase (null без env)
    env.ts             — хелперы (reduce-motion, pointer, lerp/clamp)
  components/
    SceneCanvas.tsx    — WebGL рэймарч-объект
    Grain.tsx          — плёночное зерно
    Cursor.tsx         — кастомный курсор
    Butterfly.tsx      — бабочка по скроллу
    Ecg.tsx            — ЭКГ-разделитель
    Hud.tsx            — мониторный HUD
    SoundToggle.tsx    — ambient-звук + кнопка
    Portrait.tsx       — портрет с дизерингом
    Header / Footer / ChaptersNav
    sections/          — Hero, About, Services, Bloom (цветок), Contact
```

## Доступность

Уважается `prefers-reduced-motion`: у кого включено «уменьшение движения» —
инерционный скролл, зерно, бабочка и анимация звука отключаются, контент виден
сразу. Курсор, магнит и звук — только на десктопе с мышью.

test