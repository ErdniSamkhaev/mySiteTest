export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-inner reveal-on">
        <span className="eyebrow" data-fade>
          Разработчик · Москва
        </span>
        <h1 className="lines">
          <span className="ln">
            <span>Эрдни</span>
          </span>
          <span className="ln">
            <span className="thin">Самхаев</span>
          </span>
        </h1>
        <p className="thesis" data-fade="2">
          Проектирую быстрые интерфейсы и веб-приложения — от первого экрана до
          продакшена.
        </p>
        <div className="actions" data-fade="3">
          <a href="#contact" className="btn btn-solid" data-magnet data-cursor="Связь">
            Связаться →
          </a>
          <a href="#services" className="btn btn-ghost" data-magnet data-cursor="Смотреть">
            Что я делаю
          </a>
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true">
        <span>Листайте</span>
        <span className="track" />
      </div>
    </section>
  );
}
