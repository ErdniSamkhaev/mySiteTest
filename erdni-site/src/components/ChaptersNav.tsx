/** Боковая навигация по главам; активную задаёт App через prop. */
const chapters = [
  { id: "hero", label: "Главная" },
  { id: "about", label: "Обо мне" },
  { id: "services", label: "Услуги" },
  { id: "contact", label: "Контакты" },
];

export default function ChaptersNav({ active }: { active: string }) {
  return (
    <nav className="chapters" aria-label="Разделы">
      {chapters.map((c) => (
        <a
          key={c.id}
          href={`#${c.id}`}
          className={active === c.id ? "active" : undefined}
        >
          <span className="cap">{c.label}</span>
          <span className="dot" aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}
