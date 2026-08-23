import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// StrictMode намеренно не используем: он в dev дважды монтирует эффекты,
// что для WebGL-контекста, Web Audio и rAF-циклов создаёт лишний шум.
createRoot(document.getElementById("root")!).render(<App />);
