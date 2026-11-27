/* Ezyron · escena 00 «Webs»: portátil dibujado en línea.
 * Al terminar la carga se abre la tapa; al deslizar baja la web de muestra, la tapa se cierra,
 * la cámara pasa a vista cenital y solo queda el punto rojo, que es donde empieza «Origen». */
(() => {
  const sec = document.getElementById('webs'); if (!sec) return;
  const pin = document.getElementById('lp-pin'), lp = document.getElementById('lp'), lid = document.getElementById('lp-lid');
  const view = document.getElementById('lp-view'), ms = document.getElementById('ms'), shade = document.getElementById('lp-shade');
  const cur = document.getElementById('ms-cursor'), dotEl = document.getElementById('lp-dot');
  const txt = [...pin.querySelectorAll('[data-lp="txt"]')], glowEl = pin.querySelector('[data-lp="glow"]');
  const ctaBtn = ms.querySelector('.ms-cta .ms-btn');
  const html = document.documentElement;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SNAP = /[?&]snap/.test(location.search);

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const eOut = t => 1 - Math.pow(1 - t, 3);
  const sst = t => t * t * (3 - 2 * t);

  let G = {}, sp = 0, introT0 = null;
  function layout() {
    const W = innerWidth, H = pin.clientHeight || innerHeight, mob = W <= 900;
    const lw = mob ? Math.min(W * .84, 560) : Math.min(W * .47, H * .84, 980);
    const lh = lw * .64, ld = lh * .9;
    lp.style.setProperty('--lw', lw + 'px'); lp.style.setProperty('--lh', lh + 'px'); lp.style.setProperty('--ld', ld + 'px');
    const hinge = mob ? H * .45 + lh * .4 : H * .5 + lh * .2;
    lp.style.top = (hinge - lh) + 'px';
    const s = view.clientWidth / 960;
    const range = Math.max(0, ms.offsetHeight - view.clientHeight / s);
    const R0 = Math.min(W, H) * .042;
    G = { W, H, mob, lw, lh, ld, hinge, s, range, R0 };
    dotEl.style.width = dotEl.style.height = (R0 * 2) + 'px';
    dotEl.style.margin = `${-R0 - R0 * .25}px 0 0 ${-R0}px`;
  }
  layout();
  addEventListener('resize', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  function frame() {
    const r = sec.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom > -vh && r.top < vh * 1.5) {
      const p = clamp(-r.top / (r.height - vh));
      sp += (p - sp) * (SNAP ? 1 : .12); sp = clamp(sp, p - .035, p + .035); if (Math.abs(p - sp) < 1e-4) sp = p;
      const leave = clamp((-r.top - (r.height - vh)) / vh);

      // entrada: la tapa se abre cuando termina la pantalla de carga
      if (introT0 === null && !html.classList.contains('loading')) introT0 = performance.now();
      const ti = introT0 === null ? 0 : (RM || SNAP ? 1 : clamp((performance.now() - introT0 - 250) / 1700));
      const open = eOut(ti);

      // 1 · la web de muestra baja dentro de la pantalla
      const q = ease(seg(sp, .04, .44));
      ms.style.transform = `scale(${G.s}) translateY(${(-q * G.range).toFixed(1)}px)`;
      // cursor que va a «Pide cita» y pulsa
      const cv = seg(sp, .3, .4) * (1 - seg(sp, .5, .54));
      if (cv > 0) {
        const bx = (ctaBtn.offsetLeft + ctaBtn.offsetWidth * .5), by = (ctaBtn.offsetTop + ctaBtn.offsetHeight * .6) - q * G.range;
        const k = ease(seg(sp, .32, .44));
        const x = lerp(view.clientWidth * .82, bx * G.s, k), y = lerp(view.clientHeight * .95, by * G.s, k);
        const press = seg(sp, .44, .46) * (1 - seg(sp, .46, .48));
        cur.style.opacity = cv.toFixed(3);
        cur.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${(1 - press * .25).toFixed(3)})`;
        ctaBtn.style.transform = `scale(${(1 - press * .06).toFixed(3)})`;
      } else cur.style.opacity = 0;

      // 2 · la tapa se cierra
      const c = ease(seg(sp, .5, .72));
      const ang = lerp(lerp(-88, 10, open), -90, c);
      lid.style.transform = `translateY(${(-c * 3).toFixed(2)}px) rotateX(${ang.toFixed(2)}deg)`;
      shade.style.opacity = Math.max(1 - open, c * .92).toFixed(3);

      // 3 · vista cenital: la tapa cerrada se ve desde arriba y su punto va al centro
      const k = ease(seg(sp, .7, .88));
      const cam = lerp(18, 90, k);
      const target = (G.H / 2 - G.R0 * .25) - (G.hinge + G.ld / 2);
      const sc = lerp(1, G.mob ? .9 : .78, k);
      const tx = G.mob ? 0 : G.W * .15 * (1 - Math.max(c, k));
      lp.style.transform = `translateX(${tx.toFixed(1)}px) translateY(${(target * k).toFixed(1)}px) scale(${sc.toFixed(3)}) rotateX(${(-cam).toFixed(2)}deg)`;
      lp.style.opacity = ((1 - sst(seg(sp, .88, .97))) * (introT0 === null ? 0 : clamp(ti * 3))).toFixed(3);

      // 4 · queda el punto (el mismo que abre «Origen»)
      const d = sst(seg(sp, .86, .95));
      dotEl.style.opacity = d.toFixed(3);
      const startD = G.lw * .07 * sc / (G.R0 * 2);
      dotEl.style.transform = `scale(${lerp(startD, 1, sst(seg(sp, .88, .98))).toFixed(3)})`;

      // textos y luz
      const to = Math.min(sst(seg(ti, .35, .85)), 1 - sst(seg(sp, .4, .5)));
      txt.forEach(el => { el.style.opacity = to.toFixed(3); el.style.transform = `translateY(${((1 - to) * 18).toFixed(1)}px)`; el.style.visibility = to < .01 ? 'hidden' : 'visible'; });
      glowEl.style.opacity = (open * (1 - seg(sp, .55, .8))).toFixed(3);

      // al soltarse, la escena se funde y deja ver «Origen», que ya espera debajo con su punto
      pin.style.opacity = (1 - sst(seg(leave, 0, .22))).toFixed(3);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
