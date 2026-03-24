import { createRoot } from "react-dom/client";
import AxusChat from "./components/AxusChat";
import "./shell.css";

const el = document.getElementById("axus-root");
if (el) {
  createRoot(el).render(<AxusChat />);
}
