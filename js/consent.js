/* Ezyron · consentimiento de cookies (LSSI art. 22.2, RGPD y guía de cookies de la AEPD).
 *
 * - Hoy la web no instala cookies de analítica ni de publicidad: solo guarda tu elección (técnica, exenta).
 * - Si algún día se añade un script opcional, se escribe así y solo se carga con permiso:
 *     <script type="text/plain" data-cookie-category="analytics" data-src="https://…"></script>
 *   Categorías: analytics, ads. Además se emite el evento `ezyron:consent` con la elección.
 * - Cualquier enlace o botón con [data-cookie-settings] abre la configuración.
 * - La elección dura 12 meses (la AEPD recomienda no superar 24) o hasta que cambie VERSION.
 */
(() => {
  const KEY = 'ezyron_consent', VERSION = 1, DAYS = 365;
  const POLICY = 'politica-de-cookies.html';
  const CATS = ['analytics', 'ads'];

  const read = () => {
    try {
      const c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!c || c.v !== VERSION || Date.now() - c.t > DAYS * 864e5) return null;
      return c;
    } catch (e) { return null; }
  };
  const write = choice => {
    const c = { v: VERSION, t: Date.now(), analytics: !!choice.analytics, ads: !!choice.ads };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    return c;
  };

  /* carga los scripts que esperan permiso */
  const apply = c => {
    document.querySelectorAll('script[type="text/plain"][data-cookie-category]').forEach(old => {
      if (!c[old.dataset.cookieCategory]) return;
      const s = document.createElement('script');
      for (const a of old.attributes) if (a.name !== 'type' && a.name !== 'data-src') s.setAttribute(a.name, a.value);
      if (old.dataset.src) s.src = old.dataset.src; else s.textContent = old.textContent;
      old.replaceWith(s);
    });
    window.dispatchEvent(new CustomEvent('ezyron:consent', { detail: c }));
  };

  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

  const banner = h(`
  <section class="ck" role="region" aria-label="Aviso de cookies" aria-hidden="true">
    <div class="ck-top ck-mono"><span class="ck-dot"></span>Cookies · Tu punto de control</div>
    <h2>Tú decides <span class="ck-serif">qué entra.</span></h2>
    <p>Solo guardamos lo imprescindible para que la web funcione. No usamos cookies de publicidad ni de seguimiento, y si algún día medimos visitas será solo con tu permiso.</p>
    <div class="ck-row">
      <button type="button" class="ck-btn" data-ck="reject"><i></i>Rechazar todas</button>
      <button type="button" class="ck-btn" data-ck="accept"><i></i>Aceptar todas</button>
    </div>
    <div class="ck-links ck-mono">
      <button type="button" data-ck="config">Configurar</button>
      <a href="${POLICY}">Ver política de cookies</a>
    </div>
  </section>`);

  const modal = h(`
  <div class="ckm" role="dialog" aria-modal="true" aria-labelledby="ckm-t" aria-hidden="true">
    <div class="ckm-bg" data-ck="close"></div>
    <div class="ckm-panel" tabindex="-1">
      <div class="ckm-head ck-mono"><span><span class="ck-dot"></span>Configurar cookies</span><button type="button" class="ckm-x" data-ck="close" aria-label="Cerrar"></button></div>
      <h2 id="ckm-t">Cada punto, <span class="ck-serif">a tu manera.</span></h2>
      <p class="ckm-intro">Activa solo lo que quieras. Puedes cambiarlo cuando quieras desde «Configurar cookies», al pie de la web.</p>
      <div class="ckm-list">
        <div class="ckm-cat">
          <div class="ckm-cat-h"><h3>Técnicas</h3><span class="ck-mono ckm-tag">Siempre activas</span></div>
          <p>Necesarias para que la web funcione y para recordar esta elección (<code>ezyron_consent</code>, en tu navegador, 12 meses). No identifican a nadie.</p>
        </div>
        <div class="ckm-cat">
          <div class="ckm-cat-h"><h3 id="ck-l-an">Analíticas</h3><button type="button" class="ck-sw" role="switch" aria-checked="false" aria-labelledby="ck-l-an" data-cat="analytics"></button></div>
          <p>Contar visitas de forma agregada para mejorar la web. <span class="ck-mono">Ahora mismo no usamos ninguna.</span></p>
        </div>
        <div class="ckm-cat">
          <div class="ckm-cat-h"><h3 id="ck-l-ad">Publicidad</h3><button type="button" class="ck-sw" role="switch" aria-checked="false" aria-labelledby="ck-l-ad" data-cat="ads"></button></div>
          <p>Medir campañas o mostrarte anuncios según tu navegación. <span class="ck-mono">Ahora mismo no usamos ninguna.</span></p>
        </div>
      </div>
      <div class="ckm-foot">
        <button type="button" class="ck-btn" data-ck="reject"><i></i>Rechazar todas</button>
        <button type="button" class="ck-btn save" data-ck="save"><i></i>Guardar selección</button>
        <button type="button" class="ck-btn" data-ck="accept"><i></i>Aceptar todas</button>
      </div>
      <p class="ckm-legal ck-mono">Más detalle en la <a href="${POLICY}">política de cookies</a>.</p>
    </div>
  </div>`);

  const toast = h(`<div class="ck-toast ck-mono" role="status" aria-live="polite"><span class="ck-dot"></span><span></span></div>`);
  const ckRoot = document.createElement('div');
  ckRoot.className = 'ck-root';
  ckRoot.append(banner, modal, toast);

  let lastFocus = null, toastT;
  const show = (el, on) => { el.classList.toggle('on', on); el.setAttribute('aria-hidden', on ? 'false' : 'true'); el.inert = !on; };
  const say = msg => { toast.lastChild.textContent = msg; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), 2600); };
  const sws = () => [...modal.querySelectorAll('.ck-sw')];

  const decide = choice => {
    const c = write(choice);
    show(banner, false); closeModal();
    apply(c);
    say(c.analytics || c.ads ? 'Preferencias guardadas' : 'Solo lo imprescindible');
  };
  const openModal = () => {
    const c = read() || { analytics: false, ads: false };
    sws().forEach(s => s.setAttribute('aria-checked', String(!!c[s.dataset.cat])));
    lastFocus = document.activeElement;
    show(modal, true);
    setTimeout(() => modal.querySelector('.ckm-panel').focus({ preventScroll: true }), 50);
  };
  const closeModal = () => {
    if (!modal.classList.contains('on')) return;
    show(modal, false);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };

  ckRoot.addEventListener('click', e => {
    const sw = e.target.closest('.ck-sw');
    if (sw) { sw.setAttribute('aria-checked', String(sw.getAttribute('aria-checked') !== 'true')); return; }
    const b = e.target.closest('[data-ck]'); if (!b) return;
    const a = b.dataset.ck;
    if (a === 'accept') decide({ analytics: true, ads: true });
    else if (a === 'reject') decide({ analytics: false, ads: false });
    else if (a === 'save') { const o = {}; sws().forEach(s => o[s.dataset.cat] = s.getAttribute('aria-checked') === 'true'); decide(o); }
    else if (a === 'config') openModal();
    else if (a === 'close') { closeModal(); if (!read()) show(banner, true); }
  });
  /* teclado: Escape cierra, el foco no se escapa del diálogo */
  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.stopPropagation(); closeModal(); }
    if (e.key !== 'Tab') return;
    const f = [...modal.querySelectorAll('button,a[href]')].filter(x => !x.disabled);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-cookie-settings]');
    if (t) { e.preventDefault(); show(banner, false); openModal(); }
  });

  window.ezyronCookies = { open: openModal, get: read, reset() { try { localStorage.removeItem(KEY); } catch (e) {} show(banner, true); } };

  const init = () => {
    document.body.append(ckRoot);
    show(banner, false); show(modal, false);
    const c = read();
    if (c) { apply(c); return; }
    /* el aviso llega cuando termina la pantalla de carga, como una escena más */
    const html = document.documentElement;
    const reveal = () => setTimeout(() => show(banner, true), 700);
    if (!html.classList.contains('loading')) return reveal();
    const mo = new MutationObserver(() => { if (!html.classList.contains('loading')) { mo.disconnect(); reveal(); } });
    mo.observe(html, { attributes: true, attributeFilter: ['class'] });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
