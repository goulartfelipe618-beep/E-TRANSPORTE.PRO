import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import TrackingPage from "./pages/TrackingPage.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/rastreamento/:token" element={<TrackingPage />} />
      <Route path="*" element={<App />} />
    </Routes>
  </BrowserRouter>
);
