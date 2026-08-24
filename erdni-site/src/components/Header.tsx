import { useEffect, useRef } from "react";

/** Фиксированный хедер: получает подложку с блюром после скролла. */
export default function Header() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle("solid", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header ref={ref}>
      <a href="#hero" className="brand">
        <span className="pip" aria-hidden="true" /> Э. Самхаев
      </a>
      <nav className="top" aria-label="Основная навигация">
        <a href="#about">
          <span className="num">01</span>
          <span className="label">Обо мне</span>
        </a>
        <a href="#services">
          <span className="num">02</span>
          <span className="label">Услуги</span>
        </a>
        <a href="#contact">
          <span className="num">03</span>
          <span className="label">Контакты</span>
        </a>
      </nav>
    </header>
  );
}
