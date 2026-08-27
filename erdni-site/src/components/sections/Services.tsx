const services = [
  {
    idx: "/01",
    title: "Сайты и лендинги",
    desc: "Личный сайт, портфолио или лендинг продукта под ключ: дизайн, вёрстка, анимации, SEO-база и деплой. Быстрые, лёгкие, красивые.",
    tags: ["Astro", "Tailwind", "Motion"],
  },
  {
    idx: "/02",
    title: "Веб-приложения",
    desc: "Клиентские приложения на Vue 3 и TypeScript — от интерфейса до REST API на Node.js. Стейт, формы, реальное время.",
    tags: ["Vue 3", "TypeScript", "Pinia", "Node.js"],
  },
  {
    idx: "/03",
    title: "Chrome-расширения",
    desc: "Расширения на Manifest V3 — от идеи до публикации в Chrome Web Store. Есть опыт поддержки расширения на 40 000 пользователей.",
    tags: ["Manifest V3", "Web Store"],
  },
  {
    idx: "/04",
    title: "CI/CD и автоматизация",
    desc: "Настрою пайплайны GitLab CI/CD и Docker так, чтобы деплой занимал минуты, а не часы — и не требовал ручных шагов.",
    tags: ["GitLab CI/CD", "Docker", "Linux"],
  },
];

export default function Services() {
  return (
    <section className="services" id="services">
      <span className="eyebrow" data-reveal data-fade>
        / Что я делаю
      </span>
      <h2 className="lines" data-reveal>
        <span className="ln">
          <span>Чем могу</span>
        </span>
        <span className="ln">
          <span>быть полезен</span>
        </span>
      </h2>

      <div className="catalog" data-reveal>
        {services.map((s, i) => (
          <article
            className="entry"
            key={s.idx}
            data-fade={i < 2 ? "1" : "2"}
            data-cursor={s.idx.replace("/", "")}
          >
            <div className="idx">{s.idx}</div>
            <div className="entry-main">
              <h3>{s.title}</h3>
              <div>
                <p className="desc">{s.desc}</p>
                <ul className="tags">
                  {s.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
