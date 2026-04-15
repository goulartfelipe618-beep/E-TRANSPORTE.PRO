import { createRoot } from "react-dom/client";
import "./shell.css";

const el = document.getElementById("axus-root");
if (el) {
  const root = createRoot(el);
  let mounted = false;

  const mountChat = async () => {
    if (mounted) return;
    mounted = true;
    const { default: AxusChat } = await import("./components/AxusChat");
    root.render(<AxusChat />);
  };

  const onWindowLoad = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(
        () => {
          void mountChat();
        },
        { timeout: 2500 }
      );
      return;
    }
    window.setTimeout(() => {
      void mountChat();
    }, 1200);
  };

  if (document.readyState === "complete") {
    onWindowLoad();
  } else {
    window.addEventListener("load", onWindowLoad, { once: true });
  }
}
