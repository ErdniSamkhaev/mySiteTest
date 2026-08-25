import Portrait from "../Portrait";

const readouts = [
  { k: "Пользователей", v: "40 000", sub: "у Chrome-расширения, которое я вёл и поддерживал" },
  { k: "Деплой", v: "1ч→30м", sub: "сократил время релиза, настроив CI/CD" },
  { k: "Front / Back", v: "70/30", sub: "баланс между интерфейсом и сервером" },
  { k: "Языки", v: "RU·EN", sub: "русский — родной, английский — B1" },
];

const skillGroups = [
  {
    title: "Frontend",
    items: [
      "React", "Vue 3", "TypeScript", "JavaScript", "Pinia",
      "Vue Router", "Composition API", "Tailwind", "Vite", "HTML", "CSS",
    ],
  },
  {
    title: "Backend",
    items: ["Node.js", "Express", "Go", "REST API", "WebSocket", "PostgreSQL", "SQL"],
  },
  {
    title: "Инструменты",
    items: [
      "Docker", "GitLab CI/CD", "GitHub Actions", "Git", "Linux",
      "Vitest", "Chrome MV3"
    ],
  },
];

export default function About() {
  return (
    <section className="about" id="about">
      <span className="eyebrow" data-reveal data-fade>
        / Кто я
      </span>
      <h2 className="lines" data-reveal>
        <span className="ln">
          <span>Из неотложки</span>
        </span>
        <span className="ln">
          <span>— в код</span>
        </span>
      </h2>

      <div className="about-grid" data-reveal>
        <Portrait />

        <div>
          <div className="about-copy">
            <p data-fade="1">
              Меня зовут Эрдни. Я разработчик на{" "}
              <span className="accent">Vue 3</span> и{" "}
              <span className="accent">TypeScript</span> с fullstack-практикой:
              примерно 70% фронтенд и 30% бэкенд на Node.js и Express.
            </p>
            <p data-fade="2">
              Несколько лет я работал фельдшером неотложной помощи. Там научился
              держать голову холодной, когда времени мало, а цена ошибки высока.
              Тот же принцип теперь в коде — собранно вести продукт от постановки
              задачи до релиза.
            </p>
          </div>

          <div className="readouts" data-fade="2">
            {readouts.map((r) => (
              <div className="readout" key={r.k}>
                <div className="k">{r.k}</div>
                <div className="v">{r.v}</div>
                <div className="sub">{r.sub}</div>
              </div>
            ))}
          </div>

          <div className="stack-row" data-fade="3">
            <div className="k">Стек</div>
            <div className="skill-groups">
              {skillGroups.map((g) => (
                <div className="skill-group" key={g.title}>
                  <div className="skill-group-title">{g.title}</div>
                  <ul className="chips">
                    {g.items.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
