"use client";

/**
 * "Skip to main content" — the first stop for the Tab key on every page, so a
 * keyboard or switch user can pass the header navigation (WCAG 2.4.1). Hidden
 * until focused.
 *
 * Pages render their own <main> without a shared id, so the link finds it at
 * click time and moves focus there; the plain `#main-content` href is only the
 * fallback.
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      onClick={(e) => {
        const target = document.querySelector<HTMLElement>("main") ?? document.querySelector<HTMLElement>("h1");
        if (!target) return;
        e.preventDefault();
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: "start" });
      }}
    >
      Skip to main content
    </a>
  );
}
