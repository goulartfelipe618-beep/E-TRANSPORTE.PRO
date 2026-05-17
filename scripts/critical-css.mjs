/** CSS crítico inline — primeiro paint (LCP + nav) sem folhas bloqueantes no head */
export const CRITICAL_HEADER_STYLE = `<style id="critical-header">:root{--bg:#07080b;--text:#f4f6fb;--muted:#a7b0c2;--accent:#c89b3c;--border:rgba(255,255,255,.12);--maxw:1180px}*,*::before,*::after{box-sizing:border-box}html,body{margin:0;padding:0}body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:16px;background:#07080b;color:#f4f6fb;line-height:1.6;-webkit-font-smoothing:antialiased}body.menu-open{overflow:hidden}p,li,a,span,button{font-size:1rem}.container{width:min(100%,1180px);margin-inline:auto;padding-inline:20px}.topbar{position:sticky;top:0;z-index:1000;background:rgba(10,12,18,.88);border-bottom:1px solid var(--border);backdrop-filter:blur(12px)}.topbar__inner{min-height:74px;display:flex;align-items:center;justify-content:space-between;gap:16px}.brand{font-weight:700;font-size:1.125rem;line-height:1.2;letter-spacing:-.01em;color:var(--text);text-decoration:none;white-space:nowrap}.brand span{color:#c89b3c;display:inline-block}.menu{display:flex;align-items:center;gap:18px}.menu a{color:var(--muted);text-decoration:none}.menu .menu__cta{min-width:172px;height:44px;background:#c89b3c;color:#111111;border:1px solid #a67f2f;font-weight:700;border-radius:10px}.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:10px;padding:11px 16px;font-weight:600;cursor:pointer}.btn--ghost{border:1px solid var(--border);color:var(--text);background:transparent}.mobile-toggle{display:none}.lead-modal[hidden]{display:none!important}@media (max-width:760px){:root{--maxw:100%}.container{padding-inline:clamp(14px,4.2vw,18px)}.menu{display:none;position:fixed;inset:74px 0 auto 0;left:0;right:0;background:#0d1018;border-bottom:1px solid var(--border);padding:14px clamp(14px,4.2vw,18px) 18px;flex-direction:column;align-items:stretch;gap:12px;z-index:1001;max-height:calc(100dvh - 74px);overflow-y:auto}.menu.is-open{display:flex}.menu .menu__cta{width:100%;min-width:0}.mobile-toggle{display:inline-flex;color:var(--text)}}</style>`;

export function asyncStylesheet(href) {
  return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="${href}" /></noscript>`;
}

/** Folhas completas — não bloqueiam renderização do body */
export function deferredSiteStyles({ page = true, blog = false } = {}) {
  const links = [
    asyncStylesheet("/css/institucional.css"),
    asyncStylesheet("/css/landing.css"),
  ];
  if (page) links.push(asyncStylesheet("/css/page.css"));
  if (blog) links.push(asyncStylesheet("/css/blog.css"));
  return links.join("\n  ");
}
