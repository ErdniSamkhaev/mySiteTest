import { useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

const TELEGRAM = "https://t.me/just_erdni";
const GITHUB = "https://github.com/ErdniSamkhaev";
const EMAIL = "samkhaev93@gmail.com";

export default function Contact() {
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const openedAt = useRef(Date.now());
  const formRef = useRef<HTMLFormElement | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // анти-спам: honeypot заполнен или форма отправлена быстрее 3 секунд
    const tooFast = Date.now() - openedAt.current < 3000;
    if (data.get("website") || tooFast) {
      setNote("✓ Спасибо! Сообщение отправлено.");
      form.reset();
      return;
    }

    const name = String(data.get("name") ?? "").trim();
    const contact = String(data.get("contact") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !contact || !message) {
      setNote("Заполните, пожалуйста, все поля.");
      return;
    }

    if (!supabase) {
      setNote(`Форма не настроена — напишите в Telegram: ${TELEGRAM}`);
      return;
    }

    setSending(true);
    setNote("Отправляю…");
    const { error } = await supabase
      .from("messages")
      .insert({ name, contact, message });
    setSending(false);

    if (error) {
      setNote("Не получилось отправить. Попробуйте ещё раз или напишите в Telegram.");
      return;
    }
    setNote("✓ Спасибо! Сообщение отправлено — отвечу вам скоро.");
    form.reset();
  };

  return (
    <section className="contact" id="contact">
      <span className="eyebrow" data-reveal data-fade>
        / Связь
      </span>
      <h2 className="lines" data-reveal>
        <span className="ln">
          <span>Обсудим</span>
        </span>
        <span className="ln">
          <span>проект?</span>
        </span>
      </h2>

      <div className="contact-grid" data-reveal>
        <div className="contact-side" data-fade="1">
          <p>
            Расскажите, что хотите сделать, — отвечу и предложу, как это
            реализовать. Или напишите напрямую, так быстрее.
          </p>
          <div className="channels">
            <a className="channel" href={TELEGRAM} target="_blank" rel="noopener" data-cursor="Open">
              <span>Telegram</span>
              <span className="arw">↗</span>
            </a>
            <a className="channel" href={GITHUB} target="_blank" rel="noopener" data-cursor="Open">
              <span>GitHub</span>
              <span className="arw">↗</span>
            </a>
            <a className="channel" href={`mailto:${EMAIL}`} data-cursor="Open">
              <span>Email</span>
              <span className="arw">↗</span>
            </a>
          </div>
        </div>

        <div data-fade="2">
          <form ref={formRef} onSubmit={onSubmit} noValidate>
            <div className="row2">
              <div className="field">
                <label>
                  <span className="lbl">Имя</span>
                  <input type="text" name="name" placeholder="Как к вам обращаться" autoComplete="name" maxLength={100} />
                </label>
              </div>
              <div className="field">
                <label>
                  <span className="lbl">Email или Telegram</span>
                  <input type="text" name="contact" placeholder="Куда ответить" maxLength={200} />
                </label>
              </div>
            </div>
            <div className="field">
              <label>
                <span className="lbl">Сообщение</span>
                <textarea name="message" placeholder="Пара слов о задаче" maxLength={3000} />
              </label>
            </div>

            {/* honeypot: люди поле не видят, боты заполняют */}
            <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
              <label>
                Не заполняйте это поле
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="form-foot">
              <button type="submit" className="btn btn-solid" data-magnet data-cursor="Send" disabled={sending}>
                {sending ? "Отправляю…" : "Отправить →"}
              </button>
              <span className="form-note" role="status" aria-live="polite" style={note.startsWith("✓") ? { color: "var(--signal)" } : undefined}>
                {note}
              </span>
            </div>
            {!supabase && (
              <span className="demo-tag">
              </span>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
