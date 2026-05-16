/** CSS crítico inline — LCP (brand/topbar) sem esperar folhas completas */
export const CRITICAL_HEADER_STYLE = `<style id="critical-header">:root{--bg:#07080b;--text:#f4f6fb;--accent:#c89b3c;--border:rgba(255,255,255,.12);--maxw:1180px}*,*::before,*::after{box-sizing:border-box}html,body{margin:0;padding:0}body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:16px;background:#07080b;color:#f4f6fb;line-height:1.6}.container{width:min(100%,1180px);margin-inline:auto;padding-inline:20px}.topbar{position:sticky;top:0;z-index:1000;background:rgba(10,12,18,.88);border-bottom:1px solid var(--border);backdrop-filter:blur(12px)}.topbar__inner{min-height:74px;display:flex;align-items:center;justify-content:space-between;gap:16px}.brand{font-weight:700;color:var(--text);text-decoration:none}.brand span{color:var(--accent)}.menu .menu__cta.btn--primary{background:#c89b3c;color:#111111;border-color:#a67f2f;font-weight:700}</style>`;

export function asyncStylesheet(href) {
  return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="${href}" /></noscript>`;
}
