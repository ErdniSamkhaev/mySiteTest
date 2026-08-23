import { useEffect, useRef } from "react";

export default function Footer() {
  const clockRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const tick = () => {
      if (clockRef.current) {
        clockRef.current.textContent = new Date().toLocaleTimeString("ru-RU", {
          hour12: false,
        });
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer>
      <span>© {new Date().getFullYear()} Эрдни Самхаев</span>
      <span>Frontend · Москва</span>
      <span ref={clockRef}>--:--:--</span>
    </footer>
  );
}
