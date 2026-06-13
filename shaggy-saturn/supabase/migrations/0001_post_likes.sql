-- Лайки постов блога. Выполнить в Supabase: SQL Editor → New query → Run.
-- Анонимные лайки со статического сайта: доступ к таблице только через RPC-функции,
-- сама таблица закрыта RLS (visitor_id наружу не отдаётся, массово удалить чужие лайки нельзя).

create table if not exists public.post_likes (
  slug        text        not null,
  visitor_id  text        not null,
  created_at  timestamptz not null default now(),
  primary key (slug, visitor_id)   -- один лайк с браузера на пост
);

alter table public.post_likes enable row level security;
-- Политик для роли anon НЕ создаём: прямой доступ к таблице запрещён,
-- работаем только через security definer функции ниже.

-- Кол-во лайков поста + лайкнул ли данный посетитель.
create or replace function public.get_post_likes(p_slug text, p_visitor text default null)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'likes', count(*),
    'liked', coalesce(bool_or(visitor_id = p_visitor), false)
  )
  from public.post_likes
  where slug = p_slug;
$$;

-- Поставить/снять лайк, вернуть новое состояние.
create or replace function public.toggle_post_like(p_slug text, p_visitor text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists boolean;
begin
  if p_visitor is null or length(p_visitor) = 0 then
    raise exception 'visitor required';
  end if;

  select exists(
    select 1 from public.post_likes where slug = p_slug and visitor_id = p_visitor
  ) into v_exists;

  if v_exists then
    delete from public.post_likes where slug = p_slug and visitor_id = p_visitor;
  else
    insert into public.post_likes (slug, visitor_id)
    values (p_slug, p_visitor)
    on conflict do nothing;
  end if;

  return (
    select json_build_object(
      'likes', count(*),
      'liked', coalesce(bool_or(visitor_id = p_visitor), false)
    )
    from public.post_likes
    where slug = p_slug
  );
end;
$$;

-- Доступ: только выполнение функций для анонимной роли.
revoke all on function public.get_post_likes(text, text)   from public;
revoke all on function public.toggle_post_like(text, text) from public;
grant execute on function public.get_post_likes(text, text)   to anon;
grant execute on function public.toggle_post_like(text, text) to anon;
