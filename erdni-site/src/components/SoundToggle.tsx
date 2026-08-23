import { useEffect, useRef, useState } from "react";

/**
 * Фоновый ambient-звук синтезируется в браузере (Web Audio) — файла нет.
 * Браузеры блокируют автозвук, поэтому включается по клику. Кнопка вкл/выкл
 * в духе saifullah.dev.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const arpTimer = useRef<number | null>(null);

  const build = () => {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterRef.current = master;

    // мягкий делей для «воздуха»
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.42;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    delay.connect(fb);
    fb.connect(delay);
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    delay.connect(wet);
    wet.connect(master);
    delayRef.current = delay;

    // дрон: две расстроенные пары через lowpass с медленным LFO
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 520;
    lp.Q.value = 6;
    lp.connect(master);
    lp.connect(delay);
    [55, 82.5].forEach((f) => {
      [-0.15, 0.15].forEach((det) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = f;
        o.detune.value = det * 100;
        const g = ctx.createGain();
        g.gain.value = 0.06;
        o.connect(g);
        g.connect(lp);
        o.start();
      });
    });
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 220;
    lfo.connect(lfoG);
    lfoG.connect(lp.frequency);
    lfo.start();

    // арпеджио-колокольчики (пентатоника Am)
    const scale = [0, 3, 5, 7, 10, 12];
    const roots = [110, 110, 146.83, 164.81];
    const arp = () => {
      if (!ctxRef.current || masterRef.current!.gain.value < 0.001) {
        arpTimer.current = window.setTimeout(arp, 1500);
        return;
      }
      const root = roots[(Math.random() * roots.length) | 0];
      const semi =
        scale[(Math.random() * scale.length) | 0] + (Math.random() < 0.3 ? 12 : 0);
      const freq = root * Math.pow(2, semi / 12) * 2;
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq;
      const g = ctx.createGain();
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.09, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
      o.connect(g);
      g.connect(delayRef.current!);
      g.connect(masterRef.current!);
      o.start(now);
      o.stop(now + 2.5);
      arpTimer.current = window.setTimeout(arp, 1600 + Math.random() * 2600);
    };
    arp();
  };

  const toggle = () => {
    const next = !on;
    setOn(next);
    if (next) {
      if (!ctxRef.current) build();
      const ctx = ctxRef.current!;
      if (ctx.state === "suspended") ctx.resume();
      const m = masterRef.current!;
      m.gain.cancelScheduledValues(ctx.currentTime);
      m.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.8);
    } else if (ctxRef.current) {
      const ctx = ctxRef.current;
      const m = masterRef.current!;
      m.gain.cancelScheduledValues(ctx.currentTime);
      m.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    }
  };

  useEffect(() => {
    return () => {
      if (arpTimer.current) clearTimeout(arpTimer.current);
      ctxRef.current?.close();
    };
  }, []);

  return (
    <button
      className={`sound-btn${on ? " on" : ""}`}
      type="button"
      aria-pressed={on}
      onClick={toggle}
    >
      <span className="sound-bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>{on ? "Звук вкл" : "Звук"}</span>
    </button>
  );
}
