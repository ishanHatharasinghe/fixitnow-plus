import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

// Initialize custom scrollbar functionality
function initScrollbar() {
  const html = document.documentElement;
  let scrollTimeout: ReturnType<typeof setTimeout>;

  window.addEventListener("scroll", () => {
    html.classList.add("scrolling");
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(() => {
      html.classList.remove("scrolling");
    }, 2000); // Hide scrollbar 2 seconds after scrolling stops
  });
}

// Initialize on mount
initScrollbar();

function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
