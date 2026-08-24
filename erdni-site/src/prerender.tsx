import { renderToStaticMarkup } from "react-dom/server";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Services from "./components/sections/Services";
import Bloom from "./components/sections/Bloom";
import Contact from "./components/sections/Contact";
import Ecg from "./components/Ecg";

/**
 * Пререндер: статический снимок контента страницы для поисковиков (Яндекс,
 * Google). Рисуем только смысловые секции — без интерактивных слоёв (частицы,
 * курсор, звук). Результат вшивается в dist/index.html внутрь #root на этапе
 * сборки (scripts/prerender.mjs). При загрузке JS React заменяет его полной
 * интерактивной версией. Эффекты (useEffect) в SSR не выполняются — только
 * разметка с текстом, что и нужно для индексации.
 */
export function render(): string {
  return renderToStaticMarkup(
    <div className="shell">
      <main id="main-content">
        <Hero />
        <Ecg phase={0} />
        <About />
        <Ecg phase={0.33} />
        <Services />
        <Ecg phase={0.66} />
        <Bloom />
        <Contact />
      </main>
    </div>,
  );
}
