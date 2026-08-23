import { useEffect, useRef } from "react";
import { scrollState } from "../lib/scroll";

/** Мониторный HUD: активная секция, часы, координаты, процент прокрутки. */
export default function Hud({ section }: { section: string }) {
  const timeRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const tick = () => {
      if (timeRef.current) {
        timeRef.current.textContent = new Date().toLocaleTimeString("ru-RU", {
          hour12: false,
        });
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);

    let raf = 0;
    const frame = () => {
      if (scrollRef.current) {
        scrollRef.current.textContent = String(
          Math.round(scrollState.progress * 100),
        ).padStart(3, "0");
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      window.clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="hud hud-tr" aria-hidden="true">
        <div>
          <span className="lit">{section.toUpperCase()}</span>
        </div>
        <div ref={timeRef}>--:--:--</div>
      </div>
      <div className="hud hud-bl" aria-hidden="true">
        <div>
          LAT <span className="lit">55.75</span> / LON{" "}
          <span className="lit">37.61</span>
        </div>
        <div>
          СИГНАЛ <span className="lit" ref={scrollRef}>000</span>%
        </div>
      </div>
    </>
  );
}
