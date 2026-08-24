import { useEffect, useRef, useState } from "react";
import { initScroll, scrollTo, scrollState } from "./lib/scroll";
import { prefersReduced, isFinePointer, clamp } from "./lib/env";

import SceneCanvas from "./components/SceneCanvas";
import Grain from "./components/Grain";
import Butterfly from "./components/Butterfly";
import Cursor from "./components/Cursor";
import Hud from "./components/Hud";
import SoundToggle from "./components/SoundToggle";
import ChaptersNav from "./components/ChaptersNav";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Ecg from "./components/Ecg";

import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Services from "./components/sections/Services";
import Bloom from "./components/sections/Bloom";
import Contact from "./components/sections/Contact";

export default function App() {
  const [active, setActive] = useState("hero");
  const scrimRef = useRef<HTMLDivElement | null>(null);

  // Плавный скролл (Lenis) — общий на всё приложение.
  useEffect(() => initScroll(), []);

  // Затемняющий слой над WebGL-объектом: прозрачен на hero, темнеет при
  // скролле в контентные секции — чтобы текст оставался читаемым.
  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;
    let raf = 0;
    const frame = () => {
      const vh = window.innerHeight || 800;
      // облако есть во всех секциях, поэтому затемняем мягко — только чтобы
      // читался текст (он высококонтрастный); частицы просвечивают везде
      let op = clamp((scrollState.y - vh * 0.35) / (vh * 0.6), 0, 0.52);
      // у секции контактов ослабляем ещё — там облако по центру
      const contact = document.getElementById("contact");
      if (contact) {
        const r = contact.getBoundingClientRect();
        const enter = clamp((vh - r.top) / vh, 0, 1);
        op *= 1 - enter * 0.5;
      }
      scrim.style.opacity = String(op);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Reveal-анимации: класс reveal-on при входе элемента во вьюпорт.
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (prefersReduced()) {
      els.forEach((el) => el.classList.add("reveal-on"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-on");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.18 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Активная глава для боковой навигации и HUD.
  useEffect(() => {
    const secs = document.querySelectorAll<HTMLElement>("section[id]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { threshold: 0.5 },
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Магнитные кнопки: слегка тянутся к курсору.
  useEffect(() => {
    if (!isFinePointer() || prefersReduced()) return;
    const els = document.querySelectorAll<HTMLElement>("[data-magnet]");
    const cleanups: Array<() => void> = [];
    els.forEach((el) => {
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.28}px, ${dy * 0.32}px)`;
      };
      const onLeave = () => {
        el.style.transform = "";
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Якорные ссылки → плавный скролл через Lenis.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      scrollTo(el as HTMLElement);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <SceneCanvas />
      <div className="vignette" aria-hidden="true" />
      <div className="scrim" ref={scrimRef} aria-hidden="true" />
      <Grain />
      <Butterfly />
      <Cursor />

      <Hud section={active} />
      <SoundToggle />
      <ChaptersNav active={active} />
      <Header />

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
        <Footer />
      </div>
    </>
  );
}
